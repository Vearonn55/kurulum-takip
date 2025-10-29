import { Hourglass } from 'lucide-react';

export default function CrewIssues() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center">
        <div className="card-content py-10">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <Hourglass className="h-6 w-6 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Coming soon</h1>
        </div>
      </div>
    </div>
  );
}
