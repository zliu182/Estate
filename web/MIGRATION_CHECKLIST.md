# Migration Checklist - Adding Auth to Existing Pages

Use this checklist to add authentication to your existing pages.

## General Pattern

For each page, you need to:
1. ✅ Add imports
2. ✅ Wrap content with `AuthGuard`
3. ✅ Add `AuthButton` to header/nav
4. ✅ Replace `fetch` calls with `apiClient` + token

## Step-by-Step for Each Page

### Example: pages/staff/index.jsx

**Before:**
```jsx
import { useEffect, useState } from "react";

export default function StaffPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("https://dbs501-backend.onrender.com/staff", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => setData(data));
  }, []);

  return <div>{/* content */}</div>;
}
```

**After:**
```jsx
import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";      // 1. Add import
import AuthButton from "@/components/AuthButton";    // 1. Add import
import { useAccessToken } from "@/hooks/useAccessToken"; // 1. Add import
import { apiGet } from "@/utils/apiClient";          // 1. Add import

export default function StaffPage() {
  const [data, setData] = useState([]);
  const { getAccessToken } = useAccessToken();       // 2. Use hook

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAccessToken();        // 3. Get token
        const result = await apiGet('/staff', token); // 4. Use apiClient
        setData(result);
      } catch (error) {
        console.error('Failed to fetch:', error);
      }
    };
    fetchData();
  }, [getAccessToken]);

  return (
    <AuthGuard>                                       {/* 5. Wrap with AuthGuard */}
      <div>
        <AuthButton />                                {/* 6. Add auth button */}
        {/* rest of content */}
      </div>
    </AuthGuard>
  );
}
```

## Migration Checklist by Page

### ✅ pages/index.js (Home)
- [x] Added `AuthButton` component
- [ ] Consider adding welcome message for logged-in users
- [ ] Optionally protect menu buttons with authentication check

### ⬜ pages/staff/index.jsx
- [ ] Import: `AuthGuard`, `AuthButton`, `useAccessToken`, `apiGet`
- [ ] Wrap content with `<AuthGuard>`
- [ ] Add `<AuthButton />` to header
- [ ] Replace `fetch('/staff')` with `apiGet('/staff', token)`
- [ ] Update any POST/PUT/DELETE calls to use `apiPost`, `apiPut`, `apiDelete`

### ⬜ pages/staff/createEmployee.jsx
- [ ] Import: `AuthGuard`, `AuthButton`, `useAccessToken`, `apiPost`
- [ ] Wrap content with `<AuthGuard>`
- [ ] Add `<AuthButton />` to header
- [ ] Replace form submission `fetch` with `apiPost('/createStaff', formData, token)`

### ⬜ pages/branch/index.jsx
- [ ] Import: `AuthGuard`, `AuthButton`, `useAccessToken`, `apiGet`
- [ ] Wrap content with `<AuthGuard>`
- [ ] Add `<AuthButton />` to header
- [ ] Replace `fetch('/branch')` with `apiGet('/branch', token)`

### ⬜ pages/branch/[branchNo].jsx
- [ ] Import: `AuthGuard`, `AuthButton`, `useAccessToken`, `apiGet`
- [ ] Wrap content with `<AuthGuard>`
- [ ] Add `<AuthButton />` to header
- [ ] Replace branch detail `fetch` with `apiGet(`/branch/${branchNo}`, token)`

### ⬜ pages/branch/createBranch.jsx
- [ ] Import: `AuthGuard`, `AuthButton`, `useAccessToken`, `apiPost`
- [ ] Wrap content with `<AuthGuard>`
- [ ] Add `<AuthButton />` to header
- [ ] Replace form submission with `apiPost('/createBranch', formData, token)`

### ⬜ pages/client/index.jsx
- [ ] Import: `AuthGuard`, `AuthButton`, `useAccessToken`, `apiGet`
- [ ] Wrap content with `<AuthGuard>`
- [ ] Add `<AuthButton />` to header
- [ ] Replace `fetch('/client')` with `apiGet('/client', token)`

### ⬜ pages/client/createClient.jsx
- [ ] Import: `AuthGuard`, `AuthButton`, `useAccessToken`, `apiPost`
- [ ] Wrap content with `<AuthGuard>`
- [ ] Add `<AuthButton />` to header
- [ ] Replace form submission with `apiPost('/createClient', formData, token)`

## Common Patterns

### Pattern 1: Simple GET Request
```jsx
// OLD
fetch('/endpoint').then(res => res.json()).then(data => setData(data));

// NEW
const token = await getAccessToken();
const data = await apiGet('/endpoint', token);
setData(data);
```

### Pattern 2: POST Request with Form Data
```jsx
// OLD
fetch('/endpoint', {
  method: 'POST',
  body: JSON.stringify(formData),
  headers: { 'Content-Type': 'application/json' }
});

// NEW
const token = await getAccessToken();
await apiPost('/endpoint', formData, token);
```

### Pattern 3: Update/PUT Request
```jsx
// OLD
fetch('/endpoint', {
  method: 'PUT',
  body: JSON.stringify(updateData),
  headers: { 'Content-Type': 'application/json' }
});

// NEW
const token = await getAccessToken();
await apiPut('/endpoint', updateData, token);
```

### Pattern 4: Delete Request
```jsx
// OLD
fetch('/endpoint', { method: 'DELETE' });

// NEW
const token = await getAccessToken();
await apiDelete('/endpoint', token);
```

## Testing Each Page

After updating each page:

1. ✅ Start dev server: `npm run dev`
2. ✅ Sign in with Azure AD B2C
3. ✅ Navigate to the page
4. ✅ Verify page loads correctly
5. ✅ Check browser console for errors
6. ✅ Test CRUD operations (Create, Read, Update, Delete)
7. ✅ Sign out and verify page requires login

## Common Issues

### Issue: "No active account" error
**Fix**: Make sure you're calling `getAccessToken()` only when user is logged in (inside `AuthGuard`)

### Issue: API still returns 401
**Fix**:
- Check token is being passed: `console.log(token)` before API call
- Verify backend configuration matches your B2C setup
- Check browser Network tab to see if Authorization header is present

### Issue: useAccessToken not working
**Fix**: Make sure the component is inside `<MsalProvider>` (all pages are since it's in `_app.js`)

### Issue: Too many token requests
**Fix**: Add `getAccessToken` to useEffect dependency array properly:
```jsx
useEffect(() => {
  // ... fetch logic
}, [getAccessToken]); // Add dependency
```

## Need Help?

- **Quick examples**: See `QUICK_START.md`
- **Detailed guide**: See `AUTHENTICATION_GUIDE.md`
- **Full docs**: See `MSAL_SETUP_README.md`
