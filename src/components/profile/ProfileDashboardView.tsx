'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Code2, Dna, ShieldAlert, Activity, Target } from 'lucide-react';
import { DomainExpertise } from '@/components/profile/DomainExpertise';
import { TechStack } from '@/components/profile/TechStack';
import { EngineeringDNA } from '@/components/profile/EngineeringDNA';
import { CodeQualityReport } from '@/components/profile/CodeQualityReport';
import { BuilderMindset } from '@/components/profile/BuilderMindset';
import { RepositoriesList } from '@/components/profile/RepositoriesList';
import { SkillsGrid } from '@/components/profile/SkillsGrid';
import { SquadMatcher } from '@/components/profile/SquadMatcher';

interface ProfileDashboardViewProps {
    data: any; // The full profile data payload from the API
}

type TabId = 'overview' | 'matcher' | 'skills' | 'languages' | 'dna' | 'quality' | 'repositories';

export function ProfileDashboardView({ data }: ProfileDashboardViewProps) {
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
        { id: 'matcher', label: 'Squad Matcher', icon: <Target className="w-4 h-4" /> },
        { id: 'skills', label: 'Domains & Skills', icon: <Code2 className="w-4 h-4" /> },
        { id: 'languages', label: 'Languages & Tech', icon: <Code2 className="w-4 h-4" /> },
        { id: 'repositories', label: 'Repositories', icon: <Code2 className="w-4 h-4" /> },
        { id: 'dna', label: 'Engineering DNA', icon: <Dna className="w-4 h-4" /> },
        { id: 'quality', label: 'Code Quality', icon: <ShieldAlert className="w-4 h-4" /> },
    ] as const;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        <DomainExpertise
                            scores={data.aiAssessment?.domainScores}
                            descriptions={data.aiAssessment?.domainDescriptions}
                        />
                        <BuilderMindset username={data.username} recentCommitsCount={data.techStack ? Object.keys(data.techStack).length * 2 : 15} />
                    </motion.div>
                );
            case 'matcher':
                return (
                    <motion.div
                        key="matcher"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        <SquadMatcher data={data} />
                    </motion.div>
                );
            case 'skills':
                return (
                    <motion.div
                        key="skills"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        <SkillsGrid skillsByDomain={data.aiAssessment?.skillsByDomain || []} />
                    </motion.div>
                );
            case 'languages':
                return (
                    <motion.div
                        key="languages"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        <TechStack languages={data.techStack} />
                    </motion.div>
                );
            case 'repositories':
                return (
                    <motion.div
                        key="repositories"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        <RepositoriesList repositories={data.repositories || []} />
                    </motion.div>
                );
            case 'dna':
                return (
                    <motion.div
                        key="dna"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        <EngineeringDNA dna={data.aiAssessment?.engineeringDNA} />
                    </motion.div>
                );
            case 'quality':
                return (
                    <motion.div
                        key="quality"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-6"
                    >
                        <CodeQualityReport traits={data.aiAssessment?.traits} />
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 w-full">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 shrink-0 mt-6 lg:mt-0">
                <div className="sticky top-24 flex flex-col gap-2">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabId)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all text-sm font-bold font-mono tracking-tight text-left border \${
                                    isActive
                                        ? 'bg-amber/10 border-amber/40 text-amber shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]'
                                        : 'bg-surface-1/50 border-stroke/50 text-text-2 hover:bg-surface-2 hover:border-text-3'
                                }`}
                            >
                                <div className={`shrink-0 \${isActive ? 'text-amber' : 'text-text-3'}`}>
                                    {tab.icon}
                                </div>
                                {tab.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute left-0 w-1 inset-y-0 bg-amber rounded-l-sm"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
                <AnimatePresence mode="wait">
                    {renderTabContent()}
                </AnimatePresence>
            </div>
        </div>
    );
}
