'use client';

import { Plus, X, LogOut, MessageSquare, Settings } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import SettingsModal from './SettingsModal';

export default function Sidebar({
    isOpen,
    onClose,
    config,
    setConfig,
    sessionId,
    setSessionId,
    userSessions = [],
    onNewSession,
    user
}) {
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const handleConfigChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const getModelDescription = (model) => {
        if (model.includes('8B')) return 'Fastest responses, lowest cost';
        if (model.includes('17B')) return 'Good balance of speed and quality';
        if (model.includes('32B')) return 'High quality reasoning';
        if (model.includes('70B')) return 'Very high quality, slower';
        if (model.includes('120B')) return 'Excellent quality, high cost';
        if (model.includes('235B')) return 'Massive model, best quality';
        if (model.includes('DeepSeek-V3')) return 'Latest DeepSeek model';
        if (model.includes('DeepSeek-R1')) return 'Reasoning-focused model';
        return 'High-performance model';
    };

    const getDisplayName = (model) => {
        if (model.includes('8B')) return 'Llama 3.1 8B Instruct';
        if (model.includes('70B') && model.includes('3-3')) return 'Llama 3.3 70B Instruct';
        if (model.includes('Maverick')) return 'Llama 4 Maverick 17B';
        if (model.includes('DeepSeek-V3')) return 'DeepSeek V3.1';
        if (model.includes('DeepSeek-R1')) return 'DeepSeek R1 Distill';
        if (model.includes('gpt-oss')) return 'GPT OSS 120B';
        if (model.includes('Qwen3')) return 'Qwen3 235B';
        return model;
    };
    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed lg:relative left-0 top-0 h-full bg-black z-50
        transform transition-transform duration-300 ease-in-out
        w-64 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Header */}
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <span className="text-white font-semibold">akashchat</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* New Chat Button */}
                <div className="p-4 space-y-2">
                    <button
                        onClick={onNewSession}
                        className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Chat</span>
                    </button>

                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="w-full flex items-center space-x-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-white font-medium group"
                    >
                        <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                        <span>AI Settings</span>
                        <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </button>
                </div>

                {/* Chat Sessions */}
                <div className="flex-1 overflow-y-auto px-4">
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">
                        Recent Chats
                    </div>
                    <div className="space-y-1">
                        {userSessions.map((session, index) => (
                            <button
                                key={session._id || `session-${index}`}
                                onClick={() => setSessionId(session._id)}
                                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm text-left ${sessionId === session._id
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                                <span className="truncate">{session.title || 'Untitled Chat'}</span>
                            </button>
                        ))}
                        {userSessions.length === 0 && (
                            <p className="text-gray-500 text-sm">No chats yet</p>
                        )}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="p-4 border-t border-gray-800 space-y-3">
                    {/* Current Model */}
                    <div className="bg-gray-900 rounded-lg p-3">
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">
                            Current Model
                        </div>
                        <div className="text-white font-medium">
                            {getDisplayName(config.model)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            {getModelDescription(config.model)}
                        </div>
                    </div>

                    {/* API Status */}
                    <div className="bg-green-900/20 border border-green-600 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-400 font-medium text-sm">Chat API Connected</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                            AkashChat API is online and ready
                        </div>
                    </div>

                    {/* User Info & Sign Out */}
                    <div className="bg-gray-900 rounded-lg p-3">
                        <div className="flex items-center space-x-3 mb-3">
                            <img
                                src={user?.image || '/default-avatar.png'}
                                alt={user?.name || 'User'}
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-medium text-sm truncate">
                                    {user?.name || 'User'}
                                </div>
                                <div className="text-gray-400 text-xs truncate">
                                    {user?.email}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                config={config}
                setConfig={setConfig}
            />
        </>
    );
}
