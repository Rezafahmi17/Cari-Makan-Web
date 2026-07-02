import { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { OrderContext } from '../context/OrderContext';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const { cart, total, clearCart } = useContext(CartContext);
  const { placeOrder } = useContext(OrderContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [guest, setGuest] = useState({ name: '', phone: '', address: '' });

  const handleSelesaikanPesanan = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      setError('Keranjang masih kosong.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await placeOrder(guest, cart, total);
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.message || 'Pesanan gagal dibuat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-8 pt-6 sm:pt-8 pb-28">
      <h1 className="text-2xl font-bold mb-6">Data Pengiriman</h1>
      <form onSubmit={handleSelesaikanPesanan} className="bg-white p-4 sm:p-6 rounded-[24px] shadow-sm flex flex-col gap-4">
        {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">{error}</p>}
        <input required type="text" placeholder="Nama Lengkap" className="p-3 bg-gray-50 rounded-xl" onChange={e => setGuest({...guest, name: e.target.value})} />
        <input required type="text" placeholder="Nomor Telepon" className="p-3 bg-gray-50 rounded-xl" onChange={e => setGuest({...guest, phone: e.target.value})} />
        <textarea required placeholder="Alamat Lengkap" className="p-3 bg-gray-50 rounded-xl h-24" onChange={e => setGuest({...guest, address: e.target.value})}></textarea>
        <div className="flex justify-between text-sm font-bold bg-gray-50 p-3 rounded-xl">
          <span>Total</span>
          <span className="text-[#ff5722]">Rp {total.toLocaleString('id-ID')}</span>
        </div>
        <button disabled={loading} type="submit" className="w-full bg-[#ff5722] text-white py-3 rounded-full font-bold disabled:opacity-60">
          {loading ? 'Memproses...' : 'Selesaikan Pesanan'}
        </button>
      </form>
    </div>
  );
}
