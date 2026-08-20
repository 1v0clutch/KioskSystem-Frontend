import { Package, LogOut, Store, Truck } from 'lucide-react';
import type { OrderType } from '../../pages/CustomerKiosk';

interface KioskNavbarProps {
  username?: string;
  onLogout: () => void;
  orderType: OrderType;
}

export default function KioskNavbar({ username, onLogout, orderType }: KioskNavbarProps) {
  return (
    <nav className="glass-strong border-b border-slate-200/60 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Plasticware Kiosk</h1>
            <p className="text-[11px] text-slate-400 font-medium -mt-0.5">Self-Service Ordering</p>
          </div>
          <h1 className="sm:hidden text-lg font-bold text-slate-900">Plasticware</h1>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
            orderType === 'pickup'
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}>
            {orderType === 'pickup' ? <Store className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
            {orderType === 'pickup' ? 'Pickup' : 'Delivery'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/50">
            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-600">
                {(username || 'C')[0].toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-slate-600 font-medium">
              {username || 'Customer'}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
