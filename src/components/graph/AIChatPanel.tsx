import { useState, useRef, useEffect } from 'react';
import { X, Send, ChevronDown, Check, Loader2, Maximize2, Minimize2, Sparkles, GitBranch, AlertTriangle, Layers, Zap } from 'lucide-react';

interface AIChatPanelProps {
    repoId: string;
}

const AI_MODELS = [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'groq', badge: 'Fast' },
    { id: 'llama3.1-8b', name: 'Llama 3.1 8B', provider: 'cerebras', badge: 'Light' },
];

const SUGGESTION_CARDS = [
    {
        icon: GitBranch,
        label: 'Dependency Analysis',
        prompt: 'What are the most critical files in this codebase and why?',
        color: 'from-emerald-500/20 to-emerald-500/5',
        borderColor: 'border-emerald-500/20',
        iconColor: 'text-emerald-400',
    },
    {
        icon: AlertTriangle,
        label: 'Circular Dependencies',
        prompt: 'Are there any circular dependencies in this project? How can I fix them?',
        color: 'from-amber-500/20 to-amber-500/5',
        borderColor: 'border-amber-500/20',
        iconColor: 'text-amber-400',
    },
    {
        icon: Layers,
        label: 'Architecture Overview',
        prompt: 'Give me a high-level overview of how this codebase is structured.',
        color: 'from-blue-500/20 to-blue-500/5',
        borderColor: 'border-blue-500/20',
        iconColor: 'text-blue-400',
    },
    {
        icon: Zap,
        label: 'Refactoring Ideas',
        prompt: 'What are some refactoring suggestions to reduce coupling in this project?',
        color: 'from-purple-500/20 to-purple-500/5',
        borderColor: 'border-purple-500/20',
        iconColor: 'text-purple-400',
    },
];

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function AIChatPanel({ repoId }: AIChatPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
    const [modelMenuOpen, setModelMenuOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const submitMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const newMessages: ChatMessage[] = [...messages, { id: crypto.randomUUID(), role: 'user', content: messageText }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    repoId,
                    model: selectedModel,
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.error || response.statusText;
                const adviceMsg = errorData.message ? `\n\n${errorData.message}` : '';

                setMessages(prev => [...prev, {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: `Error: ${errorMsg}${adviceMsg}`
                }]);
                setIsLoading(false);
                return;
            }

            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';
            const assistantMessageId = crypto.randomUUID();

            setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                assistantMessage += decoder.decode(value, { stream: true });
                setMessages(prev => prev.map(m =>
                    m.id === assistantMessageId ? { ...m, content: assistantMessage } : m
                ));
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Network error';
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `An unexpected error occurred: ${errorMessage}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        await submitMessage(input);
    };

    const handleSuggestionClick = (prompt: string) => {
        setInput('');
        submitMessage(prompt);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="group absolute bottom-6 right-6 z-50 flex items-center gap-2.5 pl-4 pr-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-full text-white shadow-[0_8px_30px_rgba(16,185,129,0.35)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(16,185,129,0.5)] hover:scale-[1.03] active:scale-95 border border-emerald-400/30"
                aria-label="Open Traceon AI"
            >
                <div className="relative">
                    <Sparkles size={18} className="transition-transform duration-300 group-hover:rotate-12" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full animate-ping opacity-75" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full" />
                </div>
                <span className="text-sm font-semibold tracking-wide">Ask AI</span>
            </button>
        );
    }

    return (
        <div
            className={`absolute z-50 transition-all duration-300 ease-in-out flex flex-col bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] ${isExpanded
                ? 'bottom-0 left-0 right-0 h-[60vh] rounded-none sm:bottom-6 sm:left-[auto] sm:right-6 sm:w-[600px] sm:h-[80vh] sm:rounded-xl'
                : 'bottom-6 right-6 w-[360px] sm:w-[400px] h-[520px] rounded-xl'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                        <Sparkles size={14} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold font-display text-white tracking-wide leading-none">Traceon AI</span>
                        <span className="text-[9px] text-emerald-400/80 font-mono mt-0.5">Architecture Assistant</span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {/* Model Selector Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setModelMenuOpen(!modelMenuOpen)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-medium text-gray-300 transition-colors"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {AI_MODELS.find(m => m.id === selectedModel)?.name}
                            <ChevronDown size={12} className="opacity-70" />
                        </button>

                        {modelMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setModelMenuOpen(false)} />
                                <div className="absolute top-full mt-1.5 right-0 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-20">
                                    <div className="px-3 py-2 border-b border-white/5">
                                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">Select Model</span>
                                    </div>
                                    {AI_MODELS.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel(model.id);
                                                setModelMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2.5 text-[11px] text-gray-300 hover:text-white hover:bg-white/5 flex items-center justify-between transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{model.name}</span>
                                                <span className="px-1.5 py-0.5 text-[9px] rounded bg-white/5 text-gray-500 font-mono">{model.badge}</span>
                                            </div>
                                            {selectedModel === model.id && <Check size={12} className="text-emerald-500" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="h-4 w-px bg-white/10 mx-0.5" />

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors hidden sm:block"
                        aria-label="Toggle Expand"
                    >
                        {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
                        aria-label="Close Chat"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col justify-between">
                        {/* Welcome Section */}
                        <div className="flex flex-col items-center text-center pt-4 pb-2">
                            <div className="relative mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                                    <Sparkles size={24} className="text-emerald-400" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-[#0d0d0d]">
                                    <Zap size={10} className="text-white" />
                                </div>
                            </div>
                            <h3 className="text-base font-bold text-white mb-1">What can I help with?</h3>
                            <p className="text-[11px] text-gray-500 max-w-[280px] leading-relaxed">
                                I have full context of your dependency graph. Try one of these:
                            </p>
                        </div>

                        {/* Suggestion Cards */}
                        <div className="grid grid-cols-2 gap-2 pb-2">
                            {SUGGESTION_CARDS.map((card) => (
                                <button
                                    key={card.label}
                                    onClick={() => handleSuggestionClick(card.prompt)}
                                    className={`group relative text-left p-3 rounded-xl bg-gradient-to-b ${card.color} border ${card.borderColor} hover:border-white/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                                >
                                    <card.icon size={16} className={`${card.iconColor} mb-2 transition-transform duration-200 group-hover:scale-110`} />
                                    <div className="text-[11px] font-semibold text-gray-200 leading-tight">{card.label}</div>
                                    <div className="text-[9px] text-gray-500 mt-1 leading-snug line-clamp-2">{card.prompt}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map(m => (
                        <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className="text-[10px] text-gray-500 mb-1 ml-1 font-mono uppercase tracking-wider">
                                {m.role === 'user' ? 'You' : 'Traceon AI'}
                            </div>
                            <div
                                className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user'
                                    ? 'bg-emerald-600 text-white rounded-tr-sm'
                                    : 'bg-[#1c1c1f] border border-white/5 text-gray-200 rounded-tl-sm'
                                    }`}
                                style={{ wordBreak: 'break-word' }}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))
                )}
                {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                    <div className="flex flex-col items-start mt-4">
                        <div className="text-[10px] text-gray-500 mb-1 ml-1 font-mono uppercase tracking-wider">Traceon AI</div>
                        <div className="px-4 py-3 rounded-2xl bg-[#1c1c1f] border border-white/5 rounded-tl-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-emerald-500/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 shrink-0 bg-[#0a0a0c]/80">
                <form
                    onSubmit={handleFormSubmit}
                    className="relative flex items-center"
                >
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything about the codebase..."
                        className="w-full bg-[#1c1c1f] border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-sm text-gray-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-gray-600"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-1.5 p-1.5 bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors hover:bg-emerald-500"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </form>
                <div className="mt-2 text-center">
                    <span className="text-[9px] text-gray-500 font-mono">Traceon AI can make mistakes. Verify critical logic.</span>
                </div>
            </div>
        </div>
    );
}
