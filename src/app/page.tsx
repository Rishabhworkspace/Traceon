'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Search,
  Network,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  Code2,
  FileCode,
  Layers,
} from 'lucide-react';

const features = [
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'AST Parsing',
    description: 'Tree-sitter powered analysis extracts imports, exports, and structural metadata from your code.',
    color: 'text-accent-primary',
    bgColor: 'bg-accent-primary/10',
    borderColor: 'border-accent-primary/20',
  },
  {
    icon: <Network className="w-6 h-6" />,
    title: 'Dependency Graph',
    description: 'Interactive visualization of how your modules connect, with zoom, pan, and click-to-inspect.',
    color: 'text-accent-secondary',
    bgColor: 'bg-accent-secondary/10',
    borderColor: 'border-accent-secondary/20',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Impact Analysis',
    description: 'Know exactly which modules are affected before you change a single line of code.',
    color: 'text-accent-danger',
    bgColor: 'bg-accent-danger/10',
    borderColor: 'border-accent-danger/20',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Instant Results',
    description: 'No signup required. Paste a GitHub URL and get architecture insights in seconds.',
    color: 'text-accent-warning',
    bgColor: 'bg-accent-warning/10',
    borderColor: 'border-accent-warning/20',
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Smart Metrics',
    description: 'Dependency density, critical modules, and risk scores — all calculated automatically.',
    color: 'text-accent-success',
    bgColor: 'bg-accent-success/10',
    borderColor: 'border-accent-success/20',
  },
  {
    icon: <FileCode className="w-6 h-6" />,
    title: 'File Inspector',
    description: 'Click any node to see file details: imports, exports, LOC, dependencies, and dependents.',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
  },
];

const steps = [
  {
    step: '01',
    title: 'Paste a GitHub URL',
    description: 'Drop any public repository URL into the input — no signup needed for guest mode.',
    icon: <GitBranch className="w-8 h-8" />,
  },
  {
    step: '02',
    title: 'Automatic Analysis',
    description: 'Traceon clones, scans, parses the AST, and builds the full dependency graph.',
    icon: <Search className="w-8 h-8" />,
  },
  {
    step: '03',
    title: 'Explore & Understand',
    description: 'Navigate the interactive graph, inspect files, and run impact analysis on any module.',
    icon: <Layers className="w-8 h-8" />,
  },
];

export default function LandingPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const router = useRouter();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      router.push(`/analyze?url=${encodeURIComponent(repoUrl.trim())}`);
    }
  };

  return (
    <div className="bg-grid">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Floating decorative nodes */}
        <div className="absolute top-20 left-[10%] w-3 h-3 rounded-full bg-accent-primary/40 animate-float" />
        <div className="absolute top-40 right-[15%] w-2 h-2 rounded-full bg-accent-secondary/40 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-60 left-[20%] w-4 h-4 rounded-full bg-accent-primary/20 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-40 right-[25%] w-2.5 h-2.5 rounded-full bg-accent-success/30 animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-20 left-[30%] w-3.5 h-3.5 rounded-full bg-accent-secondary/20 animate-float" style={{ animationDelay: '4s' }} />

        {/* Radial gradient background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent-primary/5 rounded-full blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-accent-success animate-pulse" />
              <span className="text-xs font-medium text-accent-secondary">Open Source • Free for Developers</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Understand Any
              <br />
              <span className="gradient-text">Codebase Instantly</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              Paste any GitHub URL to visualize architecture, trace dependencies,
              and predict the impact of your changes — no signup required.
            </p>

            {/* Search Input */}
            <form onSubmit={handleAnalyze} className="max-w-2xl mx-auto mb-8">
              <div className="relative flex items-center gap-3 p-2 rounded-2xl bg-bg-secondary border border-border hover:border-border-hover transition-colors glow-primary">
                <div className="pl-4">
                  <GitBranch className="w-5 h-5 text-text-muted" />
                </div>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="flex-1 bg-transparent text-text-primary placeholder-text-muted text-base outline-none py-3"
                  id="repo-url-input"
                />
                <button
                  type="submit"
                  className="btn-primary !rounded-xl flex items-center gap-2 whitespace-nowrap"
                >
                  Analyze
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Trust indicators */}
            <p className="text-sm text-text-muted">
              Works with JavaScript & TypeScript repositories • Guest analysis - no login needed
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to
              <span className="gradient-text"> Navigate Code</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              From AST parsing to impact analysis — Traceon gives you x-ray vision into any repository.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass-card p-7 hover:scale-[1.02] transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.bgColor} border ${feature.borderColor} mb-5`}>
                  <span className={feature.color}>{feature.icon}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Three Steps to
              <span className="gradient-text"> Full Understanding</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Go from unfamiliar repo to full architecture understanding in under 2 minutes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.15 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-14 left-[60%] w-[80%] h-px bg-gradient-to-r from-accent-primary/30 to-transparent" />
                )}

                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 mb-6 animate-pulse-glow">
                  <span className="text-accent-primary">{step.icon}</span>
                </div>

                <div className="text-xs font-mono text-accent-secondary mb-2">{step.step}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-12 sm:p-16 text-center glow-primary"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">Understand Your Code</span>?
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto mb-8">
              Start analyzing repositories for free. No signup, no credit card, no limits on guest analysis.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => {
                  const input = document.getElementById('repo-url-input');
                  input?.focus();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="btn-primary text-lg !px-8 !py-3.5 flex items-center gap-2"
              >
                Analyze a Repository
                <ArrowRight className="w-5 h-5" />
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-lg !px-8 !py-3.5"
              >
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
