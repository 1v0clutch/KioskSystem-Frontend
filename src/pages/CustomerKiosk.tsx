import { useState, useEffect, useCallback } from 'react';
import KioskNavbar from '../components/kiosk/KioskNavbar';
import ShopView, { type Product, type CartItem } from '../components/kiosk/ShopView';
import CartView from '../components/kiosk/CartView';
import OrdersView from '../components/kiosk/OrdersView';
import OrderTypeSelector from '../components/kiosk/OrderTypeSelector';

interface CustomerKioskProps {
  user: any;
  onLogout: () => void;
}

export type OrderType = 'pickup' | 'delivery';

export default function CustomerKiosk({ user, onLogout }: CustomerKioskProps) {
  const [currentPage, setCurrentPage] = useState<'shop' | 'cart' | 'orders'>('shop');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType | null>(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      } catch {
        localStorage.removeItem('cart');
      }
    }

    const savedOrderType = localStorage.getItem('orderType');
    if (savedOrderType === 'pickup' || savedOrderType === 'delivery') {
      setOrderType(savedOrderType);
    }
  }, []);

  const handleSelectOrderType = (type: OrderType) => {
    setOrderType(type);
    localStorage.setItem('orderType', type);
  };

  const handleResetSession = useCallback(() => {
    setOrderType(null);
    setCart([]);
    setCurrentPage('shop');
    localStorage.removeItem('orderType');
    localStorage.removeItem('cart');
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    let newCart;

    if (existing) {
      if (existing.quantity >= product.stock) {
        alert('Cannot add more than available stock');
        return;
      }
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  if (!orderType) {
    return <OrderTypeSelector onSelect={handleSelectOrderType} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <KioskNavbar username={user?.username} onLogout={onLogout} orderType={orderType} />
      <main className="flex-1">
        {currentPage === 'shop' && (
          <ShopView
            setCurrentPage={setCurrentPage}
            cart={cart}
            addToCart={addToCart}
            orderType={orderType}
            onChangeOrderType={handleSelectOrderType}
          />
        )}
        {currentPage === 'cart' && (
          <CartView
            setCurrentPage={setCurrentPage}
            cart={cart}
            setCart={setCart}
            orderType={orderType}
            onChangeOrderType={handleSelectOrderType}
            onResetSession={handleResetSession}
          />
        )}
        {currentPage === 'orders' && (
          <OrdersView setCurrentPage={setCurrentPage} orderType={orderType} />
        )}
      </main>
    </div>
  );
}
