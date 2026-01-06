# MSAL Authentication Integration Guide

This guide shows you how to use the MSAL authentication setup in your application.

## Setup Instructions

### 1. Configure Environment Variables

Create a `.env.local` file in the `web` directory:

```bash
# Copy the example file
cp .env.local.example .env.local
```

Then edit `.env.local` and fill in your Azure AD B2C values:

```env
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=your-client-id-from-azure-portal
NEXT_PUBLIC_AZURE_AD_TENANT_NAME=your-tenant-name
NEXT_PUBLIC_AZURE_AD_POLICY=B2C_1_signupsignin1
NEXT_PUBLIC_AZURE_AD_REDIRECT_URI=http://localhost:3000
NEXT_PUBLIC_API_URL=https://dbs501-backend.onrender.com
```

### 2. How to Find Your Azure AD B2C Values

1. **Client ID**:
   - Go to Azure Portal → Azure AD B2C → App registrations
   - Select your application
   - Copy the "Application (client) ID"

2. **Tenant Name**:
   - In Azure AD B2C, look at your tenant name
   - If it's `contoso.onmicrosoft.com`, use `contoso`

3. **Policy Name**:
   - Go to Azure AD B2C → User flows
   - Copy the name of your sign-up/sign-in user flow (e.g., `B2C_1_signupsignin1`)

### 3. Add Login/Logout to Any Page

Import and use the `AuthButton` component:

```jsx
import AuthButton from '@/components/AuthButton';

export default function MyPage() {
  return (
    <div>
      <AuthButton />
      {/* Your page content */}
    </div>
  );
}
```

### 4. Protect a Page (Require Login)

Wrap your page content with `AuthGuard`:

```jsx
import AuthGuard from '@/components/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard>
      <div>
        {/* This content only shows to authenticated users */}
        <h1>Protected Content</h1>
      </div>
    </AuthGuard>
  );
}
```

### 5. Make Authenticated API Calls

Use the `useAccessToken` hook and `apiClient` utilities:

```jsx
import { useEffect, useState } from 'react';
import { useAccessToken } from '@/hooks/useAccessToken';
import { apiGet, apiPost } from '@/utils/apiClient';

export default function MyComponent() {
  const [data, setData] = useState([]);
  const { getAccessToken } = useAccessToken();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the access token
        const token = await getAccessToken();

        // Make authenticated API call
        const result = await apiGet('/staff', token);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const handleUpdate = async (staffData) => {
    try {
      const token = await getAccessToken();
      await apiPost('/updateStaff', staffData, token);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  return (
    <div>
      {/* Your component */}
    </div>
  );
}
```

### 6. Example: Updated Staff Page with Authentication

Here's how to update your staff page (`pages/staff/index.jsx`):

```jsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Spreadsheet from "react-spreadsheet";
import AuthGuard from "@/components/AuthGuard";
import AuthButton from "@/components/AuthButton";
import { useAccessToken } from "@/hooks/useAccessToken";
import { apiGet } from "@/utils/apiClient";

export default function StaffPage() {
  const [data, setData] = useState([]);
  const [reset, setReset] = useState(false);
  const { getAccessToken } = useAccessToken();
  const router = useRouter();

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        // Get access token
        const token = await getAccessToken();

        // Make authenticated API call
        const staffData = await apiGet('/staff', token);

        // Format data for spreadsheet
        const formattedData = staffData.map((item) => [
          { value: item.staff_id, readOnly: true },
          { value: item.first_name, readOnly: true },
          { value: item.last_name, readOnly: true },
          { value: item.position, readOnly: true },
          { value: item.salary.toString() },
          { value: item.mobile_number },
          { value: item.email },
        ]);

        setData(formattedData);
      } catch (err) {
        console.error('Failed to fetch staff data:', err);
        // Optionally: Show error message to user
      }
    };

    fetchStaffData();
    setReset(false);
  }, [reset, getAccessToken]);

  return (
    <AuthGuard>
      <div>
        <div style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h1>Staff Management</h1>
            <AuthButton />
          </div>

          <Spreadsheet
            data={data}
            columnLabels={["Staff Number", "First Name", "Last Name", "Position", "Salary", "Phone", "Email"]}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
```

## Available Components and Utilities

### Components

- **`<AuthButton />`** - Shows login button or user info + logout button
- **`<LoginButton />`** - Just the login button
- **`<LogoutButton />`** - Just the logout button
- **`<AuthGuard>`** - Protects content, requires authentication

### Hooks

- **`useAccessToken()`** - Hook to get access tokens for API calls
  ```jsx
  const { getAccessToken } = useAccessToken();
  const token = await getAccessToken();
  ```

### API Client Functions

- **`apiGet(endpoint, token)`** - GET request
- **`apiPost(endpoint, data, token)`** - POST request
- **`apiPut(endpoint, data, token)`** - PUT request
- **`apiDelete(endpoint, token)`** - DELETE request

All API calls automatically include the Bearer token in the Authorization header.

## Testing

1. Start the development server:
   ```bash
   cd web
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Click "Sign In" to test the login flow
4. Navigate to protected pages to verify authentication

## Troubleshooting

### "No active account" error
- Make sure you're signed in before making API calls
- Wrap API calls in try-catch blocks

### Token not working with backend
- Verify your Azure AD B2C configuration matches the backend
- Check that the `API_AUDIENCE`, `API_ISSUER`, and `API_KEYS_URL` in your backend match your B2C setup

### CORS errors
- Ensure your backend's `APPLICATION_ORIGIN` environment variable includes your frontend URL
- For local development, it should include `http://localhost:3000`

## Next Steps

1. Set up your Azure AD B2C configuration
2. Update your `.env.local` file with the correct values
3. Add `<AuthButton />` to your pages
4. Wrap protected pages with `<AuthGuard>`
5. Update API calls to use the `apiClient` utilities with tokens
