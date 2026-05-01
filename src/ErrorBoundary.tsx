import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('CaiSH render failure:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-[#050505] text-slate-200 flex items-center justify-center p-8">
        <div className="max-w-3xl w-full border border-white/15 bg-slate-950/80 rounded-3xl p-8 shadow-2xl">
          <p className="text-[11px] uppercase tracking-[0.3em] font-black text-blue-400 mb-3">CaiSH Render Error</p>
          <h1 className="text-3xl font-light text-white mb-4">A dashboard module failed to render.</h1>
          <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-400 bg-black/30 rounded-2xl p-4 overflow-auto">
            {this.state.error.message}
          </pre>
        </div>
      </div>
    );
  }
}
