import { useAuthStore } from '../../stores/auth-simple';
import { LogOut } from 'lucide-react';

export default function CrewSetting() {
  const { logout, user } = useAuthStore();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-start px-6 py-10">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Settings
      </h1>

      {/* User Info Card */}
      <div className="card w-full max-w-md mb-8">
        <div className="card-content py-6 text-center">
          <p className="text-lg font-semibold text-gray-800">
            {user?.name || 'Crew Member'}
          </p>
          <p className="text-sm text-gray-500">
            {user?.email}
          </p>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={logout}
        className="w-full max-w-md flex items-center justify-center gap-2 rounded-lg bg-red-500 text-white py-3 font-semibold shadow hover:bg-red-600 transition"
      >
        <LogOut className="h-5 w-5" />
        Sign Out
      </button>
    </div>
  );
}
