import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (rating: number) => void;
  recipeName: string;
}

const RatingDialog = ({ open, onOpenChange, onSubmit, recipeName }: RatingDialogProps) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || selectedRating;

  const handleSubmit = () => {
    if (selectedRating > 0) {
      onSubmit(selectedRating);
      setSelectedRating(0);
      setHoverRating(0);
      onOpenChange(false);
    }
  };

  const ratingLabels: { [key: number]: string } = {
    1: 'Ужасно',
    2: 'Очень плохо',
    3: 'Плохо',
    4: 'Ниже среднего',
    5: 'Средне',
    6: 'Неплохо',
    7: 'Хорошо',
    8: 'Очень хорошо',
    9: 'Отлично',
    10: 'Шедевр!',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Оцените рецепт</DialogTitle>
          <DialogDescription className="text-base">
            Как вам понравился <span className="font-semibold">{recipeName}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-8">
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setSelectedRating(rating)}
                onMouseEnter={() => setHoverRating(rating)}
                onMouseLeave={() => setHoverRating(0)}
                className={`w-12 h-12 rounded-lg font-bold text-lg transition-all ${
                  rating <= displayRating
                    ? 'bg-primary text-primary-foreground scale-110'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>

          {displayRating > 0 && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Icon name="Star" size={24} className="text-primary fill-primary" />
                <span className="text-3xl font-bold">{displayRating}/10</span>
              </div>
              <p className="text-lg text-muted-foreground">
                {ratingLabels[displayRating]}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={selectedRating === 0}>
            <Icon name="Send" size={16} className="mr-2" />
            Отправить оценку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingDialog;
