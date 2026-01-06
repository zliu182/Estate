# MSAL Azure AD B2C Integration - Implementation Summary

This document summarizes the MSAL (Microsoft Authentication Library) integration that has been added to your Next.js application.

## What Was Added

### 1. Dependencies Installed
- `@azure/msal-browser` - Core MSAL library for browser-based authentication
- `@azure/msal-react` - React-specific MSAL hooks and components

### 2. Configuration Files

**`config/authConfig.js`**
- MSAL configuration for Azure AD B2C
- Login and token request scopes
- Configurable via environment variables

**`.env.local.example`**
- Template for environment variables
- Copy this to `.env.local` and fill in your Azure AD B2C details

### 3. Components Created

**`components/LoginButton.jsx`**
- Button that triggers Azure AD B2C login popup
- Usage: `<LoginButton />`

**`components/LogoutButton.jsx`**
- Button that signs out the user
- Usage: `<LogoutButton />`

**`components/AuthButton.jsx`**
- Smart component that shows login or logout based on auth state
- Displays user info when logged in
- Usage: `<AuthButton />`

**`components/AuthGuard.jsx`**
- Higher-order component to protect pages
- Shows login prompt if user is not authenticated
- Usage: Wrap your page content
  ```jsx
  <AuthGuard>
    <YourProtectedContent />
  </AuthGuard>
  ```

### 4. Utilities Created

**`utils/apiClient.js`**
- API client functions with automatic Bearer token injection
- Functions: `apiGet`, `apiPost`, `apiPut`, `apiDelete`
- Handles errors and response parsing

**`hooks/useAccessToken.js`**
- Custom React hook to acquire access tokens
- Handles silent token acquisition with popup fallback
- Usage:
  ```jsx
  const { getAccessToken } = useAccessToken();
  const token = await getAccessToken();
  ```

### 5. Modified Files

**`pages/_app.js`**
- Wrapped app with `MsalProvider`
- Initializes MSAL authentication globally

**`pages/index.js`**
- Added `<AuthButton />` component to home page
- Shows example of adding auth to existing pages

## File Structure

```
web/
├── config/
│   └── authConfig.js           # MSAL configuration
├── components/
│   ├── AuthButton.jsx          # Combined login/logout button
│   ├── AuthGuard.jsx           # Page protection component
│   ├── LoginButton.jsx         # Login button
│   └── LogoutButton.jsx        # Logout button
├── hooks/
│   └── useAccessToken.js       # Hook to get access tokens
├── utils/
│   └── apiClient.js            # Authenticated API client
├── pages/
│   ├── _app.js                 # Modified - MSAL provider added
│   └── index.js                # Modified - Auth button added
├── .env.local.example          # Environment variables template
├── AUTHENTICATION_GUIDE.md     # Detailed usage guide
└── MSAL_SETUP_README.md        # This file
```

## How to Configure

### Step 1: Set Up Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Get your Azure AD B2C values from Azure Portal:
   - **Client ID**: Azure Portal → Azure AD B2C → App registrations → Your App → Application (client) ID
   - **Tenant Name**: Your B2C tenant (e.g., `contoso` from `contoso.onmicrosoft.com`)
   - **Policy Name**: Azure AD B2C → User flows → Your sign-in flow name

3. Update `.env.local`:
   ```env
   NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your-client-id
   NEXT_PUBLIC_AZURE_AD_TENANT_NAME=your-tenant-name
   NEXT_PUBLIC_AZURE_AD_POLICY=B2C_1_signupsignin1
   NEXT_PUBLIC_AZURE_AD_REDIRECT_URI=http://localhost:3000
   NEXT_PUBLIC_API_URL=https://dbs501-backend.onrender.com
   ```

### Step 2: Update Your Backend Configuration

Ensure your backend environment variables match:
- `API_KEYS_URL` should point to your B2C keys endpoint
- `API_AUDIENCE` should be your client ID
- `API_ISSUER` should match your B2C issuer URL
- `APPLICATION_ORIGIN` should include your frontend URL

### Step 3: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Click "Sign In" button
4. Complete the Azure AD B2C login flow
5. Verify you see your user info and "Sign Out" button

