import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, size = 16, showValue = true, count = null, interactive = false, onChange = null }) => {
  const stars = [1, 2, 3, 4, 5];

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <Star
          key={star}
          size={size}
          className={`${
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-gray-200 text-gray-200'
          } ${interactive ? 'cursor-pointer hover:text-amber-400 hover:fill-amber-400 transition-colors' : ''}`}
          onClick={() => handleClick(star)}
        />
      ))}
      {showValue && rating > 0 && (
        <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
      )}
      {count !== null && (
        <span className="text-sm text-gray-500">({count})</span>
      )}
    </div>
  );
};

export default RatingStars;
