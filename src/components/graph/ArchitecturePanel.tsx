'use client';

import { useState, useEffect } from 'react';
import { FileText, X, Loader2, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

interface ArchitecturePanelProps {
    repoId: string;
    isOpen: boolean;
    onToggle: () => void;
}

export default function ArchitecturePanel({ repoId, isOpen, onToggle }: ArchitecturePanelProps) {
    const [markdown, setMarkdown] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isOpen || markdown) return;
        setLoading(true);
        setError(null);

        fetch(`/api/architecture/${repoId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setMarkdown(data.data.markdown);
                } else {
                    setError(data.message || 'Failed to generate summary');
                }
            })
            .catch(() => setError('Network error'))
            .finally(() => setLoading(false));
    }, [isOpen, repoId, markdown]);

    const handleCopy = async () => {
        if (!markdown) return;
        await navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-16 left-5 z-40 w-[420px] max-h-[calc(100vh-8rem)] flex flex-col bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                        <FileText size={14} className="text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-none">Architecture Summary</span>
                        <span className="text-[9px] text-blue-400/80 font-mono mt-0.5">Auto-generated documentation</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleCopy}
                        disabled={!markdown}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                    <button
                        onClick={onToggle}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <Loader2 size={24} className="text-blue-400 animate-spin" />
                        <p className="text-xs text-gray-500 font-mono">Analyzing architecture...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4">
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                            {error}
                        </div>
                    </div>
                )}

                {markdown && (
                    <div className="p-4">
                        <MarkdownRenderer content={markdown} />
                    </div>
                )}
            </div>
        </div>
    );
}

/** Simple markdown renderer for the architecture summary */
function MarkdownRenderer({ content }: { content: string }) {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    // Track collapsible sections
    const [collapsedSections, setCollapsedSections] = useState<Set<number>>(new Set());
    const toggleSection = (idx: number) => {
        setCollapsedSections(prev => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    let currentSectionIdx = -1;
    let insideCollapsed = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('# ')) {
            elements.push(
                <h1 key={i} className="text-lg font-bold text-white mb-3 pb-2 border-b border-white/10">
                    {line.substring(2)}
                </h1>
            );
            continue;
        }

        if (line.startsWith('## ')) {
            currentSectionIdx = i;
            insideCollapsed = collapsedSections.has(i);
            const title = line.substring(3);
            elements.push(
                <button
                    key={`section-${i}`}
                    onClick={() => toggleSection(i)}
                    className="w-full flex items-center gap-2 text-left mt-4 mb-2 group"
                >
                    {insideCollapsed
                        ? <ChevronRight size={14} className="text-gray-500 group-hover:text-white transition-colors shrink-0" />
                        : <ChevronDown size={14} className="text-gray-500 group-hover:text-white transition-colors shrink-0" />
                    }
                    <h2 className="text-sm font-semibold text-blue-300 group-hover:text-blue-200 transition-colors">
                        {title}
                    </h2>
                </button>
            );
            continue;
        }

        // If inside a collapsed section, skip content until next section
        if (insideCollapsed && !line.startsWith('## ') && !line.startsWith('# ')) {
            continue;
        }

        if (line.startsWith('- ')) {
            const content = line.substring(2);
            elements.push(
                <div key={i} className="flex items-start gap-2 ml-5 mb-1">
                    <span className="w-1 h-1 rounded-full bg-gray-500 mt-2 shrink-0" />
                    <span className="text-xs text-gray-300 leading-relaxed">
                        <InlineMarkdown text={content} />
                    </span>
                </div>
            );
            continue;
        }

        if (line.startsWith('---')) {
            elements.push(<hr key={i} className="border-white/5 my-4" />);
            continue;
        }

        if (line.startsWith('*') && line.endsWith('*')) {
            elements.push(
                <p key={i} className="text-[10px] text-gray-600 font-mono italic mt-2">
                    {line.replace(/\*/g, '')}
                </p>
            );
            continue;
        }

        if (line.trim()) {
            elements.push(
                <p key={i} className="text-xs text-gray-400 leading-relaxed mb-2">
                    <InlineMarkdown text={line} />
                </p>
            );
        }
    }

    return <>{elements}</>;
}

/** Render inline markdown bold and code */
function InlineMarkdown({ text }: { text: string }) {
    // Handle **bold** and `code`
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={i} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-emerald-300 text-[10px] font-mono">{part.slice(1, -1)}</code>;
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
}
