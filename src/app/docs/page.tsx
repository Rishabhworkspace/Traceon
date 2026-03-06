import { Layers, Zap, GitBranch } from 'lucide-react';

export const metadata = {
    title: 'Documentation | Traceon',
    description: 'Learn how to use Traceon to analyze your codebases.',
};

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-surface-0 pt-24 pb-16">
            <div className="mx-auto max-w-4xl px-5">
                <h1 className="text-4xl font-display font-bold text-text-0 mb-4 animate-fade-up">
                    Documentation
                </h1>
                <p className="text-text-2 text-lg mb-12 animate-fade-up animate-delay-1">
                    Everything you need to know about using Traceon effectively.
                </p>

                <div className="grid gap-8 animate-fade-up animate-delay-2">
                    {/* Section 1 */}
                    <div className="card p-6 border border-stroke bg-surface-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-emerald/10 text-emerald">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-text-0">Getting Started</h2>
                        </div>
                        <div className="space-y-4 text-text-2 leading-relaxed">
                            <p>
                                Traceon provides instant codebase analysis without any setup.
                                You can analyze repositories in two ways:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <strong className="text-text-1">Public GitHub URL:</strong> Simply paste the URL of any public JavaScript/TypeScript repository (e.g., <code>https://github.com/facebook/react</code>) on the home page.
                                </li>
                                <li>
                                    <strong className="text-text-1">ZIP Upload:</strong> For private code or local projects, zip your codebase and drag-and-drop it into the upload zone.
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="card p-6 border border-stroke bg-surface-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-amber/10 text-amber">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-text-0">Understanding the Graph</h2>
                        </div>
                        <div className="space-y-4 text-text-2 leading-relaxed">
                            <p>
                                The interactive dependency graph visualizes how your files connect to each other.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Nodes</strong> represent files in your codebase. Color indicates file type (Entry, Component, Utility, etc.).</li>
                                <li><strong>Edges</strong> represent import/export dependencies between files.</li>
                                <li><strong>Toolbar</strong> allows you to search for specific files, filter by node type, and see overall project metrics.</li>
                                <li><strong>Click a node</strong> to open the File Inspector and see precise LOC, import, and export counts.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <div className="card p-6 border border-stroke bg-surface-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-rose/10 text-rose">
                                <GitBranch className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-text-0">Impact Analysis</h2>
                        </div>
                        <div className="space-y-4 text-text-2 leading-relaxed">
                            <p>
                                Determine the risk of making changes to specific files.
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Click the <strong>Impact Analysis</strong> button on the graph page to evaluate risk.</li>
                                <li>Traceon calculates a score (0-100) based on direct dependents, transitive dependents, and code centrality.</li>
                                <li>Identify <strong>Critical Modules</strong>—bottlenecks in your architecture that require careful handling during refactors.</li>
                            </ul>
                        </div>
                    </div>
                    {/* Section 4 */}
                    <div className="card p-6 border border-stroke bg-surface-1">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-indigo/10 text-indigo">
                                <Layers className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-text-0">Advanced Tools</h2>
                        </div>
                        <div className="space-y-4 text-text-2 leading-relaxed">
                            <p>
                                Traceon 2.0 comes with powerful advanced tools to analyze complex code architectures:
                            </p>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Traceon AI:</strong> Open the chat panel to ask natural language questions about your codebase, understand relationships, and generate automated architecture summaries.</li>
                                <li><strong>Time-Travel Diffs:</strong> Use the timeline slider to view your dependency graph at different historical commits. Added dependencies are highlighted in green, and removed ones in red.</li>
                                <li><strong>Monorepo Support:</strong> For workspaces using Turborepo, Nx, or Lerna, open the Workspace Panel to view inter-package boundaries and cross-module dependencies.</li>
                                <li><strong>High-Res Exports:</strong> Export your graph to PNG, SVG, PDF, or download a standalone interactive HTML file to embed in wikis and Notion.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
