import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { MongoClient } from 'mongodb';

// AkashChat API configuration
const AKASH_CHAT_API_KEY = process.env.AKASH_CHAT_API_KEY;
const AKASH_CHAT_BASE_URL = process.env.AKASH_CHAT_BASE_URL || 'https://chatapi.akash.network/api/v1';

const client = new MongoClient(process.env.MONGODB_URI);
let clientPromise;

// Create a singleton promise for the MongoDB client
if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function POST(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if API key is configured
        if (!AKASH_CHAT_API_KEY || AKASH_CHAT_API_KEY === 'your_api_key_here') {
            return NextResponse.json(
                {
                    error: 'AkashChat API key not configured. Please add AKASH_CHAT_API_KEY to your .env.local file.'
                },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { message, sessionId, config, conversationHistory } = body;

        // Validate request
        if (!message || !sessionId) {
            return NextResponse.json(
                { error: 'Message and session ID are required' },
                { status: 400 }
            );
        }

        // Connect to MongoDB
        let chatSession = null;
        try {
            const client = await clientPromise;
            const db = client.db('akashchat');
            const sessions = db.collection('chat_sessions');

            // Get or create session
            chatSession = await sessions.findOne({
                _id: sessionId,
                userId: session.user.id
            });

            if (!chatSession) {
                // Create new session if it doesn't exist
                chatSession = {
                    _id: sessionId,
                    userId: session.user.id,
                    title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                await sessions.insertOne(chatSession);
            }
        } catch (dbError) {
            console.warn('MongoDB connection failed, using local session:', dbError.message);
            // Fallback: work without database
            chatSession = {
                _id: sessionId,
                userId: session.user.id,
                title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }

        // Build conversation context
        const messages = [];

        // Add system prompt if provided
        if (config?.systemPrompt) {
            messages.push({
                role: 'system',
                content: config.systemPrompt
            });
        }

        // Add conversation history (last 10 messages to prevent token overflow)
        const recentHistory = (conversationHistory || []).slice(-10);
        messages.push(...recentHistory);

        // Add current user message
        messages.push({
            role: 'user',
            content: message
        });

        // Prepare request to AkashChat API
        const akashChatPayload = {
            model: config?.model || 'Meta-Llama-3-1-8B-Instruct-FP8',
            messages: messages,
            temperature: config?.temperature || 0.7,
            max_tokens: config?.maxTokens || 1000
        };

        console.log('Sending request to AkashChat API:', {
            url: `${AKASH_CHAT_BASE_URL}/chat/completions`,
            payload: akashChatPayload
        });

        // Make request to AkashChat API
        const response = await fetch(`${AKASH_CHAT_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${AKASH_CHAT_API_KEY}`,
            },
            body: JSON.stringify(akashChatPayload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('AkashChat API error:', response.status, errorText);

            let errorMessage = 'Failed to get response from AkashChat API';
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.error?.message || errorMessage;
            } catch (e) {
                // Fallback to status text if JSON parsing fails
                errorMessage = `API Error (${response.status}): ${response.statusText}`;
            }

            return NextResponse.json(
                { error: errorMessage },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('AkashChat API response:', data);

        // Extract the response content
        const assistantResponse = data.choices?.[0]?.message?.content ||
            data.response ||
            'No response received from AI';

        // Save messages to database
        const userMessage = { role: 'user', content: message, timestamp: new Date() };
        const assistantMessage = { role: 'assistant', content: assistantResponse, timestamp: new Date() };

        try {
            const client = await clientPromise;
            const db = client.db('akashchat');
            const sessions = db.collection('chat_sessions');

            await sessions.updateOne(
                { _id: sessionId, userId: session.user.id },
                {
                    $push: {
                        messages: {
                            $each: [userMessage, assistantMessage]
                        }
                    },
                    $set: { updatedAt: new Date() }
                }
            );
        } catch (dbError) {
            console.warn('Failed to save messages to database:', dbError.message);
            // Continue without saving - messages are still in local state
        }

        return NextResponse.json({
            response: assistantResponse,
            session_id: sessionId,
            model: config?.model || 'Meta-Llama-3-1-8B-Instruct-FP8',
            usage: data.usage || null
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + error.message },
            { status: 500 }
        );
    }
}
