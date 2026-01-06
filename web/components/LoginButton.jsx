import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../config/authConfig';

/**
 * LoginButton Component
 *
 * Renders a button that initiates the Azure AD B2C login flow using a popup.
 * Users who are already authenticated will not see this button.
 */
export default function LoginButton() {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest).catch((error) => {
      console.error('Login error:', error);
    });
  };

  return (
    <button
      onClick={handleLogin}
      style={{
        padding: '10px 20px',
        backgroundColor: '#0078d4',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
      }}
    >
      Sign In
    </button>
  );
}
