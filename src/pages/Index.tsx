import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { recipes, Recipe } from '@/data/recipes';

interface Tip {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [servingsMultiplier, setServingsMultiplier] = useState<{ [key: number]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(storedFavorites);
  }, []);

  const tips: Tip[] = [
    {
      id: 1,
      title: 'Яйца комнатной температуры',
      description: 'Доставайте яйца из холодильника за 30 минут до готовки — они лучше взбиваются',
      icon: 'Egg'
    },
    {
      id: 2,
      title: 'Острые ножи',
      description: 'Регулярно затачивайте ножи — это безопаснее и удобнее для нарезки',
      icon: 'Slice'
    },
    {
      id: 3,
      title: 'Mise en place',
      description: 'Подготовьте все ингредиенты заранее — готовка пойдёт быстрее и легче',
      icon: 'ChefHat'
    }
  ];

  const toggleFavorite = (id: number) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const getAdjustedServings = (recipeId: number, baseServings: number) => {
    return servingsMultiplier[recipeId] || baseServings;
  };

  const updateServings = (recipeId: number, newServings: number) => {
    setServingsMultiplier(prev => ({
      ...prev,
      [recipeId]: Math.max(1, newServings)
    }));
  };

  const getIngredientAmount = (ingredient: string, baseServings: number, currentServings: number) => {
    const multiplier = currentServings / baseServings;
    const match = ingredient.match(/^(\d+)(г|мл|шт)?/);
    if (match) {
      const amount = parseInt(match[1]);
      const unit = match[2] || '';
      const rest = ingredient.replace(match[0], '');
      return `${Math.round(amount * multiplier)}${unit}${rest}`;
    }
    return ingredient;
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = searchQuery === '' || 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      (selectedCategory === 'main' && recipe.category === 'Основное блюдо') ||
      (selectedCategory === 'baking' && (recipe.category === 'Выпечка' || recipe.category === 'Десерт')) ||
      (selectedCategory === 'salads' && recipe.category === 'Салат') ||
      (selectedCategory === 'soups' && recipe.category === 'Суп') ||
      (selectedCategory === 'breakfast' && recipe.category === 'Завтрак');
    
    return matchesSearch && matchesCategory;
  });

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    const currentServings = getAdjustedServings(recipe.id, recipe.servings);
    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => navigate(`/recipe?id=${recipe.id}`)}>
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(recipe.id);
            }}
          >
            <Icon
              name="Heart"
              size={20}
              className={favorites.includes(recipe.id) ? 'fill-red-500 text-red-500' : ''}
            />
          </Button>
        </div>
        <CardHeader className="cursor-pointer" onClick={() => navigate(`/recipe?id=${recipe.id}`)}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-xl">{recipe.title}</CardTitle>
          </div>
          <CardDescription className="text-base">{recipe.description}</CardDescription>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Icon name="Clock" size={14} />
              {recipe.time}
            </Badge>
            <Badge variant="outline">{recipe.difficulty}</Badge>
            <Badge>{recipe.category}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-muted p-3 rounded-lg">
              <span className="text-sm font-semibold">Порций:</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateServings(recipe.id, currentServings - 1)}
                >
                  <Icon name="Minus" size={16} />
                </Button>
                <span className="font-bold text-lg min-w-[2ch] text-center">
                  {currentServings}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateServings(recipe.id, currentServings + 1)}
                >
                  <Icon name="Plus" size={16} />
                </Button>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Icon name="ShoppingBasket" size={16} />
                Ингредиенты:
              </h4>
              <ul className="space-y-1 text-sm">
                {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      {getIngredientAmount(ingredient, recipe.servings, currentServings)}
                    </span>
                  </li>
                ))}
                {recipe.ingredients.length > 3 && (
                  <li className="text-muted-foreground">
                    + еще {recipe.ingredients.length - 3}
                  </li>
                )}
              </ul>
            </div>
            <Button className="w-full" onClick={() => navigate(`/recipe?id=${recipe.id}`)}>
              <Icon name="BookOpen" size={16} className="mr-2" />
              Читать рецепт
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="ChefHat" size={32} className="text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Домашняя Кухня</h1>
            </div>
            <nav className="flex gap-6">
              <Button variant="ghost" className="text-lg">Рецепты</Button>
              <Button variant="ghost" className="text-lg">Лайфхаки</Button>
              <Button 
                variant="ghost" 
                className="text-lg flex items-center gap-2"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('favorites');
                }}
              >
                <Icon name="Heart" size={20} />
                Избранное {favorites.length > 0 && `(${favorites.length})`}
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary/10 via-secondary/20 to-accent/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6 text-foreground animate-fade-in">
            Готовьте с удовольствием
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in">
            Простые и вкусные рецепты для домашней кухни. Советы от опытных кулинаров и полезные лайфхаки
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Поиск по названию или ингредиентам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-full shadow-lg"
              />
            </div>
            {searchQuery && (
              <p className="mt-4 text-muted-foreground">
                Найдено рецептов: {filteredRecipes.length}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold">
              {selectedCategory === 'favorites' ? 'Избранные рецепты' : 'Все рецепты'}
            </h3>
            <TabsList>
              <TabsTrigger value="all">Все</TabsTrigger>
              <TabsTrigger value="main">Основное</TabsTrigger>
              <TabsTrigger value="soups">Супы</TabsTrigger>
              <TabsTrigger value="salads">Салаты</TabsTrigger>
              <TabsTrigger value="baking">Выпечка</TabsTrigger>
              <TabsTrigger value="breakfast">Завтрак</TabsTrigger>
              <TabsTrigger value="favorites">
                <Icon name="Heart" size={16} className="mr-1" />
                Избранное
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={selectedCategory}>
            {selectedCategory === 'favorites' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.filter(r => favorites.includes(r.id)).length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Icon name="Heart" size={64} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Избранное пусто</h3>
                    <p className="text-muted-foreground">Добавьте рецепты в избранное, нажав на сердечко</p>
                  </div>
                ) : (
                  recipes.filter(r => favorites.includes(r.id)).map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Icon name="Search" size={64} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Ничего не найдено</h3>
                    <p className="text-muted-foreground">Попробуйте изменить запрос или выбрать другую категорию</p>
                  </div>
                ) : (
                  filteredRecipes.map(recipe => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      <section className="bg-secondary/30 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Полезные лайфхаки</h3>
            <p className="text-muted-foreground text-lg">Маленькие хитрости для большого результата</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {tips.map((tip) => (
              <Card key={tip.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Icon name={tip.icon as any} size={24} className="text-primary" />
                  </div>
                  <CardTitle className="text-xl">{tip.title}</CardTitle>
                  <CardDescription className="text-base">{tip.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-foreground/5 py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Icon name="ChefHat" size={28} className="text-primary" />
            <h4 className="text-2xl font-bold">Домашняя Кухня</h4>
          </div>
          <p className="text-muted-foreground mb-6">Готовьте с любовью, делитесь радостью</p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" size="icon">
              <Icon name="Mail" size={20} />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon name="Instagram" size={20} />
            </Button>
            <Button variant="ghost" size="icon">
              <Icon name="Youtube" size={20} />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
