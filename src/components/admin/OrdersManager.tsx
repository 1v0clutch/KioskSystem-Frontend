import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import {
  KeyRound, Loader2, ShoppingCart, ChevronRight, X,
  Package, User, Clock, Hash, Receipt, Search,
  PackageCheck, AlertTriangle, Store, Truck, MapPin, Phone,
} from 'lucide-react';

const STATUS_OPTIONS = ['All', 'Pending', 'Processing', 'Ready', 'Claimed', 'Cancelled'];

const STATUS_STYLES: Record<string, string> = {
  Claimed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Ready: 'bg-blue-50 text-blue-700 border-blue-200',
  Processing: 'bg-amber-50 text-amber-700 border-amber-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
  Pending: 'bg-slate-100 text-slate-600 border-slate-200',
};

const STATUS_COUNTS: Record<string, string> = {
  Claimed: 'bg-emerald-100 text-emerald-700',
  Ready: 'bg-blue-100 text-blue-700',
  Processing: 'bg-amber-100 text-amber-700',
  Cancelled: 'bg-red-100 text-red-700',
  Pending: 'bg-slate-200 text-slate-600',
};

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  product?: { id: number; name: string; stock: number };
}

interface Order {
  id: number;
  receipt_id: string;
  total: number;
  status: string;
  otp: string;
  otp_expiry: string;
  created_at: string;
  updated_at: string;
  order_type?: 'pickup' | 'delivery';
  contact_number?: string | null;
  delivery_address?: string | null;
  customer?: { id: number; username: string; email: string };
  cashier?: { id: number; username: string };
  items: OrderItem[];
}

const ORDER_TYPE_STYLES = {
  pickup: 'bg-indigo-50 text-indigo-600',
  delivery: 'bg-emerald-50 text-emerald-600',
};

