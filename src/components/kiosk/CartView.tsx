import { useState } from 'react';
import { api } from '../../api/client';
import type { CartItem } from './ShopView';
import type { OrderType } from '../../pages/CustomerKiosk';
import QuantityStepper from '../ui/QuantityStepper';
import { useToast } from '../ui/ToastProvider';
import {
  ArrowLeft, ShoppingCart, Trash2, CheckCircle2,
  Loader2, PackageOpen, Receipt, KeyRound, CreditCard,
  Store, Truck, Phone, MapPin, AlertCircle,
} from 'lucide-react';

interface CartViewProps {
  setCurrentPage: (page: 'shop' | 'cart' | 'orders') => void;
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  orderType: OrderType;
  onChangeOrderType: (type: OrderType) => void;
  onResetSession: () => void;
}

const DELIVERY_FEE = 10;
const DELIVERY_MINIMUM_SUBTOTAL = 100;
const DELIVERY_MINIMUM_ITEM_COUNT = 5;

export default function CartView({ setCurrentPage, cart, setCart, orderType, onChangeOrderType, onResetSession }: CartViewProps) {
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ contact?: string; address?: string }>({});

  const validateDeliveryDetails = () => {
    if (orderType !== 'delivery') return true;
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (itemCount < DELIVERY_MINIMUM_ITEM_COUNT && subtotal < DELIVERY_MINIMUM_SUBTOTAL) {
      notify({
        type: 'warning',
        title: 'Delivery minimum not met',
        message: `Delivery needs at least ${DELIVERY_MINIMUM_ITEM_COUNT} items or PHP ${DELIVERY_MINIMUM_SUBTOTAL.toFixed(2)} in products before the PHP ${DELIVERY_FEE.toFixed(2)} fee.`,
      });
      return false;
    }

    const errors: { contact?: string; address?: string } = {};
    const digitsOnly = contactNumber.replace(/[^0-9]/g, '');
    if (!contactNumber.trim()) {
      errors.contact = 'Contact number is required for delivery';
    } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      errors.contact = 'Enter a valid contact number';
    }
    if (!deliveryAddress.trim()) {
      errors.address = 'Delivery address is required';
    } else if (deliveryAddress.trim().length < 10) {
      errors.address = 'Please enter a complete address';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateQuantity = (productId: number, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.stock) {
          notify({
            type: 'warning',
            title: 'Stock limit reached',
            message: `${item.name} only has ${item.stock} available.`,
          });
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
    setErrorMsg('');
    if (!validateDeliveryDetails()) return;
    setLoading(true);

    try {
      const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }));
      const payload: any = { items, order_type: orderType };
      if (orderType === 'delivery') {
        payload.contact_number = contactNumber.trim();
        payload.delivery_address = deliveryAddress.trim();
      }
      const response = await api.post('/orders', payload);
      setReceipt(response);
      setCart([]);
      localStorage.removeItem('cart');
    } catch (error: any) {
      setErrorMsg(error.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;
  const deliveryMinimumMet = orderType !== 'delivery'
    || itemCount >= DELIVERY_MINIMUM_ITEM_COUNT
    || subtotal >= DELIVERY_MINIMUM_SUBTOTAL;

  if (receipt) {
    return (
      <div className="max-w-lg mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 animate-scale-in">
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

          {orderType === 'delivery' && receipt.delivery_address && (
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-left space-y-1.5">
              <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-widest flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Deliver To
              </p>
              <p className="text-sm font-semibold text-slate-800">{receipt.delivery_address}</p>
              {receipt.contact_number && (
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> {receipt.contact_number}
                </p>
              )}
            </div>
          )}

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
            {orderType === 'delivery' && (
              <div className="rounded-xl bg-white p-3 text-left text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Products</span>
                  <span className="font-semibold text-slate-700">₱{Number(receipt.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="mt-1 flex justify-between">
                  <span>Delivery fee</span>
                  <span className="font-semibold text-slate-700">₱{Number(receipt.delivery_fee || 0).toFixed(2)}</span>
                </div>
              </div>
            )}
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
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5">
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
                onClick={() => { onChangeOrderType('pickup'); setFieldErrors({}); }}
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

          {/* Delivery Details - required for delivery orders */}
          {orderType === 'delivery' && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4 animate-fade-in">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Delivery Details</h3>
                  <p className="text-[11px] text-slate-400">
                    Requires 5 items or PHP 100.00 product subtotal, plus PHP 10.00 delivery fee
                  </p>
                </div>
              </div>

              {!deliveryMinimumMet && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium leading-5 text-amber-700 animate-slide-down">
                  Delivery is available once your cart has at least {DELIVERY_MINIMUM_ITEM_COUNT} items or PHP {DELIVERY_MINIMUM_SUBTOTAL.toFixed(2)} in products.
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="e.g. 0917 123 4567"
                    value={contactNumber}
                    onChange={(e) => {
                      setContactNumber(e.target.value);
                      if (fieldErrors.contact) setFieldErrors(prev => ({ ...prev, contact: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all text-sm ${
                      fieldErrors.contact
                        ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {fieldErrors.contact && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 animate-slide-down">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.contact}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    rows={2}
                    placeholder="House / Unit, Street, Barangay, City, Landmark"
                    value={deliveryAddress}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      if (fieldErrors.address) setFieldErrors(prev => ({ ...prev, address: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none transition-all text-sm resize-none ${
                      fieldErrors.address
                        ? 'border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400'
                        : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {fieldErrors.address && (
                  <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 animate-slide-down">
                    <AlertCircle className="w-3 h-3" /> {fieldErrors.address}
                  </p>
                )}
              </div>
            </div>
          )}

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
                  <QuantityStepper
                    value={item.quantity}
                    min={1}
                    max={item.stock}
                    onChange={(nextQuantity) => updateQuantity(item.id, nextQuantity - item.quantity)}
                    onLimit={() => notify({
                      type: 'warning',
                      title: 'Stock limit reached',
                      message: `${item.name} only has ${item.stock} available.`,
                    })}
                  />
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
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-slate-500">Products</span>
                <span className="font-bold text-slate-900">₱{Number(subtotal).toFixed(2)}</span>
              </div>
              {orderType === 'delivery' && (
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-500">Delivery fee</span>
                  <span className="font-bold text-slate-900">₱{Number(deliveryFee).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-base font-medium text-slate-500">Total</span>
                <span className="text-2xl font-bold text-emerald-600">
                ₱{Number(total).toFixed(2)}
                </span>
              </div>
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
