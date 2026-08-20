import { useState } from 'react';
import { api } from '../../api/client';
import type { CartItem } from './ShopView';
import type { OrderType } from '../../pages/CustomerKiosk';
import {
  ArrowLeft, ShoppingCart, Minus, Plus, Trash2, CheckCircle2,
  Loader2, PackageOpen, Receipt, KeyRound, CreditCard,
  Store, Truck,
} from 'lucide-react';

interface CartViewProps {
  setCurrentPage: (page: 'shop' | 'cart' | 'orders') => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  orderType: OrderType;
  onChangeOrderType: (type: OrderType) => void;
  onResetSession: () => void;
}

export default function CartView({ setCurrentPage, cart, setCart, orderType, onChangeOrderType, onResetSession }: CartViewProps) {
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const updateQuantity = (productId: number, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.stock) {
          alert('Cannot exceed available stock');
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean) as CartItem[];

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (productId: number) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }));
      const response = await api.post('/orders', { items, order_type: orderType });
      setReceipt(response);
      setCart([]);
      localStorage.removeItem('cart');
    } catch (error: any) {
      setErrorMsg(error.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (receipt) {
    return (
      <div className="max-w-lg mx-auto p-4 sm:p-6 animate-scale-in">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Order Placed!</h2>
            <p className="text-sm text-slate-400">Present this receipt and OTP at the counter</p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">
            {orderType === 'pickup' ? <Store className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
            {orderType === 'pickup' ? 'Pickup Order' : 'Delivery Order'}
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
            {receipt.qr_code && (
              <img src={receipt.qr_code} alt="Order QR Code" className="w-40 h-40 mx-auto rounded-xl shadow-md border border-slate-200" />
            )}
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center justify-center gap-1">
                <Receipt className="w-3 h-3" /> Receipt ID
              </p>
              <p className="text-lg font-mono font-bold text-slate-800">{receipt.receipt_id}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
              <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-widest mb-1 flex items-center justify-center gap-1">
                <KeyRound className="w-3 h-3" /> Verification OTP
              </p>
              <p className="text-4xl font-mono font-black text-indigo-600 tracking-[0.2em]">{receipt.otp}</p>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" /> Total
              </span>
              <span className="text-xl font-bold text-emerald-600">₱{Number(receipt.total).toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onResetSession}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-md shadow-indigo-200 transition-all duration-200 text-sm"
            >
              New Order
            </button>
            <button
              onClick={() => { setCurrentPage('orders'); }}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-all duration-200 text-sm"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Shopping Cart</h2>
            <p className="text-xs text-slate-400">{cart.length} item{cart.length !== 1 ? 's' : ''} in cart</p>
          </div>
        </div>
        <button
          onClick={() => setCurrentPage('shop')}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-sm transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm animate-slide-down">
          {errorMsg}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100 space-y-4 animate-fade-in">
          <PackageOpen className="w-14 h-14 text-slate-300 mx-auto" />
          <div>
            <p className="text-slate-600 font-medium">Your cart is empty</p>
            <p className="text-sm text-slate-400 mt-1">Browse the catalog to add items</p>
          </div>
          <button
            onClick={() => setCurrentPage('shop')}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Order Type Toggle */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Order Type</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onChangeOrderType('pickup')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                  orderType === 'pickup'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Store className="w-4 h-4" />
                Pickup
              </button>
              <button
                onClick={() => onChangeOrderType('delivery')}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition-all duration-200 ${
                  orderType === 'delivery'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Truck className="w-4 h-4" />
                Delivery
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-3">
            {cart.map((item, index) => (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">{item.name}</h3>
                  <p className="text-slate-400 text-xs mt-0.5">₱{Number(item.price).toFixed(2)} each</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-3 py-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-1.5 font-bold text-sm text-slate-800 min-w-[2rem] text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-3 py-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="font-bold text-sm text-slate-900 min-w-[5rem] text-right">
                    ₱{(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-slate-500">Total</span>
              <span className="text-2xl font-bold text-emerald-600">
                ₱{Number(total).toFixed(2)}
              </span>
            </div>
            <button
              onClick={checkout}
              disabled={loading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-200 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm & Place Order'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
