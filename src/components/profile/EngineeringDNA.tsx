// src/components/profile/EngineeringDNA.tsx
import { BrainCircuit, Layers, FileText } from 'lucide-react';

interface EngineeringDNAProps {
    dna: {
        problemSolving: string;
        architectureMaturity: string;
        documentation: string;
    };
}

export function EngineeringDNA({ dna }: EngineeringDNAProps) {
    return (
        <div className="card p-6 flex flex-col animate-fade-up animate-delay-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] !rounded-sm">
            <h3 className="text-xl font-bold text-text-0 mb-6 font-display tracking-tight">Engineering DNA</h3>

            <div className="flex flex-col gap-6">

                {/* Problem Solving */}
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm bg-emerald/5 border border-emerald/30 flex items-center justify-center shrink-0 mt-1 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
                        <BrainCircuit className="w-5 h-5 text-emerald" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-text-0 mb-1">Original Problem Solving</h4>
                        <p className="text-sm text-text-2 leading-relaxed font-mono">{dna.problemSolving}</p>
                    </div>
                </div>

                {/* Vertical Divider line */}
                <div className="w-full h-px bg-stroke/50" />

                {/* Architecture */}
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm bg-amber/5 border border-amber/30 flex items-center justify-center shrink-0 mt-1 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]">
                        <Layers className="w-5 h-5 text-amber" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-text-0 mb-1">Architectural Maturity</h4>
                        <p className="text-sm text-text-2 leading-relaxed font-mono">{dna.architectureMaturity}</p>
                    </div>
                </div>

                <div className="w-full h-px bg-stroke/50" />

                {/* Documentation */}
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-sm bg-surface-3 border border-stroke flex items-center justify-center shrink-0 mt-1 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                        <FileText className="w-5 h-5 text-text-2" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-text-0 mb-1">Documentation & Commits</h4>
                        <p className="text-sm text-text-2 leading-relaxed font-mono">{dna.documentation}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
