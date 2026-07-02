import { useContext } from 'react';
import { MealContext } from '../context/MealContext';
import FoodCard from '../components/FoodCard';

export default function Home() {
  const { meals, loading, error, searchQuery, setSearchQuery } = useContext(MealContext);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10 pb-28">
      <header className="mb-8 sm:mb-12 mt-4 sm:mt-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2d3748] mb-3 sm:mb-4">CariMakan</h1>
        <p className="text-gray-500 text-base sm:text-lg">Temukan makanan favoritmu di sini.</p>
      </header>

      <div className="relative mb-8">
        <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
        <input 
          type="text" 
          placeholder="Search menu..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white rounded-full py-3.5 sm:py-4 pl-12 pr-5 sm:pr-6 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border-none focus:outline-none focus:ring-2 focus:ring-[#ff5722]"
        />
      </div>

      {error && <p className="mb-6 text-sm text-red-500 bg-red-50 p-4 rounded-2xl">{error}</p>}

      {loading ? (
        <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff5722]"></div></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {meals.length === 0 ? (
            <p className="text-gray-400">Menu tidak ditemukan.</p>
          ) : (
            meals.map(meal => <FoodCard key={meal.idMeal} meal={meal} />)
          )}
        </div>
      )}
    </div>
  );
}
