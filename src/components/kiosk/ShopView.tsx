import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import { Search, ShoppingCart, PackageOpen, Loader2, ImageIcon, SlidersHorizontal } from 'lucide-react';
import { useSmartPolling } from '../../hooks/useSmartPolling';
import type { OrderType } from '../../pages/CustomerKiosk';
import VariantSelectionModal, { type VariantSelection } from './VariantSelectionModal';
import { createCatalogCards, type GroupCatalogCard, type ProductLike } from '../../catalog/productDisplay';

export interface Product extends ProductLike {
  id: number;
  sku: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  image?: string;
  category_name?: string;
  category?: { name: string };
}

export interface CartItem extends Product {
  quantity: number;
}

interface ShopViewProps {
  setCurrentPage: (page: 'shop' | 'cart' | 'orders') => void;
  cart: CartItem[];
  addToCart: (product: ProductLike, quantity?: number) => boolean;
  orderType: OrderType;
  onChangeOrderType: (type: OrderType) => void;
  selectedCategory: string;
  categoryName?: string;
  onStockLimit: (product: ProductLike) => void;
  onOutOfStock: (productName: string) => void;
  onAddSelections: (selections: VariantSelection[]) => void;
}

export default function ShopView({
  setCurrentPage,
  cart,
  addToCart,
  selectedCategory,
  categoryName,
  onStockLimit,
  onOutOfStock,
  onAddSelections,
}: ShopViewProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<GroupCatalogCard | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const loadProducts = async () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (debouncedSearch) params.append('search', debouncedSearch);
    return api.get(`/products?${params.toString()}`);
  };

  const { data: products, isLoading, error, refetch } = useSmartPolling<Product[]>(loadProducts, {
    interval: 30000,
  });

  const skipInitialFetchRef = useRef(true);

  useEffect(() => {
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      return;
    }
    refetch();
  }, [selectedCategory, debouncedSearch, refetch]);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const catalogCards = createCatalogCards(products || []);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Browse Catalog</h2>
          <p className="text-sm text-slate-400 mt-0.5">Select items and add them to your cart</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setCurrentPage('orders')}
            className="hidden md:flex px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-all duration-200 text-sm"
          >
            My Orders
          </button>
          <button
            onClick={() => setCurrentPage('cart')}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-200 hover:shadow-lg transition-all duration-200 text-sm flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Cart
            {cartItemCount > 0 && (
              <span className="bg-white text-indigo-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Active Category Label - Desktop */}
      {selectedCategory && (
        <div className="hidden md:flex items-center gap-2 animate-fade-in">
          <span className="text-sm text-slate-400">Showing:</span>
          <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
            {categoryName || 'Category'}
          </span>
        </div>
      )}

      {/* Products Grid */}
      {isLoading && !products ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Loading products...</p>
        </div>
      ) : error && !products ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100 animate-fade-in">
          <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Failed to load products</p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Try again
          </button>
        </div>
      ) : catalogCards.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100 animate-fade-in">
          <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No products found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
          {catalogCards.map((card, index) => (
            <div
              key={card.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200 flex flex-col justify-between group overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div>
                {card.image ? (
                  <img src={card.image} alt={card.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border-b border-slate-100">
                    <ImageIcon className="w-10 h-10 text-slate-200" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {card.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wide">
                      {card.categoryName}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5">
                <div className="mb-3 space-y-1">
                  <span className="block whitespace-nowrap text-[13px] font-bold leading-5 text-emerald-600 sm:text-sm">
                    {card.priceLabel}
                  </span>
                  <span className={`block text-xs font-medium leading-4 ${card.totalStock > 0 ? 'text-slate-400' : 'text-red-500 font-semibold'}`}>
                    {card.stockLabel}
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (card.totalStock === 0) {
                      onOutOfStock(card.name);
                      return;
                    }

                    if (card.type === 'group') {
                      setSelectedGroup(card);
                      return;
                    }

                    addToCart(card.product);
                  }}
                  disabled={card.totalStock === 0}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-sm shadow-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {card.totalStock > 0 ? (
                    <span className="flex items-center justify-center gap-2">
                      {card.type === 'group' && <SlidersHorizontal className="h-4 w-4" />}
                      {card.type === 'group' ? 'Choose Options' : 'Add to Cart'}
                    </span>
                  ) : (
                    'Out of Stock'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <VariantSelectionModal
        card={selectedGroup}
        onClose={() => setSelectedGroup(null)}
        onAddSelections={onAddSelections}
        onLimit={onStockLimit}
      />
    </div>
  );
}
