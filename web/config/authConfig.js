/**
 * MSAL (Microsoft Authentication Library) Configuration
 *
 * This file configures Azure AD B2C authentication for the application.
 * You need to set these environment variables in .env.local:
 *
 * - NEXT_PUBLIC_AZURE_AD_CLIENT_ID: Your Azure AD B2C Application (client) ID
 * - NEXT_PUBLIC_AZURE_AD_TENANT_NAME: Your B2C tenant name (e.g., "yourtenantname" from yourtenantname.b2clogin.com)
 * - NEXT_PUBLIC_AZURE_AD_POLICY: Your sign-in user flow policy name (e.g., "B2C_1_signupsignin")
 *
 * Optional:
 * - NEXT_PUBLIC_AZURE_AD_REDIRECT_URI: Custom redirect URI (defaults to http://localhost:3000)
 */

export const msalConfig = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || '', // Your B2C application's client ID
    authority: `https://${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_NAME}.b2clogin.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_NAME}.onmicrosoft.com/${process.env.NEXT_PUBLIC_AZURE_AD_POLICY}`,
    knownAuthorities: [`${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_NAME}.b2clogin.com`],
    redirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || 'http://localhost:3000',
    postLogoutRedirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || 'http://localhost:3000',
  },
  cache: {
    cacheLocation: 'sessionStorage', // This configures where your cache will be stored
    storeAuthStateInCookie: false, // Set to true for IE 11 or Edge
  },
};

/**
 * Scopes you add here will be prompted for user consent during sign-in.
 * By default, MSAL.js will add OIDC scopes (openid, profile, email) to any login request.
 */
export const loginRequest = {
  scopes: ['openid', 'profile', 'offline_access'],
};

/**
 * Add here the scopes to request when obtaining an access token for API calls
 */
export const tokenRequest = {
  scopes: [
    `https://${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_NAME}.onmicrosoft.com/${process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID}/access_as_user`,
  ],
};
