import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, ChevronDown, Check, Loader2, Maximize2, Minimize2 } from 'lucide-react';

interface AIChatPanelProps {
    repoId: string;
}

const AI_MODELS = [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic' },
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

    const handleFormSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const newMessages: ChatMessage[] = [...messages, { id: Date.now().toString(), role: 'user', content: input }];
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
                    id: Date.now().toString(),
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
            const assistantMessageId = Date.now().toString();

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
                id: Date.now().toString(),
                role: 'assistant',
                content: `An unexpected error occurred: ${errorMessage}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="absolute bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 bg-emerald-600 hover:bg-emerald-500 rounded-full text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95 border border-emerald-400/20"
                aria-label="Open Traceon AI"
            >
                <MessageSquare size={20} />
            </button>
        );
    }

    return (
        <div
            className={`absolute z-50 transition-all duration-300 ease-in-out flex flex-col bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-t-xl rounded-bl-xl ${isExpanded
                ? 'bottom-0 left-0 right-0 h-[60vh] rounded-none sm:bottom-6 sm:left-[auto] sm:right-6 sm:w-[600px] sm:h-[80vh] sm:rounded-xl'
                : 'bottom-6 right-6 w-[360px] sm:w-[400px] h-[500px]'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                    <span className="text-sm font-bold font-display text-white tracking-wide">Traceon AI</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Model Selector Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setModelMenuOpen(!modelMenuOpen)}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-medium text-gray-300 transition-colors"
                        >
                            {AI_MODELS.find(m => m.id === selectedModel)?.name}
                            <ChevronDown size={12} className="opacity-70" />
                        </button>

                        {modelMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setModelMenuOpen(false)} />
                                <div className="absolute top-full mt-1 right-0 w-44 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-20 animate-scale-in">
                                    {AI_MODELS.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel(model.id);
                                                setModelMenuOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-[11px] text-gray-300 hover:text-white hover:bg-white/5 flex items-center justify-between transition-colors"
                                        >
                                            {model.name}
                                            {selectedModel === model.id && <Check size={12} className="text-emerald-500" />}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="h-4 w-px bg-white/10 mx-1" />

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors hidden sm:block"
                        aria-label="Toggle Expand"
                    >
                        {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500/20 rounded transition-colors"
                        aria-label="Close Chat"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-70">
                        <MessageSquare size={32} className="text-emerald-500/50 mb-4" />
                        <h3 className="text-sm font-semibold text-gray-200 mb-2">Ask about this architecture</h3>
                        <p className="text-xs text-gray-400 max-w-[240px] leading-relaxed">
                            Traceon AI has access to the structural context of this repository. Ask it about component dependencies, patterns, or refactoring ideas.
                        </p>
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
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                        className="absolute right-1.5 p-1.5 bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
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
