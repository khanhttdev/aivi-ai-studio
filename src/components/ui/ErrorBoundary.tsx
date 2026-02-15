'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center" role="alert">
                    {/* Glow background */}
                    <div className="absolute w-[300px] h-[300px] bg-red-500/5 blur-[80px] rounded-full" />

                    <div className="relative space-y-6">
                        {/* Icon */}
                        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-red-400" />
                        </div>

                        {/* Text */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-white">Something went wrong</h2>
                            <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed">
                                {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-sm font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#22d3ee]"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-sm font-medium text-red-400 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                                Reload Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
