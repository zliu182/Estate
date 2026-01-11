# MSAL Authentication - Quick Start

## 5-Minute Setup

### 1. Configure Environment (Required)

```bash
# In the web directory
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_AZURE_AD_CLIENT_ID=<your-client-id>
NEXT_PUBLIC_AZURE_AD_TENANT_NAME=<your-tenant-name>
NEXT_PUBLIC_AZURE_AD_POLICY=B2C_1_signupsignin1
```

### 2. Get Azure Values

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to: Azure AD B2C → App registrations → Your App
3. Copy the **Application (client) ID** → This is your `CLIENT_ID`
4. Your tenant name is visible in the overview (e.g., `contoso.onmicrosoft.com` → use `contoso`)
5. Go to: Azure AD B2C → User flows → Copy your sign-in flow name (e.g., `B2C_1_signupsignin1`)

### 3. Test It

```bash
npm run dev
```

Visit http://localhost:3000 and click "Sign In"

## Common Tasks

### Add Login Button to Any Page
```jsx
import AuthButton from '@/components/AuthButton';

<AuthButton />
```

### Protect a Page (Require Login)
```jsx
import AuthGuard from '@/components/AuthGuard';

<AuthGuard>
  <YourContent />
</AuthGuard>
```

### Make API Call with Token
```jsx
import { useAccessToken } from '@/hooks/useAccessToken';
import { apiGet } from '@/utils/apiClient';

const { getAccessToken } = useAccessToken();
const token = await getAccessToken();
const data = await apiGet('/staff', token);
```

## Complete Example

```jsx
import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import AuthButton from '@/components/AuthButton';
import { useAccessToken } from '@/hooks/useAccessToken';
import { apiGet } from '@/utils/apiClient';

export default function MyPage() {
  const [data, setData] = useState([]);
  const { getAccessToken } = useAccessToken();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAccessToken();
        const result = await apiGet('/staff', token);
        setData(result);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <AuthGuard>
      <div>
        <AuthButton />
        <h1>My Protected Page</h1>
        {/* Use your data here */}
      </div>
    </AuthGuard>
  );
}
```

## Need More Help?

- **Detailed Guide**: See `AUTHENTICATION_GUIDE.md`
- **Full Documentation**: See `MSAL_SETUP_README.md`
- **Azure Docs**: https://learn.microsoft.com/azure/active-directory-b2c/