function OrderTypeBadge({ type, compact = false }: { type?: 'pickup' | 'delivery'; compact?: boolean }) {
  if (!type) return null;
  const Icon = type === 'pickup' ? Store : Truck;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-bold uppercase tracking-wide ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10px]'
      } ${ORDER_TYPE_STYLES[type]}`}
    >
      <Icon className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {type === 'pickup' ? 'Pickup' : 'Delivery'}
    </span>
  );
}

export default function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [otpReceipt, setOtpReceipt] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [verifying, setVerifying] = useState(false);
  const lastTimestampRef = useRef<string | null>(null);
  const mountedRef = useRef(true);
  const checkInFlightRef = useRef(false);

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
    if (!lastTimestampRef.current || checkInFlightRef.current) return;
    checkInFlightRef.current = true;
    try {
      const data = await api.get(`/orders/check?since=${lastTimestampRef.current}`);
      if (mountedRef.current && data.orders?.length > 0) {
        setOrders(prev => {
          const updated = [...prev];
          data.orders.forEach((newOrder: Order) => {
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
    } finally {
      checkInFlightRef.current = false;
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

  const handleUpdateStatus = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status });
      if (res?.order) {
        setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(res.order);
        }
      } else {
        loadOrders(false);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpReceipt || !otpValue) return;
    setVerifying(true);
    try {
      await api.post('/orders/verify-otp', {
        receipt_id: otpReceipt,
        otp: otpValue,
      });
      setOtpReceipt('');
      setOtpValue('');
      loadOrders(false);
    } catch (error: any) {
      alert(error.message || 'OTP verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = activeFilter === 'All' || o.status === activeFilter;
    const matchesSearch = !searchQuery ||
      o.receipt_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.otp.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Orders Management</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage orders, update status, and verify OTPs</p>
      </div>

      {/* OTP Verification */}
      <div className="bg-indigo-50/50 border border-indigo-200 p-5 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="font-bold text-indigo-900 text-sm">Claim Order with OTP</h3>
        </div>
        <form onSubmit={handleVerifyOtp} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="Receipt ID (e.g. RCP-...)"
            required
            value={otpReceipt}
            onChange={(e) => setOtpReceipt(e.target.value)}
            className="px-4 py-2.5 bg-white border border-indigo-200 rounded-xl flex-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <input
            type="text"
            placeholder="6-digit OTP"
            required
            maxLength={6}
            value={otpValue}
            onChange={(e) => setOtpValue(e.target.value)}
            className="px-4 py-2.5 bg-white border border-indigo-200 rounded-xl w-full sm:w-36 text-sm font-mono font-bold tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={verifying}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {verifying ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verifying</>
            ) : 'Claim Order'}
          </button>
        </form>
      </div>

      {/* Status Filter Tabs + Search */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((status, i) => {
            const count = status === 'All' ? orders.length : (statusCounts[status] || 0);
            return (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 animate-fade-in-up ${
                  activeFilter === status
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
                }`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                {status}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeFilter === status ? 'bg-white/20' : (STATUS_COUNTS[status] || 'bg-slate-100 text-slate-500')
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt, customer, OTP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Content: Table + Detail Panel */}
      <div className="flex flex-col xl:flex-row gap-5">
        {/* Orders Table */}
        <div className={`${selectedOrder ? 'xl:w-1/2' : 'w-full'} min-w-0 transition-all duration-300`}>
          {isLoading && orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                {searchQuery || activeFilter !== 'All' ? 'No matching orders' : 'No orders yet'}
              </p>
              {(searchQuery || activeFilter !== 'All') && (
                <button
                  onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}
                  className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-sm min-w-[720px]">
                  <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="px-5 py-3">Receipt</th>
                      <th className="px-5 py-3">Type</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Items</th>
                      <th className="px-5 py-3">Total</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((o, i) => {
                      const isSelected = selectedOrder?.id === o.id;
                      const itemCount = o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                      return (
                        <tr
                          key={o.id}
                          onClick={() => setSelectedOrder(isSelected ? null : o)}
                          className={`cursor-pointer transition-all animate-fade-in-up ${
                            isSelected
                              ? 'bg-indigo-50/70 border-l-3 border-l-indigo-500'
                              : 'hover:bg-slate-50/50'
                          }`}
                          style={{ animationDelay: `${i * 30}ms` }}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              {!isSelected && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                              <span className="font-mono font-semibold text-slate-800 text-xs">{o.receipt_id}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <OrderTypeBadge type={o.order_type} compact />
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            {o.customer?.username || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {itemCount} item{itemCount !== 1 ? 's' : ''}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-emerald-600 text-sm">
                            ₱{Number(o.total).toFixed(2)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${STATUS_STYLES[o.status] || STATUS_STYLES.Pending}`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            {updatingId === o.id ? (
                              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin ml-auto" />
                            ) : (
                              <select
                                value={o.status}
                                onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Ready">Ready</option>
                                <option value="Claimed">Claimed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (
          <div className="w-full xl:w-1/2 min-w-0 animate-slide-up">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden xl:sticky xl:top-0">
              {/* Panel Header */}
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-500" />
                  <span className="font-mono font-bold text-sm text-slate-800">{selectedOrder.receipt_id}</span>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-7 h-7 rounded-lg hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Status + Total */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border ${STATUS_STYLES[selectedOrder.status] || STATUS_STYLES.Pending}`}>
                      {selectedOrder.status}
                    </span>
                    <OrderTypeBadge type={selectedOrder.order_type} />
                  </div>
                  <span className="text-xl font-bold text-emerald-600">
                    ₱{Number(selectedOrder.total).toFixed(2)}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 font-medium">Customer</span>
                    <span className="text-slate-800 font-semibold ml-auto">
                      {selectedOrder.customer?.username || '—'}
                    </span>
                  </div>
                  {selectedOrder.order_type === 'delivery' && selectedOrder.contact_number && (
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500 font-medium">Contact</span>
                      <span className="text-slate-800 font-semibold ml-auto font-mono">
                        {selectedOrder.contact_number}
                      </span>
                    </div>
                  )}
                  {selectedOrder.order_type === 'delivery' && selectedOrder.delivery_address && (
                    <div className="flex items-start gap-2 text-xs">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="text-slate-500 font-medium mt-0.5">Address</span>
                      <span className="text-slate-800 font-semibold ml-auto text-right max-w-[60%] break-words">
                        {selectedOrder.delivery_address}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 font-medium">Placed</span>
                    <span className="text-slate-800 font-semibold ml-auto">
                      {formatDate(selectedOrder.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500 font-medium">OTP</span>
                    <span className="font-mono font-bold text-indigo-600 tracking-wider ml-auto">
                      {selectedOrder.otp}
                    </span>
                  </div>
                  {selectedOrder.cashier && (
                    <div className="flex items-center gap-2 text-xs">
                      <PackageCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-500 font-medium">Cashier</span>
                      <span className="text-slate-800 font-semibold ml-auto">
                        {selectedOrder.cashier.username}
                      </span>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, i) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl animate-fade-in-up"
                        style={{ animationDelay: `${i * 40}ms` }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {item.product_name}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            ₱{Number(item.price).toFixed(2)} × {item.quantity}
                            {item.product && (
                              <span className="ml-2 text-slate-300">
                                (stock: {item.product.stock})
                              </span>
                            )}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-slate-800 ml-3">
                          ₱{Number(item.subtotal).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stock Warning */}
                {selectedOrder.status === 'Cancelled' && selectedOrder.items?.some(i => i.product && i.product.stock === 0) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">
                      Some items from this cancelled order are currently out of stock.
                    </p>
                  </div>
                )}

                {/* Quick Status Actions */}
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedOrder.status !== 'Processing' && selectedOrder.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'Processing')}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
                      >
                        Mark Processing
                      </button>
                    )}
                    {selectedOrder.status !== 'Ready' && selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Claimed' && (
                      <button
                        onClick={() => handleUpdateStatus(selectedOrder.id, 'Ready')}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                      >
                        Mark Ready
                      </button>
                    )}
                    {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Claimed' && (
                      <button
                        onClick={() => {
                          if (confirm(`Cancel order ${selectedOrder.receipt_id}? Stock will be restored to inventory.`)) {
                            handleUpdateStatus(selectedOrder.id, 'Cancelled');
                          }
                        }}
                        className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
