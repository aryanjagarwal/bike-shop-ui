# Authentication Flow

This document explains how authentication works in the bicycle shop application.

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Clerk     │────────▶│   Frontend   │────────▶│   Backend   │
│  (Auth UI)  │         │  (Next.js)   │         │  (Express)  │
└─────────────┘         └──────────────┘         └─────────────┘
      │                        │                        │
      │                        │                        │
   Sign In              Exchange Token            Verify & Store
   Sign Up              Store JWT Token           Return User Data
   Sign Out             Use Token in APIs         Validate Requests
```

## How It Works

### 1. **User Signs In via Clerk**
- User uses Clerk's UI to sign in/sign up
- Clerk handles authentication and creates a Clerk user
- Clerk provides user data (ID, email, name, etc.)

### 2. **Automatic Token Exchange** (via `useClerkSync`)
- When Clerk user is detected, `useClerkSync` hook automatically:
  - Syncs Clerk user to local store
  - Calls backend `/api/auth/exchange` with Clerk user ID
  - Receives JWT token from backend
  - Stores token securely in sessionStorage

### 3. **Backend API Calls**
- All subsequent API calls automatically include the JWT token
- Backend validates the token and processes requests
- User data comes from backend database (not Clerk)

### 4. **User Signs Out**
- Logout button calls both:
  1. Backend `/api/auth/logout` (revokes token)
  2. Clerk `signOut()` (clears Clerk session)
- All stored tokens and user data are cleared

## Key Files

### Authentication Setup
- **`lib/hooks/useClerkSync.ts`** - Auto-syncs Clerk user and exchanges token
- **`components/ClerkSync.tsx`** - Component that runs the sync (in root layout)
- **`components/Navbar.tsx`** - Handles logout with both Clerk and backend

### Token Management
- **`lib/api/tokenStorage.ts`** - Secure token storage (sessionStorage)
- **`lib/api/client.ts`** - API client with automatic token injection
- **`lib/api/auth.ts`** - TanStack Query hooks for auth APIs

## API Endpoints

All backend API calls use the JWT token automatically:

| Endpoint | Method | Purpose | Token Required |
|----------|--------|---------|----------------|
| `/api/auth/exchange` | POST | Exchange Clerk ID for JWT | No |
| `/api/auth/refresh` | POST | Refresh JWT token | Yes |
| `/api/auth/me` | GET | Get current user from DB | Yes |
| `/api/auth/logout` | POST | Revoke token | Yes |

## Usage in Components

### Get Current User from Backend

```tsx
import { useCurrentUser } from '@/lib/api/auth';

function MyComponent() {
  const { data, isLoading } = useCurrentUser();
  
  if (isLoading) return <div>Loading...</div>;
  
  const user = data?.data; // User from backend database
  
  return (
    <div>
      <h1>{user?.firstName} {user?.lastName}</h1>
      <p>Role: {user?.role}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

### Make Authenticated API Calls

```tsx
import { apiClient } from '@/lib/api/client';

// Token is automatically included in headers
async function fetchOrders() {
  const response = await apiClient.get('/api/orders');
  return response;
}

async function createOrder(orderData) {
  const response = await apiClient.post('/api/orders', orderData);
  return response;
}
```

### Check Authentication Status

```tsx
import { isAuthenticated, getStoredUser } from '@/lib/api/auth';

// Check if user has valid token
if (isAuthenticated()) {
  console.log('User is authenticated');
}

// Get stored user without API call
const user = getStoredUser();
console.log('User role:', user?.role);
```

## Token Lifecycle

1. **Token Creation**: When user signs in via Clerk
   - `useClerkSync` detects Clerk user
   - Calls `/api/auth/exchange` with Clerk user ID
   - Backend creates JWT token (7 days expiry)
   - Token stored in sessionStorage

2. **Token Usage**: On every API call
   - `apiClient` automatically adds `Authorization: Bearer <token>` header
   - Backend validates token and processes request

3. **Token Refresh**: When token is about to expire
   - Call `useRefreshToken()` hook
   - Backend issues new token
   - Old token is replaced

4. **Token Revocation**: When user logs out
   - Backend marks token as revoked
   - Token and user data cleared from storage
   - User signed out from Clerk

## Security Features

✅ **Secure Storage**: Tokens stored in sessionStorage (cleared on tab close)  
✅ **Automatic Injection**: Token automatically added to all API requests  
✅ **Token Revocation**: Backend can revoke tokens on logout  
✅ **Error Handling**: Tokens cleared on authentication errors  
✅ **Separation of Concerns**: Clerk handles auth UI, backend handles authorization  

## Environment Variables

Add to your `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Clerk Keys (already configured)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Flow Diagram

```
User Action          Frontend                    Backend
─────────────────────────────────────────────────────────────
Sign In via Clerk
    │
    ├──▶ Clerk authenticates
    │
    ├──▶ useClerkSync detects user
    │
    ├──▶ POST /api/auth/exchange
    │         { clerkUserId: "user_123" }
    │                                    ├──▶ Verify Clerk user
    │                                    ├──▶ Create/update user in DB
    │                                    ├──▶ Generate JWT token
    │                                    └──▶ Return token + user data
    │
    ├──▶ Store token in sessionStorage
    │
    └──▶ User is authenticated ✓

Make API Call
    │
    ├──▶ GET /api/products
    │         Headers: { Authorization: "Bearer <token>" }
    │                                    ├──▶ Validate JWT token
    │                                    ├──▶ Extract user from token
    │                                    ├──▶ Process request
    │                                    └──▶ Return response
    │
    └──▶ Display data ✓

Logout
    │
    ├──▶ POST /api/auth/logout
    │         Headers: { Authorization: "Bearer <token>" }
    │                                    ├──▶ Revoke token
    │                                    └──▶ Return success
    │
    ├──▶ Clear sessionStorage
    │
    ├──▶ Clerk signOut()
    │
    └──▶ Redirect to login ✓
```

## Troubleshooting

### Token not being sent
- Check if `NEXT_PUBLIC_BACKEND_URL` is set in `.env.local`
- Verify token exists: `console.log(getStoredToken())`

### User not syncing
- Ensure `ClerkSync` component is in root layout
- Check browser console for errors

### Backend returns 401 Unauthorized
- Token may be expired - try refreshing
- Token may be revoked - user needs to sign in again
- Backend URL may be incorrect

## Next Steps

1. ✅ Token management is fully set up
2. ✅ Automatic token exchange on Clerk sign-in
3. ✅ Logout calls both Clerk and backend
4. 🔄 Use `useCurrentUser()` to get backend user data in components
5. 🔄 Use `apiClient` for all backend API calls
6. 🔄 Implement token refresh logic if needed (for long sessions)
