import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { recipes } from '@/data/recipes';
import RatingStars from '@/components/RatingStars';
import RatingDialog from '@/components/RatingDialog';
import { useToast } from '@/hooks/use-toast';

const Recipe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const recipeId = parseInt(searchParams.get('id') || '1');
  const recipe = recipes.find(r => r.id === recipeId);
  
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [isFavorite, setIsFavorite] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(recipeId));

    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
    const recipeRatings = ratings[recipeId] || { total: 0, count: 0 };
    setCurrentRating(recipeRatings.count > 0 ? recipeRatings.total / recipeRatings.count : recipe?.rating || 8.5);
    setRatingsCount(recipeRatings.count);
  }, [recipeId, recipe]);

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Рецепт не найден</h2>
          <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
        </div>
      </div>
    );
  }

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let newFavorites;
    if (favorites.includes(recipeId)) {
      newFavorites = favorites.filter((id: number) => id !== recipeId);
    } else {
      newFavorites = [...favorites, recipeId];
    }
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepIndex)
        ? prev.filter(i => i !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const getIngredientAmount = (ingredient: string) => {
    const multiplier = servings / recipe.servings;
    const match = ingredient.match(/^(\d+)(г|мл|шт|ч\.л\.|ст\.л\.)?/);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2] || '';
      const rest = ingredient.replace(match[0], '');
      return `${Math.round(amount * multiplier)}${unit}${rest}`;
    }
    return ingredient;
  };

  const progress = (completedSteps.length / recipe.steps.length) * 100;

  const handleRatingSubmit = (rating: number) => {
    const ratings = JSON.parse(localStorage.getItem('ratings') || '{}');
    const recipeRatings = ratings[recipeId] || { total: 0, count: 0 };
    
    recipeRatings.total += rating;
    recipeRatings.count += 1;
    
    ratings[recipeId] = recipeRatings;
    localStorage.setItem('ratings', JSON.stringify(ratings));
    
    setCurrentRating(recipeRatings.total / recipeRatings.count);
    setRatingsCount(recipeRatings.count);
    
    toast({
      title: 'Спасибо за оценку!',
      description: `Вы поставили ${rating}/10 для этого рецепта`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/')} className="flex items-center gap-2">
              <Icon name="ArrowLeft" size={20} />
              Назад
            </Button>
            <div className="flex items-center gap-3">
              <Icon name="ChefHat" size={28} className="text-primary" />
              <h1 className="text-2xl font-bold">Домашняя Кухня</h1>
            </div>
            <Button
              variant={isFavorite ? 'default' : 'outline'}
              onClick={toggleFavorite}
              className="flex items-center gap-2"
            >
              <Icon name="Heart" size={20} className={isFavorite ? 'fill-current' : ''} />
              {isFavorite ? 'В избранном' : 'В избранное'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-96 rounded-xl overflow-hidden">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <h1 className="text-4xl font-bold mb-3">{recipe.title}</h1>
                  <p className="text-xl opacity-90">{recipe.description}</p>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-2xl">Информация</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Icon name="Clock" size={16} />
                      {recipe.time}
                    </Badge>
                    <Badge variant="outline">{recipe.difficulty}</Badge>
                    <Badge>{recipe.category}</Badge>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Рейтинг рецепта</p>
                      <RatingStars rating={currentRating} readonly size={24} />
                      <p className="text-sm text-muted-foreground mt-2">
                        {ratingsCount > 0 ? `${ratingsCount} ${ratingsCount === 1 ? 'оценка' : ratingsCount < 5 ? 'оценки' : 'оценок'}` : 'Нет оценок'}
                      </p>
                    </div>
                    <Button onClick={() => setShowRatingDialog(true)} className="flex items-center gap-2">
                      <Icon name="Star" size={16} />
                      Оценить рецепт
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {recipe.tips && (
              <Card className="bg-accent/20 border-accent">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="Lightbulb" size={20} className="text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-2">Совет шеф-повара</CardTitle>
                      <CardDescription className="text-base">{recipe.tips}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Icon name="ListOrdered" size={24} />
                  Пошаговая инструкция
                </CardTitle>
                <CardDescription>
                  Прогресс: {completedSteps.length} из {recipe.steps.length}
                </CardDescription>
                <Progress value={progress} className="mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {recipe.steps.map((step, index) => {
                  const isCompleted = completedSteps.includes(index);
                  return (
                    <div
                      key={index}
                      className={`flex gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                        isCompleted
                          ? 'bg-primary/5 border-primary/30'
                          : 'bg-white border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleStep(index)}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold transition-all ${
                          isCompleted
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? <Icon name="Check" size={20} /> : index + 1}
                      </div>
                      <p className={`text-lg leading-relaxed ${isCompleted ? 'line-through opacity-60' : ''}`}>
                        {step}
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Icon name="ShoppingBasket" size={20} />
                  Ингредиенты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 bg-muted p-4 rounded-lg">
                  <span className="font-semibold">Порций:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setServings(Math.max(1, servings - 1))}
                    >
                      <Icon name="Minus" size={16} />
                    </Button>
                    <span className="font-bold text-xl min-w-[3ch] text-center">{servings}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setServings(servings + 1)}
                    >
                      <Icon name="Plus" size={16} />
                    </Button>
                  </div>
                </div>

                <ul className="space-y-3">
                  {recipe.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded transition-colors">
                      <Icon name="Check" size={20} className="text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-base">{getIngredientAmount(ingredient)}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full" size="lg">
                  <Icon name="Printer" size={20} className="mr-2" />
                  Распечатать рецепт
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Похожие рецепты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {recipes
                .filter(r => r.category === recipe.category && r.id !== recipe.id)
                .slice(0, 4)
                .map(r => (
                  <Card
                    key={r.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      navigate(`/recipe?id=${r.id}`);
                      window.scrollTo(0, 0);
                      setCompletedSteps([]);
                    }}
                  >
                    <img src={r.image} alt={r.title} className="w-full h-32 object-cover" />
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">{r.title}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <Icon name="Clock" size={12} />
                          {r.time}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <RatingDialog
        open={showRatingDialog}
        onOpenChange={setShowRatingDialog}
        onSubmit={handleRatingSubmit}
        recipeName={recipe.title}
      />
    </div>
  );
};

export default Recipe;