import { 
  Package, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Plus
} from 'lucide-react';

export default function ManagerDashboard() {
  // Mock data - in real app this would come from API
  const stats = [
    {
      name: 'Today\'s Installations',
      value: '8',
      change: '+2',
      changeType: 'positive' as const,
      icon: Package,
    },
    {
      name: 'Pending Confirmations',
      value: '3',
      change: '-1',
      changeType: 'positive' as const,
      icon: AlertTriangle,
    },
    {
      name: 'This Week\'s Total',
      value: '24',
      change: '+4',
      changeType: 'positive' as const,
      icon: Calendar,
    },
    {
      name: 'Completion Rate',
      value: '96%',
      change: '+2%',
      changeType: 'positive' as const,
      icon: CheckCircle,
    },
  ];

  const todayInstallations = [
    {
      id: '1234',
      customer: 'John Smith',
      address: '123 Main St, City',
      time: '9:00 AM - 11:00 AM',
      status: 'in_progress',
      crew: 'Mike Johnson',
    },
    {
      id: '1235',
      customer: 'Sarah Wilson',
      address: '456 Oak Ave, City',
      time: '1:00 PM - 3:00 PM',
      status: 'pending',
      crew: 'Tom Brown',
    },
    {
      id: '1236',
      customer: 'David Lee',
      address: '789 Pine St, City',
      time: '3:30 PM - 5:30 PM',
      status: 'completed',
      crew: 'Mike Johnson',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Manager Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your store's installation operations
          </p>
        </div>
        <a
          href="/app/installations/new"
          className="btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Installation
        </a>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Installations */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Today's Installations</h3>
          <p className="card-description">
            Installations scheduled for today
          </p>
        </div>
        <div className="card-content">
          <div className="flow-root">
            <ul className="-mb-8">
              {todayInstallations.map((installation, installationIdx) => (
                <li key={installation.id}>
                  <div className="relative pb-8">
                    {installationIdx !== todayInstallations.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <Package className="h-4 w-4 text-primary-600" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Installation #{installation.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              {installation.customer} • {installation.address}
                            </p>
                            <p className="text-xs text-gray-400">
                              {installation.time} • Crew: {installation.crew}
                            </p>
                          </div>
                          <span className={`badge ${getStatusColor(installation.status)}`}>
                            {installation.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/app/calendar"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <Calendar className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">View Calendar</h3>
            <p className="text-xs text-gray-500 mt-1">Schedule and manage appointments</p>
          </div>
        </a>

        <a
          href="/app/orders"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <Package className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">View Orders</h3>
            <p className="text-xs text-gray-500 mt-1">Manage customer orders</p>
          </div>
        </a>

        <a
          href="/app/customers"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <CheckCircle className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">View Customers</h3>
            <p className="text-xs text-gray-500 mt-1">Customer management</p>
          </div>
        </a>
      </div>
    </div>
  );
}
