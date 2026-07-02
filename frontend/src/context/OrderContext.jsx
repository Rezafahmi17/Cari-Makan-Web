import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { orderApi } from '../api/api';

export const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderError, setOrderError] = useState('');

  const loadOrders = useCallback(async (options = {}) => {
    const { silent = false } = options;

    if (!silent) setLoadingOrders(true);
    setOrderError('');

    try {
      const data = await orderApi.getAll();
      setOrders(data.data || []);
    } catch (err) {
      setOrderError(err.message || 'Gagal memuat pesanan');
    } finally {
      if (!silent) setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const intervalId = setInterval(() => {
      loadOrders({ silent: true });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [loadOrders]);

  const placeOrder = async (guestData, cartItems) => {
    const data = await orderApi.create({
      customer: guestData,
      items: cartItems.map((item) => ({
        menu_id: Number(item.idMeal),
        qty: Number(item.qty),
      })),
    });

    setOrders((prev) => [data.data, ...prev]);
    return data.data;
  };

  const updateOrderStatus = async (orderId, status) => {
    let previousOrders = [];

    setOrders((prev) => {
      previousOrders = prev;
      return prev.map((order) => (
        order.id === orderId ? { ...order, status } : order
      ));
    });

    try {
      const data = await orderApi.updateStatus(orderId, status);
      setOrders((prev) => prev.map((order) => (
        order.id === orderId ? data.data : order
      )));
      return data.data;
    } catch (err) {
      setOrders(previousOrders);
      await loadOrders({ silent: true });
      throw err;
    }
  };

  const value = useMemo(() => ({
    orders,
    loadingOrders,
    orderError,
    loadOrders,
    placeOrder,
    updateOrderStatus,
  }), [orders, loadingOrders, orderError, loadOrders]);

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}
