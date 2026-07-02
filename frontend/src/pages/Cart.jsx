import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cart, updateQty, removeFromCart, total } = useContext(CartContext);
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-28 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2d3748] mb-6 sm:mb-8 mt-2 sm:mt-4">Keranjang Belanja</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <span className="material-icons-round text-6xl mb-4">shopping_cart</span>
          <p>Keranjang masih lapar!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* List Item Keranjang */}
          {cart.map(item => (
            <div key={item.idMeal} className="card-container p-4 flex gap-3 sm:gap-4 items-center bg-white rounded-3xl">
              <img 
                src={item.strMealThumb} 
                alt={item.strMeal} 
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0" 
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{item.strMeal}</h3>
                <p className="text-[#ff5722] font-semibold text-sm">
                  Rp {item.price.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 sm:gap-3 bg-gray-50 rounded-full px-3 sm:px-4 py-1">
                  <button 
                    onClick={() => updateQty(item.idMeal, -1)} 
                    className="text-gray-500 font-bold hover:text-[#ff5722]"
                  >
                    -
                  </button>
                  <span className="font-bold w-6 text-center">{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.idMeal, 1)} 
                    className="text-gray-500 font-bold hover:text-[#ff5722]"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.idMeal)} 
                  className="text-red-400 hover:text-red-600 text-xs mt-1"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}

          {/* Tombol CTA (Lanjut ke Pengiriman) */}
          <button 
            onClick={() => navigate('/checkout')} 
            className="w-full mt-8 bg-[#ff5722] text-white py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg shadow-[0_8px_16px_rgba(255,87,34,0.3)] hover:bg-[#e64a19] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span className="material-icons-round">east</span>
            Lanjut ke Pengiriman
          </button>
        </div>
      )}
    </div>
  );
}