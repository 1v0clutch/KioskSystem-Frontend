import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import KioskNavbar from '../components/kiosk/KioskNavbar';
import CategorySidebar from '../components/kiosk/CategorySidebar';
import MobileCategoryChips from '../components/kiosk/MobileCategoryChips';
import MobileTabBar from '../components/kiosk/MobileTabBar';
import ShopView, { type Product, type CartItem } from '../components/kiosk/ShopView';
import CartView from '../components/kiosk/CartView';
import OrdersView from '../components/kiosk/OrdersView';
import OrderTypeSelector from '../components/kiosk/OrderTypeSelector';

interface CustomerKioskProps {
  user: any;
  onLogout: () => void;
  onProfile: () => void;
}

export type OrderType = 'pickup' | 'delivery';

export default function CustomerKiosk({ user, onLogout, onProfile }: CustomerKioskProps) {
  const [currentPage, setCurrentPage] = useState<'shop' | 'cart' | 'orders'>('shop');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

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

  useEffect(() => {
    api.get('/categories')
      .then(setCategories)
      .catch((error: unknown) => console.error('Failed to load categories:', error));
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

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!orderType) {
    return <OrderTypeSelector onSelect={handleSelectOrderType} />;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 font-sans">
      {/* Category rail - desktop */}
      <CategorySidebar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <KioskNavbar username={user?.username} onLogout={onLogout} onProfile={onProfile} orderType={orderType} />

        {/* Category chips - mobile */}
        <MobileCategoryChips
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          {currentPage === 'shop' && (
            <ShopView
              setCurrentPage={setCurrentPage}
              cart={cart}
              addToCart={addToCart}
              orderType={orderType}
              onChangeOrderType={handleSelectOrderType}
              selectedCategory={selectedCategory}
              categoryName={categories.find(c => String(c.id) === selectedCategory)?.name}
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

        {/* Tab bar - mobile */}
        <MobileTabBar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          cartCount={cartItemCount}
        />
      </div>
    </div>
  );
}
