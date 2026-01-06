import { useIsAuthenticated } from '@azure/msal-react';
import LoginButton from './LoginButton';

/**
 * AuthGuard Component
 *
 * Wraps protected content and ensures user is authenticated.
 * If not authenticated, shows a login prompt instead of the content.
 *
 * Usage:
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 */
export default function AuthGuard({ children }) {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: '20px',
        }}
      >
        <h2>Authentication Required</h2>
        <p>Please sign in to access this page.</p>
        <LoginButton />
      </div>
    );
  }

  return <>{children}</>;
}
