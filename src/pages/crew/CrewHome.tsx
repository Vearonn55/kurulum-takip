import { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Navigation,
  Camera,
  ClipboardList
} from 'lucide-react';

export default function CrewHome() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  // Mock data - in real app this would come from API
  const nextJob = {
    id: '1234',
    customer: 'John Smith',
    address: '123 Main Street, City, State 12345',
    phone: '+1 (555) 123-4567',
    timeWindow: '9:00 AM - 11:00 AM',
    items: [
      { name: 'Office Chair - Model A', room: 'Office' },
      { name: 'Desk Lamp - LED', room: 'Office' },
      { name: 'Bookshelf - 5 Tier', room: 'Living Room' },
    ],
    notes: 'Parking available in driveway. Customer prefers morning installation.',
    distance: '2.3 miles',
    estimatedTime: '1.5 hours',
  };

  const pendingJobs = [
    {
      id: '1235',
      customer: 'Sarah Wilson',
      address: '456 Oak Avenue, City, State 12345',
      timeWindow: '1:00 PM - 3:00 PM',
      items: 2,
      distance: '4.1 miles',
    },
    {
      id: '1236',
      customer: 'David Lee',
      address: '789 Pine Street, City, State 12345',
      timeWindow: '3:30 PM - 5:30 PM',
      items: 1,
      distance: '6.2 miles',
    },
  ];

  const handleAcceptJob = (jobId: string) => {
    // TODO: Implement accept job API call
    console.log('Accepting job:', jobId);
  };

  const handleDeclineJob = (jobId: string) => {
    // TODO: Implement decline job API call
    console.log('Declining job:', jobId);
  };

  const handleStartNavigation = () => {
    // TODO: Open maps app with address
    console.log('Starting navigation to:', nextJob.address);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Good morning!</h1>
        <p className="text-sm text-gray-500">Ready for today's installations?</p>
      </div>

      {/* Next Job Card */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title">Next Installation</h3>
            <span className="badge badge-warning">Pending Acceptance</span>
          </div>
        </div>
        <div className="card-content space-y-4">
          {/* Customer Info */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-600">
                  {nextJob.customer.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{nextJob.customer}</p>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {nextJob.address}
              </div>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Phone className="h-4 w-4 mr-1" />
                {nextJob.phone}
              </div>
            </div>
          </div>

          {/* Time and Distance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-600">{nextJob.timeWindow}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-gray-600">{nextJob.distance}</span>
            </div>
          </div>

          {/* Items */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Items to Install:</h4>
            <div className="space-y-1">
              {nextJob.items.map((item, index) => (
                <div key={index} className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>{item.name}</span>
                  <span className="text-gray-400 ml-2">({item.room})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {nextJob.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                <p className="text-sm text-yellow-800">{nextJob.notes}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => handleAcceptJob(nextJob.id)}
              className="btn btn-primary btn-md flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept Job
            </button>
            <button
              onClick={() => handleDeclineJob(nextJob.id)}
              className="btn btn-outline btn-md flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </button>
          </div>

          {/* Navigation Button (shown after acceptance) */}
          {selectedJob === nextJob.id && (
            <button
              onClick={handleStartNavigation}
              className="btn btn-secondary btn-md w-full"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Start Navigation
            </button>
          )}
        </div>
      </div>

      {/* Pending Jobs */}
      {pendingJobs.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Jobs</h3>
            <p className="card-description">
              {pendingJobs.length} more installation{pendingJobs.length !== 1 ? 's' : ''} today
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              {pendingJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{job.customer}</p>
                    <p className="text-xs text-gray-500">{job.address}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-400">{job.timeWindow}</span>
                      <span className="text-xs text-gray-400">{job.items} item{job.items !== 1 ? 's' : ''}</span>
                      <span className="text-xs text-gray-400">{job.distance}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptJob(job.id)}
                      className="btn btn-sm btn-primary"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineJob(job.id)}
                      className="btn btn-sm btn-outline"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <a
          href="/crew/jobs"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <ClipboardList className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">All Jobs</h3>
            <p className="text-xs text-gray-500 mt-1">View all assignments</p>
          </div>
        </a>

        <a
          href="/crew/capture"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <Camera className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">Camera</h3>
            <p className="text-xs text-gray-500 mt-1">Take photos</p>
          </div>
        </a>
      </div>
    </div>
  );
}
