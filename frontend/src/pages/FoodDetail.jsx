import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { menuApi } from '../api/api';

export default function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      setError('');
      try {
        const data = await menuApi.getById(id);
        setMeal(data.data);
      } catch (err) {
        setError(err.message || 'Menu tidak ditemukan');
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [id]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!meal) return <div className="p-6 text-center">Menu tidak ditemukan.</div>;

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen pb-28">
      <div className="relative">
        <button onClick={() => navigate(-1)} className="absolute top-4 sm:top-6 left-4 sm:left-6 z-10 bg-white/80 p-2 rounded-full backdrop-blur-sm shadow-md">
          <span className="material-icons-round text-gray-800">arrow_back</span>
        </button>
        <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-[240px] sm:h-[300px] object-cover" />
      </div>
      
      <div className="p-4 sm:p-6 rounded-t-[32px] bg-white -mt-8 relative z-20">
        <h1 className="text-2xl font-bold mb-2">{meal.strMeal}</h1>
        <p className="text-[#ff5722] font-bold text-xl mb-6">Rp {Number(meal.price).toLocaleString('id-ID')}</p>
        
        <h3 className="font-bold mb-3">Deskripsi Menu</h3>
        <p className="text-gray-600 leading-relaxed text-sm">{meal.strInstructions}</p>
        
        <button 
          onClick={() => { 
            addToCart(meal); 
            navigate('/cart'); 
          }}
          className="w-full mt-8 bg-[#ff5722] text-white py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-[0_8px_16px_rgba(255,87,34,0.3)] hover:bg-[#e64a19] transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="material-icons-round">shopping_cart</span>
          Tambah ke Keranjang
        </button>
      </div>
    </div>
  );
}
