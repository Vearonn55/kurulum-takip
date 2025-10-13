// src/pages/crew/CrewSettings.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Wifi,
  Shield,
  Trash2,
  Info,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../stores/auth-simple';

type PrefKey = 'push_enabled' | 'wifi_only_uploads' | 'auto_sync';
type Prefs = Record<PrefKey, boolean>;

const PREFS_KEY = 'crew_settings_prefs_v1';
const DEFAULT_PREFS: Prefs = {
  push_enabled: true,
  wifi_only_uploads: true,
  auto_sync: true,
};

function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...(parsed || {}) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(p: Prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CrewSettings() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const [prefs, setPrefs] = useState<Prefs>(() => loadPrefs());
  const [cacheBytes, setCacheBytes] = useState(0);

  // Persist prefs
  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  // Fake “offline cache size” from a couple of known mock keys we use elsewhere
  useEffect(() => {
    const size =
      (localStorage.getItem('crew_issues_v1')?.length ?? 0) +
      (localStorage.getItem('mock_installations')?.length ?? 0) +
      (localStorage.getItem(PREFS_KEY)?.length ?? 0);

    setCacheBytes(size);
  }, []);

  const toggle = (k: PrefKey) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const resetPrefs = () => setPrefs(DEFAULT_PREFS);

  const clearCache = () => {
    localStorage.removeItem('crew_issues_v1');
    localStorage.removeItem('mock_installations');
    setCacheBytes((localStorage.getItem(PREFS_KEY)?.length ?? 0)); // keep prefs
  };

  const handleSignOut = () => {
    logout();
    navigate('/auth/login');
  };

  const today = useMemo(() => new Date(), []);

  return (
    <div className="mx-auto w-full max-w-screen-sm">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-900">Settings</h1>
          <p className="text-xs text-gray-500">Personal preferences for crew app</p>
        </div>
      </header>

      {/* Profile */}
      <section className="m-3 rounded-xl border bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
            <UserIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">
              {user?.name || 'Crew Member'}
            </div>
            <div className="truncate text-xs text-gray-500">
              {user?.email || '—'}
            </div>
          </div>
        </div>
      </section>

      {/* Preferences */}
      <section className="m-3 space-y-2">
        <ToggleRow
          icon={<Bell className="h-4 w-4" />}
          title="Push notifications"
          desc="Alerts for new jobs, updates and checklist feedback."
          checked={prefs.push_enabled}
          onChange={() => toggle('push_enabled')}
        />
        <ToggleRow
          icon={<Wifi className="h-4 w-4" />}
          title="Upload on Wi-Fi only"
          desc="Defer photo uploads until connected to Wi-Fi."
          checked={prefs.wifi_only_uploads}
          onChange={() => toggle('wifi_only_uploads')}
        />
        <ToggleRow
          icon={<Shield className="h-4 w-4" />}
          title="Auto-sync in background"
          desc="Sync checklists and photos when the app becomes active."
          checked={prefs.auto_sync}
          onChange={() => toggle('auto_sync')}
        />

        <div className="flex gap-2 pt-1">
          <button
            onClick={resetPrefs}
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50"
          >
            Reset to defaults
          </button>
        </div>
      </section>

      {/* Storage & cache */}
      <section className="m-3 rounded-xl border bg-white p-3 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900">Offline cache</div>
            <div className="text-xs text-gray-500">
              Local storage for mock data and quick access.
            </div>
            <div className="mt-1 text-xs text-gray-600">Size: {fmtBytes(cacheBytes)}</div>
          </div>
          <button
            onClick={clearCache}
            className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Clear
          </button>
        </div>
      </section>

      {/* About */}
      <section className="m-3 rounded-xl border bg-white p-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Info className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">About</div>
            <div className="text-xs text-gray-600">
              InstallOps Crew • mock build • {today.toLocaleDateString()}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              This screen uses local storage for demonstration. In production, preferences
              would be synced with your account.
            </div>
          </div>
        </div>
      </section>

      {/* Sign out */}
      <section className="m-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </section>

      {/* Spacer for bottom nav */}
      <div className="h-14" />
    </div>
  );
}

/** Small reusable toggle row */
function ToggleRow({
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
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 text-gray-600">{icon}</div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">{title}</div>
            {desc && <div className="mt-0.5 text-xs text-gray-500">{desc}</div>}
          </div>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            onChange={onChange}
          />
          {/* Track */}
          <div className="h-5 w-9 rounded-full bg-gray-200 transition peer-checked:bg-primary-600" />
          {/* Knob */}
          <div className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
        </label>
      </div>
    </div>
  );
}
