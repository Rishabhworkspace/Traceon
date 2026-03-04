import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Settings } from 'lucide-react';
import GitHubProfileSection from '@/components/dashboard/GitHubProfileSection';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import Link from 'next/link';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen pt-28 pb-12 px-5 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 animate-fade-up">
                <div>
                    <h1 className="text-3xl font-display font-bold text-text-0">
                        Dashboard
                    </h1>
                    <p className="text-sm text-text-3 mt-1 font-mono">
                        Welcome back, {session.user?.name?.split(' ')[0] || 'Developer'}
                    </p>
                </div>
                <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-stroke bg-surface-1 hover:bg-surface-2 transition-colors text-xs font-mono text-text-2"
                >
                    <Settings className="w-3.5 h-3.5" />
                    Settings
                </Link>
            </div>

            <div className="grid lg:grid-cols-4 gap-6 animate-fade-up animate-delay-1">
                {/* Main Content — Metrics */}
                <div className="lg:col-span-3">
                    <DashboardMetrics />
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Profile Card */}
                    <div className="card p-5 border-stroke">
                        <h2 className="text-[10px] font-mono uppercase tracking-widest text-text-3 mb-4">Profile</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] text-text-3 font-mono mb-0.5">Name</p>
                                <p className="text-sm text-text-0 truncate font-medium">{session.user?.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-text-3 font-mono mb-0.5">Email</p>
                                <p className="text-sm text-text-0 truncate font-medium">{session.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-text-3 font-mono mb-0.5">Account</p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald/10 text-emerald border border-emerald/20">
                                    Developer
                                </span>
                            </div>
                        </div>
                        <div className="mt-5 pt-4 border-t border-stroke">
                            <Link href="/profile" className="btn-secondary w-full justify-center text-xs">
                                Edit Profile
                            </Link>
                        </div>
                    </div>

                    {/* GitHub Section */}
                    <GitHubProfileSection />
                </div>
            </div>
        </div>
    );
}
