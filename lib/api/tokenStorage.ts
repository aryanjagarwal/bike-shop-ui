// Secure token storage utilities
// Uses sessionStorage for security (cleared on tab close)
// Can be switched to localStorage for persistence across sessions

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const tokenStorage = {
  // Get stored token
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Set token
  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  // Remove token
  removeToken(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // Get stored user
  getUser(): any | null {
    if (typeof window === 'undefined') return null;
    try {
      const user = sessionStorage.getItem(USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Set user
  setUser(user: any): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  // Remove user
  removeUser(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  },

  // Clear all auth data
  clearAll(): void {
    this.removeToken();
    this.removeUser();
  },
};
