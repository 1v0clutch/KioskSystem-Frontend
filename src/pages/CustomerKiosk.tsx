import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import KioskNavbar from '../components/kiosk/KioskNavbar';
import CategorySidebar from '../components/kiosk/CategorySidebar';
import MobileCategoryChips from '../components/kiosk/MobileCategoryChips';
import MobileTabBar from '../components/kiosk/MobileTabBar';
import ShopView, { type CartItem } from '../components/kiosk/ShopView';
import CartView from '../components/kiosk/CartView';
import OrdersView from '../components/kiosk/OrdersView';
import OrderTypeSelector from '../components/kiosk/OrderTypeSelector';
import { useToast } from '../components/ui/ToastProvider';
import type { ProductLike } from '../catalog/productDisplay';
import type { VariantSelection } from '../components/kiosk/VariantSelectionModal';

interface CustomerKioskProps {
  user: any;
  onLogout: () => void;
  onProfile: () => void;
}

export type OrderType = 'pickup' | 'delivery';

export default function CustomerKiosk({ user, onLogout, onProfile }: CustomerKioskProps) {
  const { notify } = useToast();
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

  const persistCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (product: ProductLike, quantity = 1, showToast = true) => {
    if (product.stock <= 0) {
      notify({ type: 'warning', title: 'Out of stock', message: `${product.name} is not available right now.` });
      return false;
    }

    const existing = cart.find(item => item.id === product.id);
    let newCart: CartItem[];

    if (existing) {
      const nextQuantity = existing.quantity + quantity;

      if (nextQuantity > product.stock) {
        notify({
          type: 'warning',
          title: 'Stock limit reached',
          message: `${product.name} only has ${product.stock} available.`,
        });
        return false;
      }

      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: nextQuantity }
          : item
      );
    } else {
      if (quantity > product.stock) {
        notify({
          type: 'warning',
          title: 'Stock limit reached',
          message: `${product.name} only has ${product.stock} available.`,
        });
        return false;
      }

      newCart = [...cart, { ...product, quantity } as CartItem];
    }

    persistCart(newCart);

    if (showToast) {
      notify({ type: 'success', title: 'Added to cart', message: `${quantity} x ${product.name}` });
    }

    return true;
  };

  const addSelectionsToCart = (selections: VariantSelection[]) => {
    let nextCart = cart;
    let addedCount = 0;

    for (const { product, quantity } of selections) {
      const existing = nextCart.find(item => item.id === product.id);

      if (existing) {
        const nextQuantity = existing.quantity + quantity;
        if (nextQuantity > product.stock) {
          notify({
            type: 'warning',
            title: 'Some items were skipped',
            message: `${product.name} only has ${product.stock} available.`,
          });
          continue;
        }

        nextCart = nextCart.map(item =>
          item.id === product.id ? { ...item, quantity: nextQuantity } : item
        );
      } else {
        if (quantity > product.stock) {
          notify({
            type: 'warning',
            title: 'Some items were skipped',
            message: `${product.name} only has ${product.stock} available.`,
          });
          continue;
        }

        nextCart = [...nextCart, { ...product, quantity } as CartItem];
      }

      addedCount += quantity;
    }

    persistCart(nextCart);

    if (addedCount > 0) {
      notify({
        type: 'success',
        title: 'Added selected items',
        message: `${addedCount} item${addedCount === 1 ? '' : 's'} added to your cart.`,
      });
    }
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
              onStockLimit={(product) => notify({
                type: 'warning',
                title: 'Stock limit reached',
                message: `${product.name} only has ${product.stock} available.`,
              })}
              onOutOfStock={(productName) => notify({
                type: 'warning',
                title: 'Out of stock',
                message: `${productName} is not available right now.`,
              })}
              onAddSelections={addSelectionsToCart}
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
