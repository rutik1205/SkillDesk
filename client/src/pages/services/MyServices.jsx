import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { serviceAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Plus, Edit2, Trash2, Eye, EyeOff, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const MyServices = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const res = await serviceAPI.getMyServices();
      setServices(res.data.data.services);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await serviceAPI.deleteService(id);
      setServices((prev) => prev.filter((s) => s._id !== id));
      toast.success('Service deleted');
    } catch (err) { toast.error('Failed to delete service'); }
  };

  const toggleActive = async (id, currentActive) => {
    try {
      await serviceAPI.updateService(id, { isActive: !currentActive });
      setServices((prev) => prev.map((s) => s._id === id ? { ...s, isActive: !currentActive } : s));
      toast.success(currentActive ? 'Service unpublished' : 'Service published');
    } catch (err) { toast.error('Failed to update service'); }
  };

  if (loading) return <LoadingSpinner text="Loading services..." />;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
        <Link to="/dashboard/services/new" className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> Create Service
        </Link>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No services yet"
          message="Create your first service and start earning"
          action={<Link to="/dashboard/services/new" className="btn-primary">Create Service</Link>}
        />
      ) : (
        <div className="grid gap-4">
          {services.map((service) => (
            <div key={service._id} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {service.images?.[0]?.url ? (
                  <img src={service.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Briefcase className="w-6 h-6 text-gray-400" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">{service.title}</h3>
                  <span className={`badge ${service.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {service.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{service.category?.name} · ${service.price} · {service.deliveryTime}d delivery</p>
                <p className="text-xs text-gray-400 mt-0.5">{service.totalOrders || 0} orders · {service.avgRating || 0} rating</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(service._id, service.isActive)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" title={service.isActive ? 'Unpublish' : 'Publish'}>
                  {service.isActive ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                </button>
                <Link to={`/dashboard/services/${service._id}/edit`} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </Link>
                <button onClick={() => handleDelete(service._id)} className="p-2 rounded-lg hover:bg-rose-50 transition-colors">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyServices;
