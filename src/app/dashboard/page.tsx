import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Terminal, History, Settings } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen pt-32 pb-12 px-5 max-w-6xl mx-auto">
            <h1 className="text-3xl font-display font-bold text-text-0 mb-8 animate-fade-up">
                Dashboard
            </h1>

            <div className="grid md:grid-cols-3 gap-6 animate-fade-up animate-delay-1">
                <div className="md:col-span-2 space-y-6">
                    <div className="card p-6 border-stroke">
                        <div className="flex items-center gap-2 mb-4">
                            <History className="w-5 h-5 text-emerald" />
                            <h2 className="text-xl font-mono text-text-0">Analysis History</h2>
                        </div>
                        <div className="p-8 border border-dashed border-stroke rounded-xl flex flex-col items-center justify-center text-center bg-surface-1/50">
                            <Terminal className="w-8 h-8 text-text-3 mb-3" />
                            <p className="text-text-2 font-mono text-sm">
                                You haven't analyzed any repositories yet.
                            </p>
                            <Link href="/" className="btn-cta mt-4 !py-2 !text-sm">
                                Start new analysis
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card p-6 border-stroke">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-mono uppercase tracking-widest text-text-3">Profile</h2>
                            <Settings className="w-4 h-4 text-text-2" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-text-3 font-mono mb-1">Name</p>
                                <p className="text-sm text-text-0 truncate font-medium">{session.user?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-3 font-mono mb-1">Email</p>
                                <p className="text-sm text-text-0 truncate font-medium">{session.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-text-3 font-mono mb-1">Account Type</p>
                                <p className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald/10 text-emerald border border-emerald/20">
                                    Developer
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
