import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { ShoppingBag, Briefcase } from 'lucide-react';

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const res = await orderAPI.getOrders(params);
      setOrders(res.data.data.orders);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const statuses = ['', 'pending', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled'];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((status) => (
          <button
            key={status || 'all'}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === status ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status ? status.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          message={user.role === 'client' ? 'Browse services to place your first order' : 'Orders will appear here when clients hire you'}
          action={user.role === 'client' ? <Link to="/services" className="btn-primary">Browse Services</Link> : null}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              to={`/dashboard/orders/${order._id}`}
              className="card p-4 flex items-center gap-4 hover:border-primary-200 transition-all"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                {order.service?.images?.[0]?.url ? (
                  <img src={order.service.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Briefcase className="w-6 h-6 text-gray-400" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{order.service?.title || 'Service'}</p>
                <p className="text-sm text-gray-500">
                  {user.role === 'client' ? `Freelancer: ${order.freelancer?.name}` : `Client: ${order.client?.name}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <OrderStatusBadge status={order.status} />
                <p className="text-sm font-semibold text-gray-900 mt-1">${order.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
