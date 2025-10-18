import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface RatingStarsProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
  showNumber?: boolean;
}

const RatingStars = ({ rating, onRate, readonly = false, size = 20, showNumber = true }: RatingStarsProps) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;
  const fullStars = Math.floor(displayRating / 2);
  const hasHalfStar = displayRating % 2 >= 1;

  const handleClick = (starValue: number) => {
    if (!readonly && onRate) {
      onRate(starValue);
    }
  };

  const handleMouseEnter = (starValue: number) => {
    if (!readonly) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= fullStars;
        const isHalf = star === fullStars + 1 && hasHalfStar;
        const starValue = star * 2;

        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`relative transition-transform ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
          >
            {isHalf ? (
              <div className="relative">
                <Icon name="Star" size={size} className="text-muted-foreground" />
                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                  <Icon name="Star" size={size} className="text-primary fill-primary" />
                </div>
              </div>
            ) : (
              <Icon
                name="Star"
                size={size}
                className={
                  isFilled
                    ? 'text-primary fill-primary'
                    : 'text-muted-foreground'
                }
              />
            )}
          </button>
        );
      })}
      {showNumber && (
        <span className="ml-2 font-semibold text-lg">
          {rating.toFixed(1)}/10
        </span>
      )}
    </div>
  );
};

export default RatingStars;
