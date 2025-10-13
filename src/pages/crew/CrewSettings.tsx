// src/pages/crew/CrewSettings.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  User as UserIcon,
  Bell,
  Moon,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  Trash2,
  Shield,
  LogOut,
  ChevronRight,
  Smartphone,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '../../stores/auth-simple';
import { cn } from '../../lib/utils';
import type { UserRole } from '../../types';
import { setMockRole, clearMock, applyMockFromStorage } from '../../dev/mockAuth';

type Theme = 'system' | 'light' | 'dark';
type Settings = {
  notifications: boolean;
  theme: Theme;
  language: 'en' | 'tr';
  autoSync: boolean;
};

const SETTINGS_KEY = 'crew_settings_v1';

/* ------------------------------ helpers ------------------------------ */
function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { notifications: true, theme: 'system', language: 'en', autoSync: true };
    return JSON.parse(raw) as Settings;
  } catch {
    return { notifications: true, theme: 'system', language: 'en', autoSync: true };
  }
}
function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {/* noop */}
}
function bytesToHuman(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 ** 3) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(1)} GB`;
}

/* ------------------------------ component ------------------------------ */
export default function CrewSettings() {
  const { user, logout } = useAuthStore();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [syncing, setSyncing] = useState(false);

  // apply dev mock on reload if present
  useEffect(() => {
    applyMockFromStorage();
  }, []);

  useEffect(() => {
    saveSettings(settings);
    // Optional: live apply theme
    if (settings.theme === 'system') {
      document.documentElement.classList.remove('dark');
    } else if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // online/offline listeners
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // local cache size estimation
  const cacheBytes = useMemo(() => {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        const v = localStorage.getItem(k) ?? '';
        total += k.length + v.length;
      }
      return total;
    } catch {
      return 0;
    }
  }, [settings]); // re-calc occasionally

  const handleToggle = <K extends keyof Settings>(key: K) => {
    setSettings((s) => ({ ...s, [key]: !s[key] as any }));
  };

  const handleTheme = (t: Theme) => setSettings((s) => ({ ...s, theme: t }));
  const handleLang = (l: 'en' | 'tr') => setSettings((s) => ({ ...s, language: l }));

  const handleSyncNow = async () => {
    if (!isOnline) {
      toast.error('You are offline');
      return;
    }
    setSyncing(true);
    // Simulate syncing offline queue / drafts
    setTimeout(() => {
      setSyncing(false);
      toast.success('Synced successfully');
    }, 900);
  };

  const clearLocalData = () => {
    // Keep auth/session, remove app mock data keys we created
    const keysToRemove = [
      'crew_issues_v1',            // issues page mock
      // checklist drafts prefixed
      // we'll remove all keys starting with crew_checklist_
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    // Remove prefix keys
    const toDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('crew_checklist_')) toDelete.push(k);
    }
    toDelete.forEach((k) => localStorage.removeItem(k));
    toast('Local data cleared', { icon: '🗑️' });
  };

  const switchRole = (role: UserRole) => {
    setMockRole(role);
    toast.success(`Role switched to ${role}`);
  };

  const handleSignOut = () => {
    clearMock(); // reset dev mock
    logout();
    toast.success('Signed out');
  };

  return (
    <div className="mx-auto w-full max-w-screen-sm">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary-600" />
            <div className="text-lg font-semibold text-gray-900">Settings</div>
          </div>
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]',
              isOnline
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-amber-200 bg-amber-50 text-amber-700'
            )}
          >
            {isOnline ? <Wifi className="mr-1 h-3.5 w-3.5" /> : <WifiOff className="mr-1 h-3.5 w-3.5" />}
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="space-y-3 p-3 pb-24">
        {/* User card */}
        <section className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <UserIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-gray-900">{user?.name}</div>
              <div className="truncate text-xs text-gray-500">{user?.email}</div>
              <div className="text-[11px] text-gray-400">{user?.role}</div>
            </div>
          </div>
        </section>

        {/* App settings */}
        <section className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-gray-900">App</div>

          <RowSwitch
            icon={<Bell className="h-4 w-4" />}
            title="Notifications"
            desc="Allow job updates & alerts"
            checked={settings.notifications}
            onChange={() => handleToggle('notifications')}
          />

          <RowSegmented
            icon={<Moon className="h-4 w-4" />}
            title="Theme"
            desc="Choose appearance"
            value={settings.theme}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            onChange={(v) => handleTheme(v as Theme)}
          />

          <RowSegmented
            icon={<Globe className="h-4 w-4" />}
            title="Language"
            desc="Dil / Language"
            value={settings.language}
            options={[
              { value: 'en', label: 'English' },
              { value: 'tr', label: 'Türkçe' },
            ]}
            onChange={(v) => handleLang(v as 'en' | 'tr')}
          />

          <RowSwitch
            icon={<RefreshCw className="h-4 w-4" />}
            title="Auto-sync"
            desc="Sync offline actions automatically when online"
            checked={settings.autoSync}
            onChange={() => handleToggle('autoSync')}
          />
        </section>

        {/* Sync & storage */}
        <section className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-gray-900">Data & Sync</div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-gray-900">Manual sync</div>
              <div className="text-xs text-gray-500">Push pending actions & drafts</div>
            </div>
            <button
              disabled={syncing}
              onClick={handleSyncNow}
              className={cn(
                'inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50',
                syncing && 'opacity-60'
              )}
            >
              <RefreshCw className={cn('mr-1 h-4 w-4', syncing && 'animate-spin')} />
              {syncing ? 'Syncing…' : 'Sync now'}
            </button>
          </div>

          <div className="flex items-center justify-between border-t py-2">
            <div>
              <div className="text-sm font-medium text-gray-900">Local storage</div>
              <div className="text-xs text-gray-500">Approx. {bytesToHuman(cacheBytes)}</div>
            </div>
            <button
              onClick={clearLocalData}
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Clear data
            </button>
          </div>
        </section>

        {/* Developer tools (only for mocks) */}
        <section className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">Developer</div>
            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-gray-600">
              <Shield className="mr-1 h-3.5 w-3.5" />
              Mock mode
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['CREW', 'STORE_MANAGER', 'WAREHOUSE_MANAGER', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => switchRole(r)}
                className="rounded-md border px-3 py-2 text-xs hover:bg-gray-50"
              >
                Switch to {r}
              </button>
            ))}
          </div>

          <p className="mt-2 flex items-start gap-2 rounded-md bg-gray-50 p-2 text-[11px] text-gray-600">
            <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            These controls update the local dev session only (no server calls).
          </p>
        </section>

        {/* Sign out */}
        <section className="rounded-xl border bg-white p-3 shadow-sm">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-700"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </section>

        {/* About */}
        <section className="rounded-xl border bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">InstallOps Crew</div>
              <div className="text-xs text-gray-500">Version 0.1.0 (mock)</div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </section>
      </main>
    </div>
  );
}

/* ------------------------------ UI pieces ------------------------------ */
function RowSwitch({
  icon,
  title,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 text-gray-500">{icon}</div>
        <div>
          <div className="text-sm font-medium text-gray-900">{title}</div>
          {desc && <div className="text-xs text-gray-500">{desc}</div>}
        </div>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
        <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-primary-600 peer-checked:after:translate-x-full" />
      </label>
    </div>
  );
}

function RowSegmented<T extends string>({
  icon,
  title,
  desc,
  value,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="border-t py-2">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 text-gray-500">{icon}</div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900">{title}</div>
          {desc && <div className="text-xs text-gray-500">{desc}</div>}
          <div className="mt-2 grid grid-cols-3 gap-2">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={cn(
                  'rounded-md border px-3 py-2 text-xs',
                  value === opt.value ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
