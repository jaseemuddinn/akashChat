import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
let clientPromise;

// Create a singleton promise for the MongoDB client
if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        try {
            const client = await clientPromise;
            const db = client.db('akashchat');
            const sessions = db.collection('chat_sessions');

            const userSessions = await sessions.find({
                userId: session.user.id
            }).sort({ updatedAt: -1 }).toArray();

            return NextResponse.json({ sessions: userSessions });
        } catch (dbError) {
            console.warn('MongoDB connection failed, returning empty sessions:', dbError.message);
            // Fallback: return empty sessions if MongoDB is not available
            return NextResponse.json({ sessions: [] });
        }
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title } = await request.json();

        try {
            const client = await clientPromise;
            const db = client.db('akashchat');
            const sessions = db.collection('chat_sessions');

            const newSession = {
                userId: session.user.id,
                title: title || 'New Chat',
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await sessions.insertOne(newSession);
            newSession._id = result.insertedId;

            return NextResponse.json({ session: newSession });
        } catch (dbError) {
            console.warn('MongoDB connection failed, creating local session:', dbError.message);
            // Fallback: create a local session ID if MongoDB is not available
            const localSession = {
                _id: 'session_' + Math.random().toString(36).substr(2, 9),
                userId: session.user.id,
                title: title || 'New Chat',
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            return NextResponse.json({ session: localSession });
        }
    } catch (error) {
        console.error('Error creating session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
