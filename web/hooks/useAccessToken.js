import { useMsal } from '@azure/msal-react';
import { tokenRequest } from '../config/authConfig';

/**
 * Custom hook to acquire access tokens for API calls
 *
 * Usage:
 * const { getAccessToken } = useAccessToken();
 * const token = await getAccessToken();
 *
 * @returns {Object} Object containing getAccessToken function
 */
export function useAccessToken() {
  const { instance, accounts } = useMsal();

  /**
   * Acquires an access token silently, or prompts for login if needed
   * @returns {Promise<string>} Access token
   */
  const getAccessToken = async () => {
    if (accounts.length === 0) {
      throw new Error('No active account. Please sign in.');
    }

    const request = {
      ...tokenRequest,
      account: accounts[0],
    };

    try {
      // Try to acquire token silently
      const response = await instance.acquireTokenSilent(request);
      return response.accessToken;
    } catch (error) {
      // If silent acquisition fails, fall back to interactive method
      if (error.name === 'InteractionRequiredAuthError') {
        try {
          const response = await instance.acquireTokenPopup(request);
          return response.accessToken;
        } catch (popupError) {
          console.error('Token acquisition failed:', popupError);
          throw popupError;
        }
      }
      throw error;
    }
  };

  return { getAccessToken };
}
