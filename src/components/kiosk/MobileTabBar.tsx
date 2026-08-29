import { Store, ShoppingCart, Receipt } from 'lucide-react';

interface MobileTabBarProps {
  currentPage: 'shop' | 'cart' | 'orders';
  setCurrentPage: (page: 'shop' | 'cart' | 'orders') => void;
  cartCount: number;
}

export default function MobileTabBar({ currentPage, setCurrentPage, cartCount }: MobileTabBarProps) {
  const tabs = [
    { id: 'shop' as const, label: 'Shop', icon: Store },
    { id: 'cart' as const, label: 'Cart', icon: ShoppingCart },
    { id: 'orders' as const, label: 'Orders', icon: Receipt },
  ];

  return (
    <nav className="md:hidden shrink-0 bg-white border-t border-slate-200 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 flex">
      {tabs.map((tab) => {
        const active = currentPage === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentPage(tab.id)}
            className={`relative flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[11px] font-bold transition-all duration-200 ${
              active ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className="w-5 h-5" />
            {tab.label}
            {tab.id === 'cart' && cartCount > 0 && (
              <span className="absolute top-0 right-1/4 min-w-[18px] h-[18px] px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
