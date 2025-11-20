// src/stores/auth-simple.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';
import { getCurrentUser } from '../api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

type AuthStore = AuthState & AuthActions;

// Permission mapping based on roles
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    'users:read', 'users:write', 'users:delete',
    'stores:read', 'stores:write', 'stores:delete',
    'orders:read', 'orders:write', 'orders:delete',
    'installations:read', 'installations:write', 'installations:delete',
    'inventory:read', 'inventory:write', 'inventory:delete',
    'reports:read', 'reports:write',
    'audit:read',
    'webhooks:read', 'webhooks:write', 'webhooks:delete',
    'capacity:read', 'capacity:write',
    'checklists:read', 'checklists:write', 'checklists:delete',
  ],
  STORE_MANAGER: [
    'orders:read', 'orders:write',
    'installations:read', 'installations:write',
    'customers:read', 'customers:write',
    'calendar:read', 'calendar:write',
    'reports:read',
  ],
  WAREHOUSE_MANAGER: [
    'inventory:read', 'inventory:write',
    'installations:read',
    'picklists:read', 'picklists:write',
    'products:read',
  ],
  CREW: [
    'installations:read',
    'checklists:read', 'checklists:write',
    'media:read', 'media:write',
  ],
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        // Simulate API delay (frontend-only mock; real cookie login is done via /api/auth)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock authentication - accept any email/password for demo
        const mockUser: User = {
          id: '1',
          email: email,
          firstName: 'Demo',
          lastName: 'User',
          role: 'ADMIN' as UserRole,
          storeId: '1',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;

        const userPermissions = ROLE_PERMISSIONS[user.role] || [];
        return userPermissions.includes(permission);
      },

      hasRole: (role: UserRole) => {
        const { user } = get();
        return user?.role === role;
      },

      hasAnyRole: (roles: UserRole[]) => {
        const { user } = get();
        return user ? roles.includes(user.role) : false;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Simple initialization function
// Now attempts to restore session from backend /auth/me using the sid cookie.
export const initializeAuth = async () => {
  const state = useAuthStore.getState();

  try {
    // This will succeed if sid cookie is valid (user has an active session)
    const me: any = await getCurrentUser();

    // If we already had a user in local storage, keep it.
    // Otherwise, create a minimal user object from /auth/me and cast to User.
    const mappedUser: User =
      state.user ??
      ({
        id: me.id,
        // We don't get email from /auth/me; keep it empty or from existing state
        email: state.user?.email ?? '',
        firstName: state.user?.firstName ?? '',
        lastName: state.user?.lastName ?? '',
        role: (me.role?.toUpperCase?.() || 'ADMIN') as UserRole,
        storeId: state.user?.storeId ?? '',
        isActive: true,
        createdAt: state.user?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as User);

    useAuthStore.setState({
      ...state,
      user: mappedUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    return { user: mappedUser, isAuthenticated: true };
  } catch (err) {
    // If /auth/me fails (401 or other), just return whatever we had persisted.
    // This keeps behavior stable in dev if there's no session yet.
    return { user: state.user, isAuthenticated: state.isAuthenticated };
  }
};
