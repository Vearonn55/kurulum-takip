import { 
  Package, 
  Users, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle 
} from 'lucide-react';

export default function AdminDashboard() {
  // Mock data - in real app this would come from API
  const stats = [
    {
      name: 'Today\'s Installations',
      value: '24',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Package,
    },
    {
      name: 'On-Time Rate',
      value: '94%',
      change: '+2%',
      changeType: 'positive' as const,
      icon: CheckCircle,
    },
    {
      name: 'SLA Breaches',
      value: '3',
      change: '-1',
      changeType: 'positive' as const,
      icon: AlertTriangle,
    },
    {
      name: 'Reschedule Rate',
      value: '8%',
      change: '-3%',
      changeType: 'positive' as const,
      icon: Calendar,
    },
    {
      name: 'Crew Utilization',
      value: '87%',
      change: '+5%',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      name: 'Avg. Completion Time',
      value: '2.4h',
      change: '-0.3h',
      changeType: 'positive' as const,
      icon: Clock,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'installation_completed',
      message: 'Installation #1234 completed by John Smith',
      time: '2 minutes ago',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    {
      id: 2,
      type: 'installation_failed',
      message: 'Installation #1233 failed - missing parts',
      time: '15 minutes ago',
      icon: XCircle,
      iconColor: 'text-red-500',
    },
    {
      id: 3,
      type: 'reschedule',
      message: 'Installation #1232 rescheduled to tomorrow',
      time: '1 hour ago',
      icon: Calendar,
      iconColor: 'text-yellow-500',
    },
    {
      id: 4,
      type: 'new_installation',
      message: 'New installation scheduled for Store A',
      time: '2 hours ago',
      icon: Package,
      iconColor: 'text-blue-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your furniture installation operations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                        <span className="sr-only">
                          {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                        </span>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
          <p className="card-description">
            Latest updates from your installation operations
          </p>
        </div>
        <div className="card-content">
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivities.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          activity.iconColor === 'text-green-500' ? 'bg-green-100' :
                          activity.iconColor === 'text-red-500' ? 'bg-red-100' :
                          activity.iconColor === 'text-yellow-500' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">{activity.message}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {activity.time}
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <a
          href="/app/installations"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <Package className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">View Installations</h3>
            <p className="text-xs text-gray-500 mt-1">Manage all installations</p>
          </div>
        </a>

        <a
          href="/app/admin/users"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">Manage Users</h3>
            <p className="text-xs text-gray-500 mt-1">Add and edit users</p>
          </div>
        </a>

        <a
          href="/app/reports"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">View Reports</h3>
            <p className="text-xs text-gray-500 mt-1">Analytics and insights</p>
          </div>
        </a>

        <a
          href="/app/admin/integrations"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <AlertTriangle className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">Webhooks</h3>
            <p className="text-xs text-gray-500 mt-1">Monitor integrations</p>
          </div>
        </a>
      </div>
    </div>
  );
}
