import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import FoodDetail from './pages/FoodDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import BottomNav from './components/BottomNav';
import Checkout from './pages/Checkout';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={!isAdminRoute ? "pb-[120px]" : ""}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detail/:id" element={<FoodDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
      {!isAdminRoute && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

