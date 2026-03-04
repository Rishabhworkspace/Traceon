'use client';

import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body style={{ background: '#050505', color: '#fafaf9', fontFamily: 'system-ui' }}>
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    padding: '24px',
                }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <AlertTriangle style={{ width: '24px', height: '24px', color: '#ef4444' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Something went wrong</h2>
                        <p style={{ fontSize: '13px', color: '#71717a', maxWidth: '360px' }}>
                            {error.message || 'An unexpected error occurred. Please try again.'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={reset}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                fontSize: '13px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#fafaf9',
                                cursor: 'pointer',
                            }}
                        >
                            <RefreshCw style={{ width: '14px', height: '14px' }} />
                            Try Again
                        </button>
                        <Link
                            href="/"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                fontSize: '13px',
                                background: '#fafaf9',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#050505',
                                textDecoration: 'none',
                                fontWeight: 600,
                            }}
                        >
                            <Home style={{ width: '14px', height: '14px' }} />
                            Home
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
