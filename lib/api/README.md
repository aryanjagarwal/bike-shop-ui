# Token Management API

Secure token management system with TanStack Query integration for authentication.

## Files Overview

- **`tokenStorage.ts`** - Secure token storage utilities (sessionStorage)
- **`client.ts`** - API client with automatic token injection
- **`auth.ts`** - TanStack Query hooks for authentication

## Setup

1. Add backend URL to your `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

2. Ensure TanStack Query is wrapped in your app layout (already done via `QueryProvider`)

## Usage Examples

### 1. Exchange Token (Login Flow)

```tsx
import { useExchangeToken } from '@/lib/api/auth';
import { useUser } from '@clerk/nextjs';

function LoginComponent() {
  const { user } = useUser();
  const exchangeToken = useExchangeToken();

  useEffect(() => {
    if (user?.id) {
      exchangeToken.mutate(user.id, {
        onSuccess: (response) => {
          console.log('Token exchanged:', response.data?.token);
          console.log('User data:', response.data?.user);
        },
        onError: (error) => {
          console.error('Exchange failed:', error);
        }
      });
    }
  }, [user?.id]);

  return <div>Authenticating...</div>;
}
```

### 2. Get Current User

```tsx
import { useCurrentUser } from '@/lib/api/auth';

function ProfilePage() {
  const { data, isLoading, error } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;

  const user = data?.data;

  return (
    <div>
      <h1>{user?.firstName} {user?.lastName}</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### 3. Refresh Token

```tsx
import { useRefreshToken } from '@/lib/api/auth';
import { useUser } from '@clerk/nextjs';

function TokenRefreshComponent() {
  const { user } = useUser();
  const refreshToken = useRefreshToken();

  const handleRefresh = () => {
    if (user?.id) {
      refreshToken.mutate(user.id, {
        onSuccess: (response) => {
          console.log('Token refreshed:', response.data?.token);
        }
      });
    }
  };

  return (
    <button onClick={handleRefresh}>
      Refresh Token
    </button>
  );
}
```

### 4. Logout

```tsx
import { useLogout } from '@/lib/api/auth';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

function LogoutButton() {
  const { signOut } = useClerk();
  const logout = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    // Call backend logout API
    logout.mutate(undefined, {
      onSuccess: async () => {
        // Then sign out from Clerk
        await signOut();
        router.push('/auth/login');
      }
    });
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}
```

### 5. Helper Functions

```tsx
import { isAuthenticated, getStoredUser, getStoredToken } from '@/lib/api/auth';

// Check if user is authenticated
if (isAuthenticated()) {
  console.log('User is authenticated');
}

// Get stored user without API call
const user = getStoredUser();
console.log('Stored user:', user);

// Get stored token
const token = getStoredToken();
console.log('Token:', token);
```

## Automatic Token Sync Example

Create a component to automatically sync tokens when Clerk user is available:

```tsx
'use client';

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useExchangeToken, isAuthenticated } from '@/lib/api/auth';

export function AuthSync() {
  const { user, isLoaded } = useUser();
  const exchangeToken = useExchangeToken();

  useEffect(() => {
    if (isLoaded && user?.id && !isAuthenticated()) {
      // Exchange token if user is logged in but we don't have a backend token
      exchangeToken.mutate(user.id);
    }
  }, [isLoaded, user?.id]);

  return null;
}
```

Then add it to your root layout:

```tsx
// app/layout.tsx
import { AuthSync } from '@/components/AuthSync';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          <QueryProvider>
            <AuthSync />
            {children}
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

## API Endpoints

All endpoints use the base URL: `NEXT_PUBLIC_BACKEND_URL`

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/auth/exchange` | POST | No | Exchange Clerk user ID for JWT |
| `/api/auth/refresh` | POST | Yes | Refresh JWT token |
| `/api/auth/me` | GET | Yes | Get current user from database |
| `/api/auth/logout` | POST | Yes | Logout and revoke token |

## Token Storage

Tokens are stored in **sessionStorage** by default for security:
- Cleared when browser tab is closed
- Not accessible across tabs
- Protected from XSS attacks (when used properly)

To switch to **localStorage** (persists across sessions), modify `tokenStorage.ts`:
```typescript
// Change sessionStorage to localStorage
sessionStorage.getItem() → localStorage.getItem()
sessionStorage.setItem() → localStorage.setItem()
sessionStorage.removeItem() → localStorage.removeItem()
```

## Security Notes

1. **Never log tokens** in production
2. **Use HTTPS** in production
3. **Tokens are automatically included** in all API requests via the client
4. **Tokens are cleared** on logout or authentication errors
5. **sessionStorage** is used by default for better security

## Type Definitions

```typescript
interface User {
  id: string;
  clerkUid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  profile?: {
    id: string;
    userId: string;
    dateOfBirth: string | null;
    preferences: string;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
```
