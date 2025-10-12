# Clerk Authentication Setup Guide

## Overview
Your bicycle shop application is now configured to use Clerk for authentication with Email/Password and Google OAuth support.

## Step 1: Get Your Clerk API Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application (or create a new one)
3. Navigate to **API Keys** in the sidebar
4. Copy your keys

## Step 2: Configure Environment Variables

Add the following to your `.env.local` file:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: Customize sign-in/sign-up URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## Step 3: Enable Authentication Methods in Clerk Dashboard

### Enable Email/Password Authentication:
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Toggle **Email address** to ON
3. Enable **Password** authentication
4. Save changes

### Enable Google OAuth:
1. Go to **User & Authentication** → **Social Connections**
2. Find **Google** in the list
3. Toggle it to ON
4. Choose between:
   - **Use Clerk's development keys** (for testing)
   - **Use custom credentials** (for production)
5. Save changes

## Step 4: Configure Application Settings (Optional)

### Customize Sign-in/Sign-up Experience:
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Configure:
   - Email verification (recommended)
   - Password requirements
   - Username requirements (optional)

### Customize Appearance:
1. Go to **Customization** → **Theme**
2. Customize colors, fonts, and branding to match your bicycle shop theme

## Step 5: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to:
   - Sign Up: `http://localhost:3000/auth/register`
   - Sign In: `http://localhost:3000/auth/login`

3. Test both authentication methods:
   - Email/Password registration
   - Google OAuth sign-in

## Protected Routes

The following routes are automatically protected and require authentication:
- `/account` - User account management
- `/admin` - Admin dashboard
- `/checkout` - Checkout process
- `/orders` - Order history
- `/wishlist` - User wishlist

Users will be automatically redirected to the sign-in page if they try to access these routes without authentication.

## Using Clerk Hooks in Your Components

### Get Current User:
```typescript
import { useUser } from "@clerk/nextjs";

export default function MyComponent() {
  const { isSignedIn, user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  
  if (isSignedIn) {
    return <div>Hello {user.firstName}!</div>;
  }
  
  return <div>Not signed in</div>;
}
```

### Add Sign Out Button:
```typescript
import { UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header>
      <UserButton afterSignOutUrl="/" />
    </header>
  );
}
```

### Server-Side Authentication:
```typescript
import { auth } from "@clerk/nextjs/server";

export default async function ServerComponent() {
  const { userId } = await auth();
  
  if (!userId) {
    return <div>Not authenticated</div>;
  }
  
  return <div>User ID: {userId}</div>;
}
```

## Production Checklist

Before deploying to production:

- [ ] Replace Clerk development keys with production keys
- [ ] Set up custom Google OAuth credentials (not Clerk's development keys)
- [ ] Enable email verification
- [ ] Configure password strength requirements
- [ ] Set up custom email templates (optional)
- [ ] Configure session duration and security settings
- [ ] Add your production domain to allowed origins in Clerk dashboard
- [ ] Test all authentication flows in production environment

## Troubleshooting

### "Clerk: Missing publishableKey" Error
- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in `.env.local`
- Restart your development server after adding environment variables

### Google OAuth Not Working
- Check that Google is enabled in Clerk dashboard
- Verify your redirect URIs are correctly configured
- For production, ensure you're using custom Google OAuth credentials

### Users Can't Sign In
- Check that email verification settings match your configuration
- Verify the sign-in URL matches your Clerk dashboard settings
- Check browser console for any Clerk-related errors

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Components](https://clerk.com/docs/components/overview)
- [Clerk API Reference](https://clerk.com/docs/reference/clerkjs)
