'use client';

import { Terminal } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface TechStackProps {
    languages: Record<string, number>;
}

// Expanded language color map
const LANGUAGE_COLORS: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Rust: '#dea584',
    Go: '#00ADD8',
    Java: '#b07219',
    'C++': '#f34b7d',
    'C#': '#178600',
    PHP: '#4F5D95',
    Ruby: '#701516',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Vue: '#41b883',
    Shell: '#89e051',
    Dockerfile: '#384d54',

    C: '#555555',
    Assembly: '#6E4C13',
    Makefile: '#427819',
    Perl: '#0298c3',
    Kotlin: '#A97BFF',
    Swift: '#ffac45',
    Dart: '#00B4AB',
    Lua: '#000080',
    Nim: '#ffc200',
    Zig: '#f7a41d',
    Scala: '#dc322f',
    Haskell: '#5e5086',
    Elixir: '#6e4a7e',
    Clojure: '#5881d8'
};

// Collision-safe color generator
function getLanguageColor(
    language: string,
    usedColors: Set<string>
): string {
    const lang = language.trim();

    if (LANGUAGE_COLORS[lang]) {
        return LANGUAGE_COLORS[lang];
    }

    let hash = 0;
    for (let i = 0; i < lang.length; i++) {
        hash = lang.charCodeAt(i) + ((hash << 5) - hash);
    }

    let hue = Math.abs(hash) % 360;
    const saturation = 70;
    const lightness = 55;

    let color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    // Avoid duplicate colors
    while (usedColors.has(color)) {
        hue = (hue + 37) % 360;
        color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    usedColors.add(color);
    return color;
}

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
                <p className="text-sm text-text-3 font-mono italic">
                    No language data available.
                </p>
            </div>
        );
    }

    const sortedLanguages = Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8);

    const totalBytes = sortedLanguages.reduce(
        (sum, [, bytes]) => sum + bytes,
        0
    );

    // Track used colors
    const usedColors = new Set<string>();

    // FIXED: safe percentage + unique colors
    const chartData = sortedLanguages.map(([name, bytes]) => {
        const percentage =
            totalBytes === 0
                ? 0
                : Number(((bytes / totalBytes) * 100).toFixed(1));

        return {
            name,
            value: percentage,
            color: getLanguageColor(name, usedColors)
        };
    });

    return (
        <div className="card h-full p-6 flex-1 flex animate-fade-up animate-delay-2 relative overflow-hidden group shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] !rounded-sm bg-surface-1 hover:!border-amber/40 hover:shadow-[0_0_30px_-10px_rgba(245,158,11,0.15)] transition-all">

            <div className="flex flex-col md:flex-row w-full gap-8 relative z-10">

                {/* Left */}
                <div className="flex flex-col flex-1 shrink-0">
                    <div className="flex items-center gap-3 mb-6 border-b border-stroke/50 pb-4">
                        <div className="w-10 h-10 rounded-sm bg-amber/5 border border-amber/20 flex items-center justify-center shrink-0">
                            <Terminal className="w-5 h-5 text-amber" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-0 font-display tracking-tight">
                                Tech Stack Breakdown
                            </h3>
                            <p className="text-xs text-text-3 font-mono">
                                By volume of code parsed
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {chartData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm hover:bg-surface-2 -mx-2 px-2 py-1 rounded-sm transition-colors">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="font-medium text-text-1">{item.name}</span>
                                </div>
                                <span className="font-mono text-text-3">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right */}
                <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
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
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={index} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
