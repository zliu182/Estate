import { useMsal } from '@azure/msal-react';

/**
 * LogoutButton Component
 *
 * Renders a button that signs the user out and clears the session.
 */
export default function LogoutButton() {
  const { instance } = useMsal();

  const handleLogout = () => {
    instance.logoutPopup({
      mainWindowRedirectUri: '/', // Redirect to home page after logout
    }).catch((error) => {
      console.error('Logout error:', error);
    });
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '10px 20px',
        backgroundColor: '#d13438',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
      }}
    >
      Sign Out
    </button>
  );
}
