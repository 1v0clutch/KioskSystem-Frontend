import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Search, ShoppingCart, PackageOpen, Loader2, ImageIcon, LayoutGrid } from 'lucide-react';
import { useSmartPolling } from '../../hooks/useSmartPolling';
import type { OrderType } from '../../pages/CustomerKiosk';

export interface Product {
  id: number;
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
  addToCart: (product: Product) => void;
  orderType: OrderType;
  onChangeOrderType: (type: OrderType) => void;
}

export default function ShopView({ setCurrentPage, cart, addToCart }: ShopViewProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState('');

  const loadProducts = async () => {
    const params = new URLSearchParams();
    if (selectedCategory) params.append('category', selectedCategory);
    if (search) params.append('search', search);
    return api.get(`/products?${params.toString()}`);
  };

  const { data: products, isLoading, refetch } = useSmartPolling<Product[]>(loadProducts, {
    interval: 30000,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    refetch();
  }, [selectedCategory, search, refetch]);

  const loadCategories = async () => {
    try {
      const data = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-[calc(100vh-57px)]">
      {/* Category Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5" />
            Categories
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          <button
            onClick={() => setSelectedCategory('')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              selectedCategory === ''
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(String(cat.id))}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === String(cat.id)
                  ? 'bg-indigo-50 text-indigo-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Category Sidebar - Mobile Horizontal Scroll */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-4 py-2.5">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          <button
            onClick={() => setSelectedCategory('')}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border-2 transition-all duration-200 ${
              selectedCategory === ''
                ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(String(cat.id))}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border-2 transition-all duration-200 ${
                selectedCategory === String(cat.id)
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Browse Catalog</h2>
              <p className="text-sm text-slate-400 mt-0.5">Select items and add them to your cart</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setCurrentPage('orders')}
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-all duration-200 text-sm"
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
                {categories.find(c => String(c.id) === selectedCategory)?.name || 'Category'}
              </span>
              <button
                onClick={() => setSelectedCategory('')}
                className="text-xs text-slate-400 hover:text-slate-600 underline"
              >
                Clear
              </button>
            </div>
          )}

          {/* Products Grid */}
          {isLoading && !products ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">Loading products...</p>
            </div>
          ) : !products || products.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100 animate-fade-in">
              <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No products found</p>
              <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div key={`${selectedCategory}-${search}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200 flex flex-col justify-between group overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div>
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center border-b border-slate-100">
                        <ImageIcon className="w-10 h-10 text-slate-200" />
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                          {product.name}
                        </h3>
                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0 uppercase tracking-wide">
                          {product.category_name || product.category?.name || 'General'}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">
                        {product.description || 'Quality plasticware product'}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-lg font-bold text-emerald-600">
                        ₱{Number(product.price).toFixed(2)}
                      </span>
                      <span className={`text-xs font-medium ${product.stock > 0 ? 'text-slate-400' : 'text-red-500 font-semibold'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-sm shadow-indigo-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                    >
                      {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
