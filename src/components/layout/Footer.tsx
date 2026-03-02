import Link from 'next/link';
import { GitBranch, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-border bg-bg-secondary/50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-primary/10 border border-accent-primary/20">
                                <GitBranch className="w-4 h-4 text-accent-primary" />
                            </div>
                            <span className="text-lg font-bold">
                                Trace<span className="gradient-text">on</span>
                            </span>
                        </Link>
                        <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
                            Understand any codebase instantly. Visualize architecture, trace dependencies,
                            and predict the impact of your changes.
                        </p>
                        <div className="flex items-center gap-3 mt-5">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-bg-elevated border border-border hover:border-accent-primary/50 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-4 h-4 text-text-secondary" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-bg-elevated border border-border hover:border-accent-primary/50 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-4 h-4 text-text-secondary" />
                            </a>
                            <a
                                href="mailto:hello@traceon.dev"
                                className="p-2 rounded-lg bg-bg-elevated border border-border hover:border-accent-primary/50 transition-colors"
                                aria-label="Email"
                            >
                                <Mail className="w-4 h-4 text-text-secondary" />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="text-sm font-semibold text-text-primary mb-4">Product</h4>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/analyze" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                                    Analyze Repository
                                </Link>
                            </li>
                            <li>
                                <Link href="#demo" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                                    Live Demo
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-sm font-semibold text-text-primary mb-4">Resources</h4>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="/docs" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                                    Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="/changelog" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                                    Changelog
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                                    Privacy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-text-muted">
                        © 2026 Traceon. Built for developers who ship fast.
                    </p>
                    <p className="text-xs text-text-muted">
                        Made with ❤️ for the open-source community
                    </p>
                </div>
            </div>
        </footer>
    );
}
