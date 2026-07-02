import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { MealProvider } from './context/MealContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { OrderProvider } from './context/OrderContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OrderProvider>
      <MealProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </MealProvider>
    </OrderProvider>
  </React.StrictMode>
);