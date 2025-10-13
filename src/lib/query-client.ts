import { QueryClient } from '@tanstack/react-query';
import { apiClient } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
    },
  },
});

// Query key factory
export const queryKeys = {
  // Auth
  currentUser: ['auth', 'currentUser'] as const,
  
  // Users
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  usersByRole: (role: string) => ['users', 'role', role] as const,
  usersByStore: (storeId: string) => ['users', 'store', storeId] as const,
  
  // Stores
  stores: ['stores'] as const,
  store: (id: string) => ['stores', id] as const,
  
  // Customers
  customers: ['customers'] as const,
  customer: (id: string) => ['customers', id] as const,
  customersSearch: (query: string) => ['customers', 'search', query] as const,
  
  // Products
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  productsSearch: (query: string) => ['products', 'search', query] as const,
  
  // Inventory
  inventory: ['inventory'] as const,
  inventoryByWarehouse: (warehouse: string) => ['inventory', 'warehouse', warehouse] as const,
  
  // Orders
  orders: ['orders'] as const,
  order: (id: string) => ['orders', id] as const,
  ordersByStore: (storeId: string) => ['orders', 'store', storeId] as const,
  ordersByStatus: (status: string) => ['orders', 'status', status] as const,
  
  // Installations
  installations: ['installations'] as const,
  installation: (id: string) => ['installations', id] as const,
  installationsByStore: (storeId: string) => ['installations', 'store', storeId] as const,
  installationsByStatus: (status: string) => ['installations', 'status', status] as const,
  installationsByDateRange: (from: string, to: string) => ['installations', 'dateRange', from, to] as const,
  
  // Calendar
  calendarSlots: (storeId: string, date: string) => ['calendar', 'slots', storeId, date] as const,
  
  // Checklists
  checklistTemplates: ['checklists', 'templates'] as const,
  checklistTemplate: (id: string) => ['checklists', 'templates', id] as const,
  installationChecklist: (id: string) => ['installations', id, 'checklist'] as const,
  
  // Media
  installationMedia: (id: string) => ['installations', id, 'media'] as const,
  
  // Pick Lists
  pickLists: ['picklists'] as const,
  pickList: (id: string) => ['picklists', id] as const,
  pickListsByStatus: (status: string) => ['picklists', 'status', status] as const,
  
  // Reports
  kpis: ['reports', 'kpis'] as const,
  slaReport: ['reports', 'sla'] as const,
  failureReport: ['reports', 'failures'] as const,
  
  // Audit
  auditLogs: ['audit'] as const,
  auditLogsByActor: (actor: string) => ['audit', 'actor', actor] as const,
  auditLogsByEntity: (entity: string) => ['audit', 'entity', entity] as const,
  
  // Webhooks
  webhooks: ['webhooks'] as const,
  webhook: (id: string) => ['webhooks', id] as const,
  webhookEvents: ['webhook-events'] as const,
  webhookEventsByStatus: (status: string) => ['webhook-events', 'status', status] as const,
};

// Global error handler
queryClient.setMutationDefaults(['auth', 'login'], {
  onError: (error: any) => {
    console.error('Login error:', error);
  },
});

queryClient.setMutationDefaults(['auth', 'logout'], {
  onError: (error: any) => {
    console.error('Logout error:', error);
  },
});

// Auto-refresh token on 401 errors
queryClient.setMutationDefaults(['*'], {
  onError: async (error: any) => {
    if (error?.status === 401) {
      try {
        await apiClient.refreshToken();
        // Retry the original request
        queryClient.invalidateQueries();
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/auth/login';
      }
    }
  },
});
