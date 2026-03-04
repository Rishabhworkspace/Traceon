'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[300px] flex flex-col items-center justify-center gap-4 p-8">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-sm font-semibold text-text-0 mb-1">Something went wrong</h3>
                        <p className="text-xs text-text-3 max-w-sm">
                            {this.props.fallbackMessage || 'An unexpected error occurred. Please try refreshing.'}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: undefined });
                            window.location.reload();
                        }}
                        className="btn-ghost !text-xs flex items-center gap-2"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Reload
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
