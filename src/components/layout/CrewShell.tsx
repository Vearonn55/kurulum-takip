import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { UserRole } from '@/types';
import { setMockRole, clearMock, applyMockFromStorage } from '../../dev/mockAuth';

import {
  Home,
  ClipboardList,
  Camera,
  AlertTriangle,
  Settings as SettingsIcon,
  Wifi,
  WifiOff,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';

import { useAuthStore } from '../../stores/auth-simple';
import { cn } from '../../lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navigation: NavigationItem[] = [
  { name: 'Home', href: '/crew', icon: Home },
  { name: 'Jobs', href: '/crew/jobs', icon: ClipboardList },
  { name: 'Camera', href: '/crew/capture', icon: Camera },
  { name: 'Issues', href: '/crew/issues', icon: AlertTriangle },
  { name: 'Settings', href: '/crew/settings', icon: SettingsIcon },
];

// Inline, dev-only role switcher
function DevRoleSwitcherInline() {
  useEffect(() => {
    if (import.meta.env.DEV) applyMockFromStorage();
  }, []);
  if (!import.meta.env.DEV) return null;

  const ROLES: UserRole[] = ['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER', 'CREW'];

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-xl border border-gray-200 bg-white/95 shadow px-3 py-2">
      <div className="text-[11px] font-semibold text-gray-600 mb-1">Dev Role</div>
      <div className="flex gap-1 flex-wrap">
        {ROLES.map((r) => (
          <button
            key={r}
            onClick={() => setMockRole(r)}
            className="text-[11px] px-2 py-1 border rounded hover:bg-gray-50"
            type="button"
          >
            {r}
          </button>
        ))}
        <button
          onClick={clearMock}
          className="text-[11px] px-2 py-1 border rounded text-red-600 hover:bg-red-50"
          type="button"
        >
          Clear
        </button>
      </div>
      <div className="mt-1 text-[10px] text-gray-400">Dev only</div>
    </div>
  );
}

export default function CrewShell() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Stubs until offline store is wired back
  const pendingActions: any[] = [];
  const completedActions: any[] = [];
  const isSyncing = false;
  const syncActions = async () => {};
  const clearCompletedActions = () => {};

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    try {
      logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSync = async () => {
    await syncActions();
  };

  const handleClearCompleted = () => {
    clearCompletedActions();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <WifiOff className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">You're offline</span>
            </div>
            <span className="text-xs text-yellow-600">
              {pendingActions.length} action{pendingActions.length !== 1 ? 's' : ''} pending
            </span>
          </div>
        </div>
      )}

      {/* Sync status banner */}
      {isOnline && pendingActions.length > 0 && (
        <div className="bg-blue-100 border-b border-blue-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {isSyncing ? (
                <RefreshCw className="h-4 w-4 text-blue-600 mr-2 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4 text-blue-600 mr-2" />
              )}
              <span className="text-sm text-blue-800">
                {isSyncing
                  ? 'Syncing...'
                  : `${pendingActions.length} action${pendingActions.length !== 1 ? 's' : ''} pending sync`}
              </span>
            </div>
            {!isSyncing && (
              <button
                onClick={handleSync}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Sync now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Success banner */}
      {completedActions.length > 0 && (
        <div className="bg-green-100 border-b border-green-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm text-green-800">
                {completedActions.length} action{completedActions.length !== 1 ? 's' : ''} synced
              </span>
            </div>
            <button
              onClick={handleClearCompleted}
              className="text-xs text-green-600 hover:text-green-800 underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>

      {/* Bottom navigation */}
      <div className="bg-white border-t border-gray-200 px-2 py-1">
        <nav className="flex justify-around">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center py-2 px-3 text-xs font-medium rounded-lg transition-colors',
                  isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 mb-1',
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  )}
                />
                {item.name}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>
      </div>

      {/* User info overlay (for settings/logout) */}
      {location.pathname === '/crew/settings' && (
        <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-4 border">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500">Installation Crew</div>
            </div>
            <button
              onClick={handleLogout}
              disabled={false}
              className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {import.meta.env.DEV && <DevRoleSwitcherInline />}
    </div>
  );
}
