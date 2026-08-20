import { Package, Truck, Store } from 'lucide-react';

interface OrderTypeSelectorProps {
  onSelect: (type: 'pickup' | 'delivery') => void;
}

export default function OrderTypeSelector({ onSelect }: OrderTypeSelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome!</h1>
          <p className="text-sm text-slate-400">How would you like to receive your order?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onSelect('pickup')}
            className="group bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-100 transition-all duration-300 flex flex-col items-center gap-4 cursor-pointer"
          >
            <div className="w-16 h-16 bg-indigo-100 group-hover:bg-indigo-600 rounded-2xl flex items-center justify-center transition-colors duration-300">
              <Store className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Pickup</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Pick up your order at the store counter</p>
            </div>
          </button>

          <button
            onClick={() => onSelect('delivery')}
            className="group bg-white p-8 rounded-3xl shadow-sm border-2 border-slate-100 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 flex flex-col items-center gap-4 cursor-pointer"
          >
            <div className="w-16 h-16 bg-emerald-100 group-hover:bg-emerald-600 rounded-2xl flex items-center justify-center transition-colors duration-300">
              <Truck className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Delivery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Have your order delivered to your address</p>
            </div>
          </button>
        </div>

        <p className="text-center text-[11px] text-slate-300 font-medium">
          You can change this before checkout
        </p>
      </div>
    </div>
  );
}
