import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { serviceAPI, reviewAPI, orderAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../../components/common/Avatar';
import RatingStars from '../../components/common/RatingStars';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { Clock, Tag, CheckCircle, MessageSquare, ShoppingCart, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ServiceDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderModal, setOrderModal] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [ordering, setOrdering] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      const [sRes, rRes] = await Promise.all([
        serviceAPI.getServiceById(id),
        reviewAPI.getServiceReviews(id),
      ]);
      setService(sRes.data.data.service);
      setReviews(rRes.data.data.reviews);
    } catch (err) {
      toast.error('Service not found');
      navigate('/services');
    }
    setLoading(false);
  };

  const handleOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    if (user.role !== 'client') {
      toast.error('Only clients can place orders');
      return;
    }
    setOrdering(true);
    try {
      await orderAPI.createOrder({ serviceId: service._id, requirements });
      toast.success('Order placed successfully!');
      setOrderModal(false);
      navigate('/dashboard/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setOrdering(false);
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading service..." />;
  if (!service) return null;

  const fl = service.freelancer;
  const images = service.images || [];
  const isOwner = user?._id === fl?._id;

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Link to="/services" className="hover:text-primary-600">Services</Link>
                <span>/</span>
                <span>{service.category?.name}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{service.title}</h1>
            </div>

            {/* Freelancer Info Bar */}
            <div className="flex items-center gap-3">
              <Link to={`/freelancers/${fl._id}`}>
                <Avatar src={fl.avatar?.url} name={fl.name} size="md" />
              </Link>
              <div>
                <Link to={`/freelancers/${fl._id}`} className="font-semibold text-gray-900 hover:text-primary-600">{fl.name}</Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <RatingStars rating={fl.avgRating} size={14} count={fl.totalReviews} />
                  {fl.isOnline && <span className="badge bg-emerald-100 text-emerald-700 text-[10px]">Online</span>}
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
              {images.length > 0 ? (
                <>
                  <img src={images[currentImg]?.url} alt={service.title} className="w-full h-full object-cover" />
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setCurrentImg((prev) => (prev - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={() => setCurrentImg((prev) => (prev + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, idx) => (
                          <button key={idx} onClick={() => setCurrentImg(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentImg ? 'bg-white scale-125' : 'bg-white/50'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
                  <ImageIcon className="w-16 h-16 text-primary-300" />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About This Service</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{service.description}</p>
            </div>

            {/* Tags */}
            {service.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span key={tag} className="badge bg-gray-100 text-gray-600">
                    <Tag className="w-3 h-3 mr-1" />{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Requirements */}
            {service.requirements && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{service.requirements}</p>
              </div>
            )}

            {/* Reviews */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reviews ({reviews.length})
              </h2>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar src={review.client?.avatar?.url} name={review.client?.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{review.client?.name}</p>
                          <RatingStars rating={review.rating} size={12} showValue={false} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-sm text-gray-500">Starting at</span>
                  <p className="text-3xl font-bold text-gray-900">${service.price}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Delivery Time</span>
                  <span className="font-medium text-gray-900">{service.deliveryTime} days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Orders</span>
                  <span className="font-medium text-gray-900">{service.totalOrders || 0} completed</span>
                </div>
              </div>

              {!isOwner && user?.role !== 'freelancer' && (
                <button
                  onClick={() => user ? setOrderModal(true) : navigate('/login')}
                  className="btn-primary w-full !py-3 text-base mb-3"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Order Now
                </button>
              )}

              {!isOwner && (
                <Link
                  to={user ? `/dashboard/messages?user=${fl._id}` : '/login'}
                  className="btn-secondary w-full !py-3"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Contact Freelancer
                </Link>
              )}

              {/* Freelancer Card */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link to={`/freelancers/${fl._id}`} className="block">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar src={fl.avatar?.url} name={fl.name} size="lg" />
                    <div>
                      <p className="font-semibold text-gray-900">{fl.name}</p>
                      <p className="text-xs text-gray-500">{fl.professionalTitle}</p>
                    </div>
                  </div>
                  <RatingStars rating={fl.avgRating} count={fl.totalReviews} size={14} />
                  {fl.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {fl.skills.slice(0, 4).map((skill) => (
                        <span key={skill} className="badge bg-primary-50 text-primary-700 text-[10px]">{skill}</span>
                      ))}
                    </div>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <Modal isOpen={orderModal} onClose={() => setOrderModal(false)} title="Place Order" size="md">
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="font-semibold text-gray-900">{service.title}</p>
            <p className="text-sm text-gray-500 mt-1">by {fl.name}</p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-xl font-bold text-gray-900">${service.price}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <strong>Demo Payment:</strong> This is a simulated transaction. No real money is charged.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Requirements</label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="input-field h-28 resize-none"
              placeholder="Describe what you need..."
            />
          </div>

          <button onClick={handleOrder} disabled={ordering} className="btn-primary w-full !py-3">
            {ordering ? 'Processing...' : `Pay $${service.price} (Demo)`}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceDetails;
