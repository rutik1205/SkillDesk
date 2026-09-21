import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, reviewAPI } from '../../services/api';
import Avatar from '../../components/common/Avatar';
import OrderStatusBadge from '../../components/common/OrderStatusBadge';
import RatingStars from '../../components/common/RatingStars';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { ArrowLeft, CheckCircle, XCircle, Play, Send, RotateCcw, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [deliverModal, setDeliverModal] = useState(false);
  const [revisionModal, setRevisionModal] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [revisionMessage, setRevisionMessage] = useState('');
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await orderAPI.getOrderById(id);
      setOrder(res.data.data.order);
    } catch (err) {
      toast.error('Order not found');
      navigate('/dashboard/orders');
    }
    setLoading(false);
  };

  const handleAction = async (action, data = {}) => {
    setActionLoading(action);
    try {
      let res;
      switch (action) {
        case 'accept': res = await orderAPI.acceptOrder(id); break;
        case 'reject': res = await orderAPI.rejectOrder(id); break;
        case 'start': res = await orderAPI.startOrder(id); break;
        case 'deliver':
          res = await orderAPI.deliverOrder(id, { message: deliveryMessage, files: [] });
          setDeliverModal(false);
          break;
        case 'revision':
          res = await orderAPI.requestRevision(id, { revisionMessage });
          setRevisionModal(false);
          break;
        case 'complete': res = await orderAPI.completeOrder(id); break;
        case 'cancel': res = await orderAPI.cancelOrder(id); break;
      }
      toast.success(`Order ${action}ed successfully`);
      setOrder(res.data.data.order);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} order`);
    }
    setActionLoading('');
  };

  const handleReview = async () => {
    if (!reviewData.comment.trim()) { toast.error('Please add a comment'); return; }
    setActionLoading('review');
    try {
      await reviewAPI.createReview({ orderId: id, rating: reviewData.rating, comment: reviewData.comment });
      toast.success('Review submitted!');
      setReviewModal(false);
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setActionLoading('');
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!order) return null;

  const isClient = user._id === order.client?._id;
  const isFreelancer = user._id === order.freelancer?._id;
  const otherParty = isClient ? order.freelancer : order.client;

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/dashboard/orders')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{order.service?.title || 'Service'}</h1>
                <p className="text-sm text-gray-500 mt-0.5">Order #{order.orderNumber}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
              <div><p className="text-xs text-gray-500">Price</p><p className="font-semibold">${order.price}</p></div>
              <div><p className="text-xs text-gray-500">Payment</p><p className="font-semibold capitalize">{order.paymentStatus}</p></div>
              <div><p className="text-xs text-gray-500">Ordered</p><p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p></div>
              <div><p className="text-xs text-gray-500">Delivery</p><p className="font-semibold">{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'TBD'}</p></div>
            </div>
          </div>

          {/* Requirements */}
          {order.requirements && (
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-2">Requirements</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.requirements}</p>
            </div>
          )}

          {/* Delivered Work */}
          {order.deliveredWork?.message && (
            <div className="card p-6 border-l-4 border-primary-500">
              <h2 className="font-semibold text-gray-900 mb-2">Delivered Work</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.deliveredWork.message}</p>
              {order.deliveredWork.deliveredAt && (
                <p className="text-xs text-gray-400 mt-2">Delivered on {new Date(order.deliveredWork.deliveredAt).toLocaleString()}</p>
              )}
            </div>
          )}

          {/* Revision Message */}
          {order.revisionMessage && order.status === 'revision_requested' && (
            <div className="card p-6 border-l-4 border-amber-500">
              <h2 className="font-semibold text-gray-900 mb-2">Revision Request</h2>
              <p className="text-sm text-gray-600">{order.revisionMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              {isFreelancer && order.status === 'pending' && (
                <>
                  <button onClick={() => handleAction('accept')} disabled={!!actionLoading} className="btn-primary gap-2">
                    <CheckCircle className="w-4 h-4" /> Accept
                  </button>
                  <button onClick={() => handleAction('reject')} disabled={!!actionLoading} className="btn-danger gap-2">
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </>
              )}
              {isFreelancer && order.status === 'accepted' && (
                <button onClick={() => handleAction('start')} disabled={!!actionLoading} className="btn-primary gap-2">
                  <Play className="w-4 h-4" /> Start Work
                </button>
              )}
              {isFreelancer && (order.status === 'in_progress' || order.status === 'revision_requested') && (
                <button onClick={() => setDeliverModal(true)} className="btn-primary gap-2">
                  <Send className="w-4 h-4" /> Submit Delivery
                </button>
              )}
              {isClient && order.status === 'delivered' && (
                <>
                  <button onClick={() => handleAction('complete')} disabled={!!actionLoading} className="btn-primary gap-2">
                    <CheckCircle className="w-4 h-4" /> Accept Delivery
                  </button>
                  <button onClick={() => setRevisionModal(true)} className="btn-secondary gap-2">
                    <RotateCcw className="w-4 h-4" /> Request Revision
                  </button>
                </>
              )}
              {isClient && order.status === 'completed' && (
                <button onClick={() => setReviewModal(true)} className="btn-accent gap-2">
                  <Star className="w-4 h-4" /> Leave Review
                </button>
              )}
              {((isClient && ['pending', 'accepted'].includes(order.status)) || (isFreelancer && order.status === 'pending')) && (
                <button onClick={() => handleAction('cancel')} disabled={!!actionLoading} className="btn-secondary text-rose-600 hover:bg-rose-50 gap-2">
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
              )}
              {!['pending', 'accepted', 'in_progress', 'delivered', 'revision_requested'].includes(order.status) && (
                <p className="text-sm text-gray-500">No actions available for this order status.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{isClient ? 'Freelancer' : 'Client'}</h3>
            <div className="flex items-center gap-3">
              <Avatar src={otherParty?.avatar?.url} name={otherParty?.name} size="lg" />
              <div>
                <p className="font-semibold text-gray-900">{otherParty?.name}</p>
                <p className="text-sm text-gray-500">{otherParty?.email}</p>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Timeline</h3>
            <div className="space-y-3">
              {['pending', 'accepted', 'in_progress', 'delivered', 'completed'].map((step, idx) => {
                const statusOrder = ['pending', 'accepted', 'in_progress', 'delivered', 'completed'];
                const currentIdx = statusOrder.indexOf(order.status);
                const isActive = idx <= currentIdx && !['cancelled', 'rejected'].includes(order.status);
                return (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${isActive ? 'bg-primary-600' : 'bg-gray-200'}`} />
                    <span className={`text-sm capitalize ${isActive ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                      {step.replace('_', ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Deliver Modal */}
      <Modal isOpen={deliverModal} onClose={() => setDeliverModal(false)} title="Submit Delivery">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Message</label>
            <textarea value={deliveryMessage} onChange={(e) => setDeliveryMessage(e.target.value)} className="input-field h-32 resize-none" placeholder="Describe what you've completed..." />
          </div>
          <button onClick={() => handleAction('deliver')} disabled={!!actionLoading} className="btn-primary w-full">
            {actionLoading === 'deliver' ? 'Submitting...' : 'Submit Delivery'}
          </button>
        </div>
      </Modal>

      {/* Revision Modal */}
      <Modal isOpen={revisionModal} onClose={() => setRevisionModal(false)} title="Request Revision">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">What needs to be changed?</label>
            <textarea value={revisionMessage} onChange={(e) => setRevisionMessage(e.target.value)} className="input-field h-32 resize-none" placeholder="Describe the changes needed..." />
          </div>
          <button onClick={() => handleAction('revision')} disabled={!!actionLoading} className="btn-primary w-full">
            {actionLoading === 'revision' ? 'Submitting...' : 'Request Revision'}
          </button>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={reviewModal} onClose={() => setReviewModal(false)} title="Leave a Review">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <RatingStars rating={reviewData.rating} size={28} showValue={false} interactive onChange={(r) => setReviewData((prev) => ({ ...prev, rating: r }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment</label>
            <textarea value={reviewData.comment} onChange={(e) => setReviewData((prev) => ({ ...prev, comment: e.target.value }))} className="input-field h-28 resize-none" placeholder="Share your experience..." />
          </div>
          <button onClick={handleReview} disabled={!!actionLoading} className="btn-primary w-full">
            {actionLoading === 'review' ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetails;
