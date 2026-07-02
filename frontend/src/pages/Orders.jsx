import { useContext, useEffect } from 'react';
import { OrderContext } from '../context/OrderContext';

function getStatusClass(status) {
  if (status === 'Completed') return 'bg-green-100 text-green-700';
  if (status === 'Dibatalkan') return 'bg-red-100 text-red-700';
  if (status === 'Diproses') return 'bg-blue-100 text-blue-700';
  return 'bg-orange-100 text-orange-700';
}

export default function Orders() {
  const { orders, loadingOrders, orderError, loadOrders } = useContext(OrderContext);

  useEffect(() => {
    loadOrders({ silent: true });
  }, [loadOrders]);

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-6 pt-4 pb-28">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 sm:mb-8 mt-2 sm:mt-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2d3748]">Struk Pesanan</h1>
        <span className="w-fit text-xs font-bold text-green-700 bg-green-50 px-3 py-2 rounded-full">
          Auto refresh aktif
        </span>
      </div>

      {orderError && <p className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-xl">{orderError}</p>}
      {loadingOrders && <p className="text-center text-gray-400">Memuat pesanan...</p>}

      <div className="flex flex-col gap-6 sm:gap-8">
        {!loadingOrders && orders.length === 0 ? <p className="text-center text-gray-400">Belum ada pesanan.</p> :
          orders.map((order) => (
            <div key={order.id} className="bg-white p-4 sm:p-6 shadow-xl rounded-lg border border-gray-200 relative overflow-hidden">
              <div className="absolute -left-3 top-10 w-6 h-6 bg-[#f8f9fa] rounded-full"></div>
              <div className="absolute -right-3 top-10 w-6 h-6 bg-[#f8f9fa] rounded-full"></div>
              <div className="text-center mb-6">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-widest text-[#ff5722]">CariMakan</h2>
                <p className="text-xs text-gray-400">{new Date(order.date).toLocaleString('id-ID')}</p>
                <p className="text-xs font-bold mt-2">
                  <span className={`inline-flex px-3 py-1 rounded-full ${getStatusClass(order.status)}`}>
                    Status: {order.status}
                  </span>
                </p>
                <div className="my-4 border-b-2 border-dashed border-gray-300"></div>
              </div>
              <div className="text-sm space-y-2 mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 font-bold">
                  <span>ID:</span>
                  <span className="break-all sm:text-right">{order.id}</span>
                </div>
                <div className="my-2 border-b border-dashed border-gray-300"></div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-3">
                    <span className="min-w-0 break-words">{item.qty}x {item.strMeal}</span>
                    <span className="shrink-0">Rp {(Number(item.price) * Number(item.qty)).toLocaleString('id-ID')}</span>
                  </div>
                ))}
                <div className="my-2 border-b border-dashed border-gray-300"></div>
                <p className="font-bold break-words">Dikirim ke: {order.customer.name}</p>
                <p className="text-gray-500 break-words">{order.customer.address}</p>
              </div>
              <div className="border-t-2 border-dashed border-gray-300 pt-4 flex justify-between items-center gap-3">
                <span className="font-bold">TOTAL</span>
                <span className="text-lg sm:text-xl font-extrabold text-[#ff5722] whitespace-nowrap">Rp {Number(order.total).toLocaleString('id-ID')}</span>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}
