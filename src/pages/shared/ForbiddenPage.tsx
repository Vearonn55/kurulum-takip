import { Link } from 'react-router-dom';
import { Shield, Home, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100">
            <Shield className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="mt-6 text-6xl font-extrabold text-gray-900">403</h1>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">Access Forbidden</h2>
          <p className="mt-2 text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="btn btn-primary btn-md w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline btn-md w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
