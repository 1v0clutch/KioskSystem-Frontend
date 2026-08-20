import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import {
  ArrowLeft, PackageOpen, Loader2, Clock, CheckCircle2,
  XCircle, ChefHat, KeyRound, Package, ChevronDown, ChevronUp,
  Ban, Store, Truck,
} from 'lucide-react';
import type { OrderType } from '../../pages/CustomerKiosk';

interface OrdersViewProps {
  setCurrentPage: (page: 'shop' | 'cart' | 'orders') => void;
  orderType: OrderType;
}

export default function OrdersView({ setCurrentPage }: OrdersViewProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const lastTimestampRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  const loadOrders = async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    try {
      const data = await api.get('/orders');
      if (mountedRef.current) {
        setOrders(data);
        lastTimestampRef.current = new Date().toISOString();
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  const checkForUpdates = async () => {
    if (!lastTimestampRef.current) return;
    try {
      const data = await api.get(`/orders/check?since=${lastTimestampRef.current}`);
      if (mountedRef.current && data.orders?.length > 0) {
        setOrders(prev => {
          const updated = [...prev];
          data.orders.forEach((newOrder: any) => {
            const idx = updated.findIndex(o => o.id === newOrder.id);
            if (idx >= 0) {
              updated[idx] = newOrder;
            } else {
              updated.unshift(newOrder);
            }
          });
          return updated;
        });
        lastTimestampRef.current = data.timestamp;
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    loadOrders(true);
    const interval = setInterval(checkForUpdates, 3000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to cancel this order? Stock will be restored to inventory.')) return;
    setCancellingId(orderId);
    try {
      const res = await api.put(`/orders/${orderId}/cancel`, {});
      if (res?.order) {
        setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
      } else {
        loadOrders(false);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Claimed':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle2 };
      case 'Ready':
        return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: ChefHat };
      case 'Processing':
        return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock };
      case 'Cancelled':
        return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: XCircle };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', icon: Clock };
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Orders</h2>
          <p className="text-xs text-slate-400 mt-0.5">Track your recent orders</p>
        </div>
        <button
          onClick={() => setCurrentPage('shop')}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-sm transition-all duration-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Loading orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100 space-y-4 animate-fade-in">
          <PackageOpen className="w-14 h-14 text-slate-300 mx-auto" />
          <div>
            <p className="text-slate-600 font-medium">No orders yet</p>
            <p className="text-sm text-slate-400 mt-1">Place your first order from the shop</p>
          </div>
          <button
            onClick={() => setCurrentPage('shop')}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all text-sm"
          >
            Browse Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const isActive = order.status !== 'Claimed' && order.status !== 'Cancelled';
            const isExpanded = expandedId === order.id;
            const itemCount = order.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Order Header - Clickable */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 ${statusConfig.bg} rounded-xl flex items-center justify-center`}>
                        <StatusIcon className={`w-4 h-4 ${statusConfig.text}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900 text-sm font-mono">{order.receipt_id}</h3>
                          {order.order_type && (
                            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              order.order_type === 'pickup'
                                ? 'bg-indigo-50 text-indigo-600'
                                : 'bg-emerald-50 text-emerald-600'
                            }`}>
                              {order.order_type === 'pickup' ? <Store className="w-2.5 h-2.5" /> : <Truck className="w-2.5 h-2.5" />}
                              {order.order_type === 'pickup' ? 'Pickup' : 'Delivery'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {new Date(order.created_at).toLocaleString()} · {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                        {order.status}
                      </span>
                      <span className="text-lg font-bold text-emerald-600">
                        ₱{Number(order.total).toFixed(2)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-4 animate-slide-down">
                    {/* OTP Section */}
                    {isActive && (
                      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2">
                          <KeyRound className="w-4 h-4 text-indigo-500" />
                          <div>
                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Pickup OTP</span>
                            <span className="text-[11px] text-indigo-400">Present to cashier when claiming</span>
                          </div>
                        </div>
                        <span className="text-2xl font-mono font-black text-indigo-600 tracking-[0.15em]">{order.otp}</span>
                      </div>
                    )}

                    {/* Order Items */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        Items
                      </h4>
                      <div className="space-y-2">
                        {order.items?.map((item: any, itemIdx: number) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl animate-fade-in-up" style={{ animationDelay: `${itemIdx * 40}ms` }}>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{item.product_name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                ₱{Number(item.price).toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-slate-800">
                              ₱{Number(item.subtotal).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cancel Button */}
                    {(order.status === 'Pending' || order.status === 'Processing') && (
                      <div className="pt-2 border-t border-slate-100">
                        {cancellingId === order.id ? (
                          <div className="flex items-center justify-center gap-2 py-2 text-sm text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Cancelling...
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm rounded-xl border border-red-200 hover:border-red-300 transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Ban className="w-4 h-4" />
                            Cancel Order
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
