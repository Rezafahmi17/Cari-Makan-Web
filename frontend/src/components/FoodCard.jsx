import { Link } from 'react-router-dom';

export default function FoodCard({ meal }) {
  return (
    <Link 
      to={`/detail/${meal.idMeal}`} 
      className="card-container block cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#ff5722]/20 hover:-translate-y-2 bg-white rounded-[24px] overflow-hidden"
    >
      <div className="overflow-hidden">
        <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-44 sm:h-48 object-cover" />
      </div>
      <div className="p-4 sm:p-6">
        <h3 className="font-bold text-base sm:text-lg text-[#2d3748] truncate">{meal.strMeal}</h3>
        <p className="text-sm text-gray-500 mt-1">{meal.strArea} Culinary</p>
        <div className="mt-5 sm:mt-6 flex justify-between items-center gap-3">
          <span className="font-bold text-[#ff5722] text-base sm:text-lg">Rp {Number(meal.price).toLocaleString('id-ID')}</span>
          <span className="material-icons-round text-[#ff5722]">arrow_forward</span>
        </div>
      </div>
    </Link>
  );
}