# Token Management System

Complete JWT token management system using TanStack Query with secure storage.

## 🏗️ Architecture

### Files Structure
```
lib/
├── api/
│   ├── types.ts           # TypeScript types for API responses
│   ├── tokenStorage.ts    # Secure token storage utilities
│   ├── client.ts          # API client with auto token injection
│   └── auth-new.ts        # Authentication API functions
├── hooks/
│   └── useAuth.ts         # TanStack Query hooks for auth
└── providers/
    └── QueryProvider.tsx  # TanStack Query provider
```

## 🔐 Token Storage

Tokens are stored securely in `localStorage` with the following utilities:

```typescript
import { tokenStorage } from '@/lib/api/tokenStorage';

// Save token
tokenStorage.setToken(token);

// Get token
const token = tokenStorage.getToken();

// Remove token
tokenStorage.removeToken();

// Save user data
tokenStorage.setUser(user);

// Get user data
const user = tokenStorage.getUser();

// Clear all auth data
tokenStorage.clearAll();

// Check if authenticated
const isAuth = tokenStorage.isAuthenticated();
```

## 🎯 API Functions

### 1. Generate Token (Exchange Clerk ID)
```typescript
import { generateToken } from '@/lib/api/auth-new';

const response = await generateToken(clerkUserId);
// Automatically stores token and user data
```

### 2. Refresh Token
```typescript
import { refreshToken } from '@/lib/api/auth-new';

const response = await refreshToken(clerkUserId);
// Automatically updates token and user data
```

### 3. Get Current User
```typescript
import { getCurrentUser } from '@/lib/api/auth-new';

const response = await getCurrentUser();
// Returns user from database (not Clerk)
```

### 4. Logout User
```typescript
import { logoutUser } from '@/lib/api/auth-new';

await logoutUser();
// Revokes token on backend and clears local storage
```

## 🪝 TanStack Query Hooks

### useGenerateToken
Generate JWT token by exchanging Clerk user ID:

```typescript
import { useGenerateToken } from '@/lib/hooks/useAuth';

function MyComponent() {
  const generateToken = useGenerateToken();

  const handleLogin = () => {
    generateToken.mutate();
  };

  return (
    <button onClick={handleLogin} disabled={generateToken.isPending}>
      {generateToken.isPending ? 'Generating...' : 'Login'}
    </button>
  );
}
```

### useRefreshToken
Refresh the JWT token:

```typescript
import { useRefreshToken } from '@/lib/hooks/useAuth';

function MyComponent() {
  const refreshToken = useRefreshToken();

  const handleRefresh = () => {
    refreshToken.mutate();
  };

  return (
    <button onClick={handleRefresh}>
      Refresh Token
    </button>
  );
}
```

### useCurrentUser
Get current user from database:

```typescript
import { useCurrentUser } from '@/lib/hooks/useAuth';

function UserProfile() {
  const { data: user, isLoading, error } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;

  return (
    <div>
      <h1>{user.firstName} {user.lastName}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### useLogout
Logout user and revoke token:

```typescript
import { useLogout } from '@/lib/hooks/useAuth';
import { useClerk } from '@clerk/nextjs';

function LogoutButton() {
  const logout = useLogout();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    // Logout from backend (revoke token)
    await logout.mutateAsync();
    
    // Logout from Clerk
    await signOut();
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
```

## 🔄 Automatic Token Management

Add `AuthManager` component to automatically handle token generation:

```typescript
// In your layout or high-level component
import AuthManager from '@/components/AuthManager';

export default function Layout({ children }) {
  return (
    <>
      <AuthManager />
      {children}
    </>
  );
}
```

The `AuthManager` component will:
- ✅ Automatically generate token when user signs in with Clerk
- ✅ Detect expired tokens and regenerate
- ✅ Sync with backend user data

## 🌐 API Client Usage

The API client automatically injects the token in all requests:

```typescript
import { apiClient } from '@/lib/api/client';

// GET request (with auth)
const data = await apiClient.get('/api/products');

// POST request (with auth)
const result = await apiClient.post('/api/orders', { productId: '123' });

// Request without auth
const public Data = await apiClient.get('/api/public', { requiresAuth: false });
```

## 🔧 Configuration

### Environment Variables
Add to your `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### Backend API Endpoints
- **Generate Token**: `POST /api/auth/exchange`
- **Refresh Token**: `POST /api/auth/refresh`
- **Get Current User**: `GET /api/auth/me`
- **Logout**: `POST /api/auth/logout`

## 📊 User Data Structure

```typescript
interface User {
  id: string;
  clerkUid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "ADMIN" | "USER";
  isActive: boolean;
  profile?: UserProfile;
  createdAt: string;
  updatedAt?: string;
}
```

## 🛡️ Security Best Practices

1. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **Automatic Injection**: Tokens are automatically added to API requests
3. **Token Refresh**: Implement automatic token refresh before expiration
4. **Logout**: Always call both backend logout and Clerk signOut
5. **Error Handling**: Token is cleared on authentication errors

## 🎨 Complete Example

```typescript
"use client";

import { useCurrentUser, useLogout } from '@/lib/hooks/useAuth';
import { useClerk } from '@clerk/nextjs';

export default function Dashboard() {
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## 🚀 Getting Started

1. **Setup is complete** - QueryProvider is already added to layout
2. **Add AuthManager** to your layout for automatic token management
3. **Use hooks** in your components to access user data and auth functions
4. **Configure backend URL** in `.env.local`

## 🔍 Debugging

Check token status:
```typescript
import { tokenStorage } from '@/lib/api/tokenStorage';

console.log('Token:', tokenStorage.getToken());
console.log('User:', tokenStorage.getUser());
console.log('Is Authenticated:', tokenStorage.isAuthenticated());
```

## 📝 Notes

- Token is automatically included in all API requests (unless `requiresAuth: false`)
- User data is cached for 5 minutes by default
- Failed requests automatically retry once
- All auth state is cleared on logout
