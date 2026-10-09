import React from 'react';
import Button from './Button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              An unexpected error occurred while loading this view. You can reload the page or return to the home screen.
            </p>
            {this.state.error && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs font-mono text-rose-700 mb-6 max-h-32 overflow-y-auto">
                {this.state.error?.message || String(this.state.error)}
              </div>
            )}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="flex-1"
                icon={<RotateCcw className="w-4 h-4" />}
                onClick={this.handleReset}
              >
                Reload Page
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                icon={<Home className="w-4 h-4" />}
                onClick={() => {
                  window.location.href = '/';
                }}
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
