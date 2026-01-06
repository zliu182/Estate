import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import LoginButton from './LoginButton';
import LogoutButton from './LogoutButton';

/**
 * AuthButton Component
 *
 * Displays login button if user is not authenticated,
 * or user info and logout button if authenticated.
 */
export default function AuthButton() {
  const isAuthenticated = useIsAuthenticated();
  const { accounts } = useMsal();

  if (isAuthenticated && accounts.length > 0) {
    const account = accounts[0];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ fontSize: '14px' }}>
          <div>
            <strong>{account.name || account.username}</strong>
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>{account.username}</div>
        </div>
        <LogoutButton />
      </div>
    );
  }

  return <LoginButton />;
}
