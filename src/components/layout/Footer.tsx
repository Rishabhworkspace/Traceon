import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter } from 'lucide-react';

const footerLinks = {
    Product: [
        { label: 'Features', href: '/#features' },
        { label: 'Analyze', href: '/analyze' },
        { label: 'Changelog', href: 'https://github.com/Rishabhworkspace/Traceon/releases' },
    ],
    Resources: [
        { label: 'Documentation', href: '/docs' },
        { label: 'API Reference', href: '/docs' },
        { label: 'Privacy', href: '/docs' },
    ],
};

export default function Footer() {
    return (
        <footer className="border-t border-stroke">
            <div className="mx-auto max-w-6xl px-5 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
                            <Image
                                src="/logo.png"
                                alt="Traceon Logo"
                                width={24}
                                height={24}
                                className="rounded-md"
                            />
                            <span className="text-sm font-semibold font-display text-text-0">
                                traceon
                            </span>
                        </Link>
                        <p className="text-[13px] text-text-2 max-w-xs leading-relaxed mb-5">
                            Open-source codebase intelligence. Visualize dependencies,
                            trace architecture, predict impact.
                        </p>
                        <div className="flex items-center gap-2">
                            <a
                                href="https://github.com/Rishabhworkspace/Traceon"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md text-text-3 hover:text-text-0 hover:bg-surface-2 transition-colors"
                                aria-label="GitHub"
                            >
                                <Github className="w-4 h-4" />
                            </a>
                            <a
                                href="https://twitter.com/rishabh"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md text-text-3 hover:text-text-0 hover:bg-surface-2 transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="mono-label mb-3">{title}</h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-[13px] text-text-2 hover:text-text-0 transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-10 pt-5 border-t border-stroke-subtle flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="text-xs text-text-3 font-mono">
                        © {new Date().getFullYear()} traceon
                    </p>
                    <p className="text-xs text-text-3 font-mono">
                        Built for developers who ship.
                    </p>
                </div>
            </div>
        </footer>
    );
}
