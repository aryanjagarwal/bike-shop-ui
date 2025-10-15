/**
 * Example components showing how to use the authentication system
 * These are reference examples - copy patterns into your actual components
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser, useLogout, isAuthenticated, getStoredUser } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

// ============================================
// Example 1: Display User Profile from Backend
// ============================================

export function UserProfileExample() {
  const { data, isLoading, error } = useCurrentUser();

  if (isLoading) {
    return <div>Loading user profile...</div>;
  }

  if (error) {
    return <div>Error loading profile: {error.message}</div>;
  }

  const user = data?.data;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role}</p>
        <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
        <p><strong>Status:</strong> {user?.isActive ? 'Active' : 'Inactive'}</p>
        <p><strong>Member Since:</strong> {new Date(user?.createdAt || '').toLocaleDateString()}</p>
      </div>
    </div>
  );
}

// ============================================
// Example 2: Protected Component (Admin Only)
// ============================================

export function AdminDashboardExample() {
  const { data, isLoading } = useCurrentUser();
  const router = useRouter();

  // Redirect if not admin
  if (!isLoading && data?.data?.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  if (isLoading) {
    return <div>Verifying admin access...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, {data?.data?.firstName}!</p>
      {/* Admin content here */}
    </div>
  );
}

// ============================================
// Example 3: Logout Button with Both Services
// ============================================

export function LogoutButtonExample() {
  const { signOut } = useClerk();
  const logout = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    // Call backend logout (revokes token)
    logout.mutate(undefined, {
      onSettled: async () => {
        // Then sign out from Clerk
        await signOut();
        router.push('/auth/login');
      }
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={logout.isPending}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
    >
      {logout.isPending ? 'Logging out...' : 'Logout'}
    </button>
  );
}

// ============================================
// Example 4: Fetch Orders with Authentication
// ============================================

export function OrdersListExample() {
  // Using TanStack Query with apiClient
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // Token is automatically included
      return apiClient.get('/api/orders');
    },
    enabled: isAuthenticated(), // Only fetch if authenticated
  });

  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  const orders = (ordersData as any)?.data || [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders yet</p>
      ) : (
        orders.map((order: any) => (
          <div key={order.id} className="p-4 border rounded">
            <p>Order #{order.id}</p>
            <p>Status: {order.status}</p>
            <p>Total: ${order.total}</p>
          </div>
        ))
      )}
    </div>
  );
}

// ============================================
// Example 5: Create Order with Authentication
// ============================================

export function CreateOrderExample() {
  const queryClient = useQueryClient();
  
  const createOrder = useMutation({
    mutationFn: async (orderData: any) => {
      // Token is automatically included
      return apiClient.post('/api/orders', orderData);
    },
    onSuccess: (response: any) => {
      console.log('Order created:', response.data);
      // Invalidate orders query to refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      console.error('Failed to create order:', error);
    }
  });

  const handleCreateOrder = () => {
    createOrder.mutate({
      items: [
        { productId: '123', quantity: 2 },
        { productId: '456', quantity: 1 },
      ],
      shippingAddress: '123 Main St',
    });
  };

  return (
    <button
      onClick={handleCreateOrder}
      disabled={createOrder.isPending}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      {createOrder.isPending ? 'Creating...' : 'Create Order'}
    </button>
  );
}

// ============================================
// Example 6: Check Auth Status (Client-Side)
// ============================================

export function AuthStatusExample() {
  const authenticated = isAuthenticated();
  const user = getStoredUser();

  return (
    <div className="p-4 bg-gray-100 rounded">
      <p><strong>Authenticated:</strong> {authenticated ? 'Yes' : 'No'}</p>
      {user && (
        <>
          <p><strong>User ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </>
      )}
    </div>
  );
}

// ============================================
// Example 7: Protected Page Component
// ============================================

export function ProtectedPageExample() {
  const { data, isLoading } = useCurrentUser();
  const router = useRouter();

  // Redirect to login if not authenticated
  if (!isLoading && !data?.data) {
    router.push('/auth/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Protected Content</h1>
      <p>Welcome, {data?.data?.firstName}!</p>
      {/* Your protected content here */}
    </div>
  );
}

// ============================================
// Example 8: Update User Profile
// ============================================

export function UpdateProfileExample() {
  const { data: currentUser } = useCurrentUser();
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (profileData: any) => {
      return apiClient.put('/api/users/profile', profileData);
    },
    onSuccess: () => {
      // Refetch current user data
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      alert('Profile updated successfully!');
    },
    onError: (error) => {
      alert('Failed to update profile');
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateProfile.mutate({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">First Name</label>
        <input
          type="text"
          name="firstName"
          defaultValue={currentUser?.data?.firstName}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Last Name</label>
        <input
          type="text"
          name="lastName"
          defaultValue={currentUser?.data?.lastName}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          type="tel"
          name="phone"
          defaultValue={currentUser?.data?.phone || ''}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <button
        type="submit"
        disabled={updateProfile.isPending}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {updateProfile.isPending ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
}

// ============================================
// Import statements needed for examples above
// ============================================

/*
Add these imports to use the examples:

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser, useLogout, isAuthenticated, getStoredUser } from '@/lib/api/auth';
import { apiClient } from '@/lib/api/client';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
*/
