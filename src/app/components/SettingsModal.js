'use client';

import { X, Settings, Zap, Brain, Rocket, Target, Palette } from 'lucide-react';
import { useState } from 'react';

export default function SettingsModal({ isOpen, onClose, config, setConfig }) {
    const [activeTab, setActiveTab] = useState('models');

    const handleConfigChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const models = [
        {
            value: "Meta-Llama-3-1-8B-Instruct-FP8",
            name: "Llama 3.1 8B",
            desc: "Lightning fast • Low cost",
        },
        {
            value: "Meta-Llama-3-3-70B-Instruct",
            name: "Llama 3.3 70B",
            desc: "Balanced performance",
        },
        {
            value: "Meta-Llama-4-Maverick-17B-128E-Instruct-FP8",
            name: "Llama 4 Maverick 17B",
            desc: "Next-generation model",
        },
        {
            value: "DeepSeek-R1-Distill-Qwen-32B",
            name: "DeepSeek R1 Distill",
            desc: "Reasoning-focused model",
        },
        {
            value: "DeepSeek-V3-1",
            name: "DeepSeek V3.1",
            desc: "Latest DeepSeek model",
        },
        {
            value: "gpt-oss-120b",
            name: "GPT OSS 120B",
            desc: "Open source GPT model",
        },
        {
            value: "Qwen3-235B-A22B-Instruct-2507-FP8",
            name: "Qwen3 235B",
            desc: "Maximum capability",
        }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-600 rounded-lg">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">AI Configuration</h2>
                            <p className="text-gray-400 text-sm">Customize your chat experience</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex h-[calc(90vh-8rem)]">
                    {/* Sidebar Tabs */}
                    <div className="w-64 border-r border-gray-700 p-4">
                        <nav className="space-y-2">
                            {[
                                { id: 'models', label: 'AI Models', icon: Brain },
                                { id: 'parameters', label: 'Parameters', icon: Settings }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${activeTab === tab.id
                                            ? 'bg-red-600 text-white'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        {activeTab === 'models' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Choose AI Model</h3>
                                    <p className="text-gray-400 text-sm mb-6">Select the AI model that best fits your needs</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {models.map((model) => {
                                        const Icon = model.icon;
                                        return (
                                            <button
                                                key={model.value}
                                                onClick={() => handleConfigChange('model', model.value)}
                                                className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:scale-102 ${config.model === model.value
                                                    ? 'border-green-500 bg-green-500/10 shadow-lg'
                                                    : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-4">
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-white font-semibold text-lg">{model.name}</h4>
                                                    <p className="text-gray-400 text-sm">{model.desc}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === 'parameters' && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">Fine-tune Parameters</h3>
                                    <p className="text-gray-400 text-sm mb-6">Adjust how the AI generates responses</p>
                                </div>

                                {/* Temperature */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-white font-medium">Creativity Level</label>
                                            <p className="text-gray-400 text-sm">Controls randomness and creativity</p>
                                        </div>
                                        <span className="px-3 py-1 bg-gray-700 rounded-full text-gray-300 font-mono">
                                            {config.temperature}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="0.1"
                                            value={config.temperature}
                                            onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                                            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                                            <span className="flex items-center">🎯 Focused</span>
                                            <span className="flex items-center">⚖️ Balanced</span>
                                            <span className="flex items-center">🎨 Creative</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Max Tokens */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-white font-medium">Response Length</label>
                                            <p className="text-gray-400 text-sm">Maximum tokens in response</p>
                                        </div>
                                        <span className="px-3 py-1 bg-gray-700 rounded-full text-gray-300 font-mono">
                                            {config.maxTokens}
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="100"
                                            max="4000"
                                            step="100"
                                            value={config.maxTokens}
                                            onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
                                            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                                            <span>💬 Brief</span>
                                            <span>📄 Moderate</span>
                                            <span>📚 Detailed</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
