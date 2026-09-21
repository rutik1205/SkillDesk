import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, serviceAPI } from '../../services/api';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import { BarChart3, ShoppingBag, CheckCircle, Clock, DollarSign, Star, Briefcase, ArrowRight, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [serviceCount, setServiceCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        orderAPI.getStats(),
        orderAPI.getOrders({ limit: 5 }),
      ]);
      setStats(statsRes.data.data.stats);
      setRecentOrders(ordersRes.data.data.orders);

      if (user.role === 'freelancer') {
        const sRes = await serviceAPI.getMyServices();
        setServiceCount(sRes.data.data.services.length);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const statCards = user.role === 'freelancer'
    ? [
        { icon: ShoppingBag, label: 'Total Orders', value: stats?.total || 0, color: 'bg-blue-500' },
        { icon: Clock, label: 'Active Orders', value: stats?.active || 0, color: 'bg-amber-500' },
        { icon: CheckCircle, label: 'Completed', value: stats?.completed || 0, color: 'bg-emerald-500' },
        { icon: DollarSign, label: 'Earnings (Demo)', value: `$${stats?.totalEarnings || 0}`, color: 'bg-purple-500' },
        { icon: Briefcase, label: 'My Services', value: serviceCount, color: 'bg-indigo-500' },
        { icon: Star, label: 'Avg Rating', value: user.avgRating?.toFixed(1) || '0.0', color: 'bg-amber-500' },
      ]
    : [
        { icon: ShoppingBag, label: 'Total Orders', value: stats?.total || 0, color: 'bg-blue-500' },
        { icon: Clock, label: 'Active Orders', value: stats?.active || 0, color: 'bg-amber-500' },
        { icon: CheckCircle, label: 'Completed', value: stats?.completed || 0, color: 'bg-emerald-500' },
        { icon: DollarSign, label: 'Total Spent (Demo)', value: `$${stats?.totalEarnings || 0}`, color: 'bg-purple-500' },
      ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
          Welcome back, {user.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500">
          {user.role === 'freelancer' ? 'Here\'s your freelancer overview' : 'Here\'s your project overview'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {user.role === 'freelancer' ? (
          <>
            <Link to="/dashboard/services/new" className="card p-5 flex items-center gap-4 group hover:border-primary-200">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <Briefcase className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Create New Service</p>
                <p className="text-sm text-gray-500">Offer your skills to clients</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </Link>
            <Link to="/dashboard/orders" className="card p-5 flex items-center gap-4 group hover:border-primary-200">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <ShoppingBag className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Manage Orders</p>
                <p className="text-sm text-gray-500">View and manage your orders</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </Link>
          </>
        ) : (
          <>
            <Link to="/services" className="card p-5 flex items-center gap-4 group hover:border-primary-200">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Browse Services</p>
                <p className="text-sm text-gray-500">Find the perfect freelancer</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </Link>
            <Link to="/dashboard/orders" className="card p-5 flex items-center gap-4 group hover:border-primary-200">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                <ShoppingBag className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">My Orders</p>
                <p className="text-sm text-gray-500">Track your project progress</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
            </Link>
          </>
        )}
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/dashboard/orders" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="p-8 text-center text-gray-500 text-sm">No orders yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <Link key={order._id} to={`/dashboard/orders/${order._id}`} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {order.service?.images?.[0]?.url ? (
                    <img src={order.service.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Briefcase className="w-5 h-5 text-gray-400" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{order.service?.title}</p>
                  <p className="text-xs text-gray-500">${order.price}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
