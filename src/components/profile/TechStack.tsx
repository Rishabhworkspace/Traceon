'use client';

import { Terminal } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface TechStackProps {
    languages: Record<string, number>;
}

// Map common languages to specific brand colors. Fallback to generic if not found.
const LANGUAGE_COLORS: Record<string, string> = {
    'TypeScript': '#3178c6',
    'JavaScript': '#f1e05a',
    'Python': '#3572A5',
    'Rust': '#dea584',
    'Go': '#00ADD8',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'Ruby': '#701516',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Vue': '#41b883',
    'Shell': '#89e051',
    'Dockerfile': '#384d54'
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface-2 border border-stroke/50 px-3 py-2 shadow-xl backdrop-blur-md rounded-sm">
                <p className="text-sm font-bold text-text-0">{payload[0].name}</p>
                <p className="text-xs font-mono text-text-3">
                    {payload[0].value}% of codebase
                </p>
            </div>
        );
    }
    return null;
};

export function TechStack({ languages }: TechStackProps) {
    if (!languages || Object.keys(languages).length === 0) {
        return (
            <div className="card h-full p-6 flex-1 flex flex-col justify-center items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] !rounded-sm bg-surface-1">
                <p className="text-sm text-text-3 font-mono italic">No language data available.</p>
            </div>
        );
    }

    // Convert object to sorted array and calculate total bytes
    const sortedLanguages = Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8); // Top 8 

    const totalBytes = sortedLanguages.reduce((sum, [, bytes]) => sum + bytes, 0);

    const chartData = sortedLanguages.map(([name, bytes]) => ({
        name,
        value: Number(((bytes / totalBytes) * 100).toFixed(1)),
        color: LANGUAGE_COLORS[name] || '#10b981'
    }));

    return (
        <div className="card h-full p-6 flex-1 flex animate-fade-up animate-delay-2 relative overflow-hidden group shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] !rounded-sm bg-surface-1 hover:!border-amber/40 hover:shadow-[0_0_30px_-10px_rgba(245,158,11,0.15)] transition-all">

            {/* Split Layout: Left Data, Right Chart */}
            <div className="flex flex-col md:flex-row w-full gap-8 relative z-10">

                {/* Left Side: Stats List */}
                <div className="flex flex-col flex-1 shrink-0">
                    <div className="flex items-center gap-3 mb-6 border-b border-stroke/50 pb-4">
                        <div className="w-10 h-10 rounded-sm bg-amber/5 border border-amber/20 flex items-center justify-center shrink-0">
                            <Terminal className="w-5 h-5 text-amber" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-0 font-display tracking-tight">Tech Stack Breakdown</h3>
                            <p className="text-xs text-text-3 font-mono">By volume of code parsed</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {chartData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm group/row hover:bg-surface-2 -mx-2 px-2 py-1 rounded-sm transition-colors cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] shadow-[inset_0_0_2px_rgba(255,255,255,0.4)]" style={{ backgroundColor: item.color }} />
                                    <span className="font-medium text-text-1 group-hover/row:text-text-0 transition-colors">{item.name}</span>
                                </div>
                                <span className="font-mono text-text-3 group-hover/row:text-text-2 transition-colors">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Recharts Donut */}
                <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
                    {/* Inner glowing effect for the donut hole */}
                    <div className="absolute inset-0 m-auto w-32 h-32 bg-amber/5 blur-[50px] rounded-full pointer-events-none" />

                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={75}
                                outerRadius={110}
                                paddingAngle={2}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={2} // Gives the blocks a slight clean edge
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Decorative Background Effects */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-300 pointer-events-none">
                <Terminal className="w-64 h-64 text-amber transform rotate-12" />
            </div>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-amber/0 via-amber/50 to-amber/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber/5 blur-3xl pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
        </div>
    );
}
