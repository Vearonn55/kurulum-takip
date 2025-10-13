import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { UserRole } from '@/types';
import { setMockRole, clearMock, applyMockFromStorage } from '../../dev/mockAuth';

import {
  LayoutDashboard,
  Package,
  Calendar,
  Users,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Settings,
  User as UserIcon,
  Bell,
  Search,
  Menu,
  X,
  Shield,
  Warehouse,
} from 'lucide-react';

import { useAuthStore } from '../../stores/auth-simple';
import { cn } from '../../lib/utils';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: number;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER'] },
  { name: 'Orders', href: '/app/orders', icon: ShoppingCart, roles: ['ADMIN', 'STORE_MANAGER'] },
  { name: 'Installations', href: '/app/installations', icon: Package, roles: ['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER'] },
  { name: 'Calendar', href: '/app/calendar', icon: Calendar, roles: ['ADMIN', 'STORE_MANAGER'] },
  { name: 'Inventory', href: '/app/inventory', icon: Warehouse, roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
  { name: 'Pick Lists', href: '/app/picklists', icon: ClipboardList, roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
  { name: 'Customers', href: '/app/customers', icon: Users, roles: ['ADMIN', 'STORE_MANAGER'] },
  { name: 'Products', href: '/app/products', icon: Package, roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
  { name: 'Reports', href: '/app/reports', icon: BarChart3, roles: ['ADMIN', 'STORE_MANAGER'] },
  { name: 'Users & Roles', href: '/app/admin/users', icon: Shield, roles: ['ADMIN'] },
  { name: 'Integrations', href: '/app/admin/integrations', icon: Settings, roles: ['ADMIN'] },
  { name: 'Audit', href: '/app/audit', icon: Shield, roles: ['ADMIN'] },
];

// Inline, dev-only role switcher (no extra file needed)
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

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, hasAnyRole, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const filteredNavigation = navigation.filter((item) => hasAnyRole(item.roles));

  const handleLogout = async () => {
    try {
      logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'STORE_MANAGER':
        return 'Store Manager';
      case 'WAREHOUSE_MANAGER':
        return 'Warehouse Manager';
      case 'CREW':
        return 'Installation Crew';
      default:
        return role;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div
        className={cn('fixed inset-0 flex z-40 md:hidden', sidebarOpen ? 'block' : 'hidden')}
        aria-hidden={!sidebarOpen}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">InstallOps</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-2 py-2 text-base font-medium rounded-md',
                      isActive
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={cn(
                        'mr-4 h-6 w-6',
                        isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      )}
                    />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-primary-100 text-primary-600 text-xs font-medium px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">InstallOps</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                        isActive
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5',
                          isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                      />
                      {item.name}
                      {item.badge && (
                        <span className="ml-auto bg-primary-100 text-primary-600 text-xs font-medium px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </a>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <form className="w-full flex md:ml-0" action="#" method="GET">
                <label htmlFor="search-field" className="sr-only">
                  Search
                </label>
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    id="search-field"
                    className="block w-full h-full pl-8 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent"
                    placeholder="Search..."
                    type="search"
                    name="search"
                  />
                </div>
              </form>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Notifications */}
              <button
                type="button"
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Bell className="h-6 w-6" />
              </button>

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setUserMenuOpen((v) => !v)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                      {user?.name}
                    </span>
                  </button>
                </div>
                {userMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-gray-500">{user?.email}</div>
                      <div className="text-xs text-gray-400">
                        {(() => {
                          switch (user?.role) {
                            case 'ADMIN':
                              return 'Administrator';
                            case 'STORE_MANAGER':
                              return 'Store Manager';
                            case 'WAREHOUSE_MANAGER':
                              return 'Warehouse Manager';
                            case 'CREW':
                              return 'Installation Crew';
                            default:
                              return user?.role ?? '';
                          }
                        })()}
                      </div>
                    </div>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Your Profile
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </a>
                    <button
                      onClick={handleLogout}
                      disabled={false}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>

        {import.meta.env.DEV && <DevRoleSwitcherInline />}
      </div>
    </div>
  );
}
