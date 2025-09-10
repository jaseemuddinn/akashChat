import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
let clientPromise;

// Create a singleton promise for the MongoDB client
if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId } = await params;

        try {
            const client = await clientPromise;
            const db = client.db('akashchat');
            const sessions = db.collection('chat_sessions');

            const chatSession = await sessions.findOne({
                _id: sessionId,
                userId: session.user.id
            });

            if (!chatSession) {
                return NextResponse.json({ error: 'Session not found' }, { status: 404 });
            }

            return NextResponse.json({ session: chatSession });
        } catch (dbError) {
            console.warn('MongoDB connection failed, session not found:', dbError.message);
            // Fallback: return empty session for new sessions
            return NextResponse.json({
                session: {
                    _id: sessionId,
                    messages: []
                }
            });
        }
    } catch (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
