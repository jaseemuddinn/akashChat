'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [config, setConfig] = useState({
    temperature: 0.7,
    systemPrompt: 'You are a helpful AI assistant.',
    model: 'Meta-Llama-3-1-8B-Instruct-FP8',
    maxTokens: 1000
  });

  const [sessionId, setSessionId] = useState(() =>
    'session_' + Math.random().toString(36).substr(2, 9)
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userSessions, setUserSessions] = useState([]);
  const [isDbAvailable, setIsDbAvailable] = useState(true);

  // Utility function to add session without duplicates
  const addSessionToList = (newSession) => {
    setUserSessions(prev => {
      // Remove any existing session with the same ID
      const filtered = prev.filter(s => s._id !== newSession._id);
      // Add the new session at the beginning
      return [newSession, ...filtered];
    });
  };

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Fetch user sessions
  useEffect(() => {
    if (session) {
      fetchUserSessions();
    }
  }, [session]);

  const fetchUserSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        // Remove duplicates based on _id
        const uniqueSessions = (data.sessions || []).reduce((acc, session) => {
          if (!acc.find(s => s._id === session._id)) {
            acc.push(session);
          }
          return acc;
        }, []);
        setUserSessions(uniqueSessions);
        setIsDbAvailable(true);
      } else {
        setIsDbAvailable(false);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setIsDbAvailable(false);
    }
  };

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'New Chat' }),
      });

      if (response.ok) {
        const data = await response.json();
        const newSession = data.session;

        // Set the new session ID
        setSessionId(newSession._id);

        // If database is available, refresh the list
        if (isDbAvailable) {
          await fetchUserSessions();
        } else {
          // If database is not available, add the session locally
          addSessionToList(newSession);
        }
      }
    } catch (error) {
      console.error('Error creating session:', error);
      // Fallback to local session
      const newSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
      setSessionId(newSessionId);

      // Add local session to the list
      const localSession = {
        _id: newSessionId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addSessionToList(localSession);
    }
  };

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        config={config}
        setConfig={setConfig}
        sessionId={sessionId}
        setSessionId={setSessionId}
        userSessions={userSessions}
        onNewSession={createNewSession}
        user={session.user}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <ChatInterface
          config={config}
          sessionId={sessionId}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>
    </div>
  );
}
