import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: 'home' },
    { path: '/cart', icon: 'shopping_cart' },
    { path: '/orders', icon: 'receipt_long' }
  ];

  return (
    <nav className="fixed bottom-4 sm:bottom-[24px] left-1/2 transform -translate-x-1/2 w-[92%] max-w-[380px] bg-white rounded-full shadow-[0_12px_24px_rgba(0,0,0,0.1)] py-2.5 sm:py-3 px-5 sm:px-6 z-50">
      <ul className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li key={item.path}>
              <Link to={item.path} className={`flex justify-center items-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ${isActive ? 'bg-[#ff5722] text-white -translate-y-1 shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
                <span className="material-icons-round text-[28px] sm:text-[32px]">{item.icon}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}