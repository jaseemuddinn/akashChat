'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export default function ChatInterface({ config, sessionId, onOpenSidebar }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load messages when sessionId changes
    useEffect(() => {
        if (sessionId) {
            loadSessionMessages();
        }
    }, [sessionId]);

    const loadSessionMessages = async () => {
        try {
            const response = await fetch(`/api/sessions/${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.session && data.session.messages) {
                    // Convert saved messages to the format expected by the UI
                    const formattedMessages = data.session.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }));
                    setMessages(formattedMessages);
                } else {
                    // New session, clear messages
                    setMessages([]);
                }
            } else {
                // Session doesn't exist yet, start with empty messages
                setMessages([]);
            }
        } catch (error) {
            console.error('Error loading session messages:', error);
            setMessages([]);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input.trim(),
                    sessionId,
                    config,
                    conversationHistory: messages
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            const assistantMessage = {
                role: 'assistant',
                content: data.response || 'No response received'
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = {
                role: 'assistant',
                content: `Error: ${error.message}. Please check your API key configuration.`
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    

    return (
        <div className="bg-black h-full flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onOpenSidebar}
                        className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            Chat Session
                        </h3>
                        <p className="text-sm text-gray-500">
                            Session ID: {sessionId}
                        </p>
                    </div>
                </div>
                
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-20">
                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Start a conversation with AkashChat AI</p>
                        <p className="text-sm mt-2">
                            Try asking: &quot;What can you help me with?&quot;
                        </p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                            }`}
                    >
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.role === 'user'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-gray-300'
                            }`}>
                            {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`flex-1 max-w-xs lg:max-w-md xl:max-w-lg ${message.role === 'user' ? 'text-right' : ''
                            }`}>
                            <div className={`p-3 rounded-lg ${message.role === 'user'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-800 text-white'
                                }`}>
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-gray-300" />
                        </div>
                        <div className="flex-1 max-w-xs lg:max-w-md xl:max-w-lg">
                            <div className="p-3 rounded-lg bg-gray-800">
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-300" />
                                    <span className="text-gray-300">Thinking...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-gray-800">
                <form onSubmit={sendMessage} className="flex space-x-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-gray-900 text-white placeholder-gray-400 disabled:opacity-50 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}
