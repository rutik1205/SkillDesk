import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI, serviceAPI, reviewAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ServiceCard from '../../components/services/ServiceCard';
import Avatar from '../../components/common/Avatar';
import RatingStars from '../../components/common/RatingStars';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { MapPin, Globe, MessageSquare, Briefcase, Award, Calendar } from 'lucide-react';

const FreelancerProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const [pRes, rRes] = await Promise.all([
        userAPI.getProfile(id),
        reviewAPI.getFreelancerReviews(id),
      ]);
      setProfile(pRes.data.data.user);
      setReviews(rRes.data.data.reviews);

      const sRes = await serviceAPI.getServices({ freelancer: id, limit: 20 });
      // Filter services by this freelancer
      setServices(sRes.data.data.services.filter((s) => s.freelancer?._id === id));
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar src={profile.avatar?.url} name={profile.name} size="2xl" className="!ring-4 !ring-white/20" />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <p className="text-primary-100 text-lg mt-1">{profile.professionalTitle || 'Freelancer'}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-primary-100">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{profile.location}</span>}
                {profile.website && <span className="flex items-center gap-1"><Globe className="w-4 h-4" />{profile.website}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                <RatingStars rating={profile.avgRating} count={profile.totalReviews} size={18} />
                <span className="badge bg-white/20 text-white">{profile.completedOrders || 0} orders completed</span>
              </div>
              {currentUser && currentUser._id !== id && (
                <Link to={`/dashboard/messages?user=${id}`} className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-white text-primary-700 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                  <MessageSquare className="w-4 h-4" /> Message
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {profile.bio && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}
            {profile.skills?.length > 0 && (
              <div className="card p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className="badge bg-primary-50 text-primary-700">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Experience</span><span className="font-medium">{profile.experience || 'N/A'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Completed Orders</span><span className="font-medium">{profile.completedOrders || 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Rating</span><span className="font-medium">{profile.avgRating?.toFixed(1) || '0.0'}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Reviews</span><span className="font-medium">{profile.totalReviews || 0}</span></div>
              </div>
            </div>
          </div>

          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Services */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Services ({services.length})</h2>
              {services.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <ServiceCard key={service._id} service={service} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No services yet</p>
              )}
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Reviews ({reviews.length})</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review._id} className="card p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar src={review.client?.avatar?.url} name={review.client?.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{review.client?.name}</p>
                          <p className="text-xs text-gray-500">{review.service?.title}</p>
                        </div>
                        <div className="ml-auto"><RatingStars rating={review.rating} size={14} showValue={false} /></div>
                      </div>
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;
