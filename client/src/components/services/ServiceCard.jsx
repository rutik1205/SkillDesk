import { Link } from 'react-router-dom';
import { Clock, Image as ImageIcon } from 'lucide-react';
import Avatar from '../common/Avatar';
import RatingStars from '../common/RatingStars';

const ServiceCard = ({ service }) => {
  const imageUrl = service.images?.[0]?.url;

  return (
    <Link to={`/services/${service._id}`} className="card group block">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-50 to-accent-50">
            <ImageIcon className="w-12 h-12 text-primary-300" />
          </div>
        )}
        {service.category && (
          <span className="absolute top-3 left-3 badge bg-white/90 backdrop-blur text-gray-700 shadow-sm">
            {service.category.name || service.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Freelancer Info */}
        <div className="flex items-center gap-2 mb-2.5">
          <Avatar src={service.freelancer?.avatar?.url} name={service.freelancer?.name || 'Freelancer'} size="xs" />
          <span className="text-xs font-medium text-gray-600">
            {service.freelancer?.name || 'Freelancer'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2 leading-snug min-h-[2.5rem]">
          {service.title}
        </h3>

        {/* Rating */}
        <div className="mb-3">
          <RatingStars
            rating={service.avgRating || 0}
            size={14}
            count={service.totalReviews || 0}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{service.deliveryTime}d delivery</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Starting at</span>
            <p className="text-lg font-bold text-gray-900">${service.price}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;