## How to Use in Your Code

### Add Login/Logout to a Page

```jsx
import AuthButton from '@/components/AuthButton';

export default function MyPage() {
  return (
    <div>
      <AuthButton />
      {/* Your content */}
    </div>
  );
}
```

### Protect a Page (Require Authentication)

```jsx
import AuthGuard from '@/components/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      {/* Only authenticated users see this */}
      <div>Protected Content</div>
    </AuthGuard>
  );
}
```

### Make Authenticated API Calls

```jsx
import { useAccessToken } from '@/hooks/useAccessToken';
import { apiGet } from '@/utils/apiClient';

export default function MyComponent() {
  const { getAccessToken } = useAccessToken();

  const fetchData = async () => {
    try {
      const token = await getAccessToken();
      const data = await apiGet('/staff', token);
      console.log(data);
    } catch (error) {
      console.error('API call failed:', error);
    }
  };

  return <button onClick={fetchData}>Load Data</button>;
}
```

## Common Use Cases

### 1. Updating Existing Pages with Auth

To add authentication to your existing pages (staff, branch, client):

1. Import `AuthGuard` and `AuthButton`
2. Wrap page content with `<AuthGuard>`
3. Add `<AuthButton />` to the header
4. Update fetch calls to use `apiClient` with tokens

See `AUTHENTICATION_GUIDE.md` for a complete example.

### 2. Checking if User is Logged In

```jsx
import { useIsAuthenticated } from '@azure/msal-react';

export default function MyComponent() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <div>
      {isAuthenticated ? (
        <p>You are logged in!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### 3. Getting User Information

```jsx
import { useMsal } from '@azure/msal-react';

export default function MyComponent() {
  const { accounts } = useMsal();

  if (accounts.length > 0) {
    const user = accounts[0];
    return (
      <div>
        <p>Welcome, {user.name}!</p>
        <p>Email: {user.username}</p>
      </div>
    );
  }

  return <p>Not logged in</p>;
}
```

## Migration Checklist

To fully integrate authentication into your app, update these pages:

- [ ] `pages/staff/index.jsx` - Wrap with AuthGuard, update API calls
- [ ] `pages/staff/createEmployee.jsx` - Add authentication
- [ ] `pages/branch/index.jsx` - Wrap with AuthGuard, update API calls
- [ ] `pages/branch/[branchNo].jsx` - Add authentication
- [ ] `pages/branch/createBranch.jsx` - Add authentication
- [ ] `pages/client/index.jsx` - Wrap with AuthGuard, update API calls
- [ ] `pages/client/createClient.jsx` - Add authentication

## Backend Integration

Your backend already has JWT authentication configured in:
- `api/src/b2c/index.ts` - JWT verification logic
- `api/src/expressMiddleware/index.ts` - Auth middleware

The backend expects:
- `Authorization: Bearer <token>` header on all POST requests
- Token must be a valid JWT from your Azure AD B2C

With this MSAL setup, tokens are automatically included via the `apiClient` utilities.

## Troubleshooting

### Issue: "No active account" error
**Solution**: Make sure user is logged in before calling `getAccessToken()`

### Issue: API returns 401 Unauthorized
**Possible causes**:
1. Token not included in request - use `apiClient` utilities
2. Backend configuration mismatch - verify Azure AD B2C settings match
3. Token expired - MSAL should auto-refresh, check browser console

### Issue: Login popup doesn't appear
**Possible causes**:
1. Popup blocked by browser - check browser settings
2. Wrong configuration - verify `.env.local` values
3. Network issue - check Azure AD B2C endpoint is reachable

### Issue: CORS errors
**Solution**: Ensure backend's `APPLICATION_ORIGIN` includes your frontend URL

## Additional Resources

- [MSAL React Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-react)
- [Azure AD B2C Documentation](https://learn.microsoft.com/en-us/azure/active-directory-b2c/)
- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - Detailed usage examples

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify `.env.local` configuration
3. Ensure Azure AD B2C is properly configured
4. Check that backend and frontend configurations match
