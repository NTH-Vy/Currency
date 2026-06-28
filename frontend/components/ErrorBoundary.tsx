"use client";

import { Component, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gradient-to-br from-[#11111a] to-[#0a0a0f] border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            
            <h2 className="text-xl font-black text-white font-mono tracking-wide mb-4">
              Something went wrong
            </h2>
            
            <p className="text-slate-400 text-sm mb-6">
              {this.state.error?.message || "An unexpected error occurred. Please try again."}
            </p>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono font-bold text-sm uppercase py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
            >
              <RefreshCw size={14} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
