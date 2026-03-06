'use client';

import { useState, useCallback } from 'react';
import { Download, Image, FileImage, FileCode2, Globe, ChevronDown, Check, Loader2, X } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';

interface ExportMenuProps {
    repoId: string;
    repoName?: string;
}

type ExportFormat = 'png' | 'svg' | 'pdf' | 'html';

const EXPORT_OPTIONS: { id: ExportFormat; label: string; description: string; icon: typeof Image }[] = [
    { id: 'png', label: 'PNG Image', description: 'High-res raster image', icon: Image },
    { id: 'svg', label: 'SVG Vector', description: 'Scalable vector graphic', icon: FileImage },
    { id: 'pdf', label: 'PDF Document', description: 'Print-ready document', icon: FileCode2 },
    { id: 'html', label: 'Static HTML', description: 'Standalone interactive viewer', icon: Globe },
];

export default function ExportMenu({ repoId, repoName }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [exporting, setExporting] = useState<ExportFormat | null>(null);
    const [success, setSuccess] = useState<ExportFormat | null>(null);

    const getGraphElement = useCallback((): HTMLElement | null => {
        return document.querySelector('.react-flow') as HTMLElement | null;
    }, []);

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadDataUrl = (dataUrl: string, filename: string) => {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const showSuccess = (format: ExportFormat) => {
        setSuccess(format);
        setTimeout(() => setSuccess(null), 2000);
    };

    const exportPNG = useCallback(async () => {
        const el = getGraphElement();
        if (!el) return;
        setExporting('png');
        try {
            const dataUrl = await toPng(el, {
                backgroundColor: '#080808',
                pixelRatio: 3,
                filter: (node) => {
                    // Exclude controls, minimap, and overlays
                    const cls = node.className?.toString() || '';
                    if (cls.includes('react-flow__controls')) return false;
                    if (cls.includes('react-flow__minimap')) return false;
                    return true;
                },
            });
            const name = repoName || repoId;
            downloadDataUrl(dataUrl, `traceon-${name}-graph.png`);
            showSuccess('png');
        } catch (err) {
            console.error('PNG export failed:', err);
        } finally {
            setExporting(null);
        }
    }, [getGraphElement, repoId, repoName]);

    const exportSVG = useCallback(async () => {
        const el = getGraphElement();
        if (!el) return;
        setExporting('svg');
        try {
            const dataUrl = await toSvg(el, {
                backgroundColor: '#080808',
                filter: (node) => {
                    const cls = node.className?.toString() || '';
                    if (cls.includes('react-flow__controls')) return false;
                    if (cls.includes('react-flow__minimap')) return false;
                    return true;
                },
            });
            // Convert data URL to blob
            const svgData = decodeURIComponent(dataUrl.split(',')[1]);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const name = repoName || repoId;
            downloadBlob(blob, `traceon-${name}-graph.svg`);
            showSuccess('svg');
        } catch (err) {
            console.error('SVG export failed:', err);
        } finally {
            setExporting(null);
        }
    }, [getGraphElement, repoId, repoName]);

    const exportPDF = useCallback(async () => {
        const el = getGraphElement();
        if (!el) return;
        setExporting('pdf');
        try {
            const dataUrl = await toPng(el, {
                backgroundColor: '#080808',
                pixelRatio: 2,
                filter: (node) => {
                    const cls = node.className?.toString() || '';
                    if (cls.includes('react-flow__controls')) return false;
                    if (cls.includes('react-flow__minimap')) return false;
                    return true;
                },
            });

            const img = new window.Image();
            img.src = dataUrl;

            await new Promise<void>((resolve) => {
                img.onload = () => resolve();
            });

            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            // Create PDF in landscape or portrait based on aspect ratio
            const isLandscape = imgWidth > imgHeight;
            const pdf = new jsPDF({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'px',
                format: [imgWidth / 2, imgHeight / 2],
            });

            pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth / 2, imgHeight / 2);

            const name = repoName || repoId;
            pdf.save(`traceon-${name}-graph.pdf`);
            showSuccess('pdf');
        } catch (err) {
            console.error('PDF export failed:', err);
        } finally {
            setExporting(null);
        }
    }, [getGraphElement, repoId, repoName]);

    const exportStaticHTML = useCallback(async () => {
        setExporting('html');
        try {
            const response = await fetch(`/api/graph/${repoId}`);
            if (!response.ok) throw new Error('Failed to fetch graph data');
            const graphResponse = await response.json();

            const res = await fetch('/api/export/static-html', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ graphData: graphResponse.data, repoName: repoName || repoId }),
            });

            if (!res.ok) throw new Error('Failed to generate static HTML');

            const blob = await res.blob();
            const name = repoName || repoId;
            downloadBlob(blob, `traceon-${name}-viewer.html`);
            showSuccess('html');
        } catch (err) {
            console.error('Static HTML export failed:', err);
        } finally {
            setExporting(null);
        }
    }, [repoId, repoName]);

    const handleExport = (format: ExportFormat) => {
        switch (format) {
            case 'png': exportPNG(); break;
            case 'svg': exportSVG(); break;
            case 'pdf': exportPDF(); break;
            case 'html': exportStaticHTML(); break;
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors bg-black/60 backdrop-blur-sm border border-white/[0.06] rounded-lg px-3 py-2 hover:border-emerald-500/30"
                title="Export Graph"
            >
                <Download size={14} />
                Export
                <ChevronDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div
                        className="absolute top-full mt-2 right-0 w-64 z-50 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                        style={{
                            background: 'rgba(13,13,13,0.97)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                            <span className="text-[11px] text-gray-400 font-mono uppercase tracking-wider">Export Graph</span>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={12} />
                            </button>
                        </div>

                        {/* Export Options */}
                        <div className="p-2">
                            {EXPORT_OPTIONS.map((option) => {
                                const isExporting = exporting === option.id;
                                const isSuccess = success === option.id;

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => handleExport(option.id)}
                                        disabled={exporting !== null}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all hover:bg-white/5 disabled:opacity-50 group"
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isSuccess
                                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                                            : 'bg-white/[0.03] border border-white/[0.06] group-hover:border-white/10'
                                            }`}>
                                            {isExporting ? (
                                                <Loader2 size={14} className="text-emerald-400 animate-spin" />
                                            ) : isSuccess ? (
                                                <Check size={14} className="text-emerald-400" />
                                            ) : (
                                                <option.icon size={14} className="text-gray-400 group-hover:text-white transition-colors" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-[12px] font-medium text-gray-200 group-hover:text-white transition-colors">
                                                {option.label}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                                {isExporting ? 'Generating...' : isSuccess ? 'Downloaded!' : option.description}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-2.5 border-t border-white/5">
                            <span className="text-[9px] text-gray-600 font-mono">
                                High-resolution exports • Traceon v2.0
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
