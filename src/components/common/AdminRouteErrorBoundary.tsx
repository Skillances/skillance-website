import { Component, type ErrorInfo, type ReactNode } from 'react';
import { sendClientLog } from '@/lib/clientLog';

interface AdminRouteErrorBoundaryProps {
  children: ReactNode;
}

interface AdminRouteErrorBoundaryState {
  hasError: boolean;
}

class AdminRouteErrorBoundary extends Component<AdminRouteErrorBoundaryProps, AdminRouteErrorBoundaryState> {
  state: AdminRouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AdminRouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin route crashed', error, errorInfo);
    sendClientLog({
      source: 'admin-route-error-boundary',
      message: error.message || 'Admin route crashed',
      stack: error.stack,
      componentStack: errorInfo.componentStack || undefined,
      metadata: {
        name: error.name,
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm dark:border-red-500/30 dark:bg-neutral-900">
            <h2 className="text-lg font-semibold text-black dark:text-white">Admin page failed to load</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              A rendering error occurred on this page. Refresh and try again. If it persists, the page data likely contains an invalid record.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminRouteErrorBoundary;
