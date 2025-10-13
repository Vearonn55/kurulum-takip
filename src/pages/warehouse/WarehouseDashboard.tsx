import { 
  Package, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Truck
} from 'lucide-react';

export default function WarehouseDashboard() {
  // Mock data - in real app this would come from API
  const stats = [
    {
      name: 'Today\'s Pick Lists',
      value: '12',
      change: '+3',
      changeType: 'positive' as const,
      icon: ClipboardList,
    },
    {
      name: 'Staged Items',
      value: '8',
      change: '+2',
      changeType: 'positive' as const,
      icon: CheckCircle,
    },
    {
      name: 'Stock Shortages',
      value: '3',
      change: '-1',
      changeType: 'positive' as const,
      icon: AlertTriangle,
    },
    {
      name: 'Items Ready',
      value: '24',
      change: '+5',
      changeType: 'positive' as const,
      icon: Package,
    },
  ];

  const todayPickLists = [
    {
      id: 'PL-001',
      installation: 'Installation #1234',
      items: 5,
      status: 'staged',
      crew: 'Mike Johnson',
      time: '9:00 AM',
    },
    {
      id: 'PL-002',
      installation: 'Installation #1235',
      items: 3,
      status: 'new',
      crew: 'Tom Brown',
      time: '1:00 PM',
    },
    {
      id: 'PL-003',
      installation: 'Installation #1236',
      items: 7,
      status: 'loaded',
      crew: 'Mike Johnson',
      time: '3:30 PM',
    },
  ];

  const stockShortages = [
    {
      product: 'Office Chair - Model A',
      sku: 'CHAIR-A-001',
      needed: 2,
      available: 0,
      status: 'critical',
    },
    {
      product: 'Desk Lamp - LED',
      sku: 'LAMP-LED-002',
      needed: 1,
      available: 0,
      status: 'critical',
    },
    {
      product: 'Bookshelf - 5 Tier',
      sku: 'SHELF-5T-003',
      needed: 1,
      available: 1,
      status: 'warning',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loaded':
        return 'bg-green-100 text-green-800';
      case 'staged':
        return 'bg-blue-100 text-blue-800';
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getShortageColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
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
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage inventory and prepare items for installation
          </p>
        </div>
        <a
          href="/app/picklists/new"
          className="btn btn-primary btn-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Pick List
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Pick Lists */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Today's Pick Lists</h3>
            <p className="card-description">
              Pick lists for today's installations
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {todayPickLists.map((pickList) => (
                <div key={pickList.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ClipboardList className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pickList.id}</p>
                      <p className="text-xs text-gray-500">{pickList.installation}</p>
                      <p className="text-xs text-gray-400">{pickList.items} items • {pickList.time}</p>
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(pickList.status)}`}>
                    {pickList.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock Shortages */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Stock Shortages</h3>
            <p className="card-description">
              Items that need attention
            </p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {stockShortages.map((shortage, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{shortage.product}</p>
                      <p className="text-xs text-gray-500">SKU: {shortage.sku}</p>
                      <p className="text-xs text-gray-400">
                        Needed: {shortage.needed} • Available: {shortage.available}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${getShortageColor(shortage.status)}`}>
                    {shortage.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <a
          href="/app/picklists"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <ClipboardList className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">View Pick Lists</h3>
            <p className="text-xs text-gray-500 mt-1">Manage all pick lists</p>
          </div>
        </a>

        <a
          href="/app/inventory"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <Package className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">View Inventory</h3>
            <p className="text-xs text-gray-500 mt-1">Check stock levels</p>
          </div>
        </a>

        <a
          href="/app/products"
          className="card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="card-content text-center">
            <Truck className="h-8 w-8 text-primary-600 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-gray-900">View Products</h3>
            <p className="text-xs text-gray-500 mt-1">Product catalog</p>
          </div>
        </a>
      </div>
    </div>
  );
}
