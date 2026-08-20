import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import {
  DollarSign, ShoppingCart, TrendingUp, Package, AlertTriangle,
  Loader2, Clock, CheckCircle2, ChefHat, XCircle,
} from 'lucide-react';

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.get('/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm font-medium">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Sales', value: `₱${Number(stats.total_sales || 0).toFixed(2)}`, icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Orders Today', value: stats.orders_today || 0, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Revenue Today', value: `₱${Number(stats.revenue_today || 0).toFixed(2)}`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Active Products', value: stats.active_products || 0, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const getOrderIcon = (status: string) => {
    switch (status) {
      case 'Claimed': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'Ready': return { icon: ChefHat, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'Processing': return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'Cancelled': return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' };
      default: return { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard Overview</h2>
        <p className="text-sm text-slate-400 mt-0.5">Real-time stats and activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.label}</p>
                <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Low Stock Warning */}
      {stats.low_stock_count > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 animate-slide-up">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 text-sm">Low Stock Warning</h4>
            <p className="text-xs text-amber-600">{stats.low_stock_count} product{stats.low_stock_count !== 1 ? 's' : ''} below inventory threshold</p>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Recent Orders</h3>
        </div>
        {stats.recent_orders?.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400 text-sm">No recent orders</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recent_orders?.map((order: any, i: number) => {
              const statusStyle = getOrderIcon(order.status);
              const StatusIcon = statusStyle.icon;
              return (
                <div key={order.id} className="px-5 py-3.5 flex justify-between items-center hover:bg-slate-50/50 transition-colors animate-fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${statusStyle.bg} rounded-lg flex items-center justify-center`}>
                      <StatusIcon className={`w-4 h-4 ${statusStyle.color}`} />
                    </div>
                    <div>
                      <span className="font-mono font-semibold text-slate-800 text-sm">{order.receipt_id}</span>
                      <span className="text-[11px] text-slate-400 ml-2">
                        {new Date(order.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${statusStyle.bg} ${statusStyle.color}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">₱{Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
