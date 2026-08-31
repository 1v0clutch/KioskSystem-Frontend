import { useState } from 'react';
import { Menu, Shield, LogOut } from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardOverview from '../components/admin/DashboardOverview';
import ProductsManager from '../components/admin/ProductsManager';
import CategoriesManager from '../components/admin/CategoriesManager';
import OrdersManager from '../components/admin/OrdersManager';
import ReportsOverview from '../components/admin/ReportsOverview';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
  onProfile: () => void;
}

export default function AdminDashboard({ user, onLogout, onProfile }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'reports'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <AdminSidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        username={user?.username}
        onLogout={onLogout}
        onProfile={onProfile}
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden shrink-0 glass-strong border-b border-slate-200/60 z-30">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <h1 className="font-bold text-sm text-slate-900">Admin Portal</h1>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              aria-label="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin">
          {currentPage === 'dashboard' && <DashboardOverview />}
          {currentPage === 'products' && <ProductsManager />}
          {currentPage === 'categories' && <CategoriesManager />}
          {currentPage === 'orders' && <OrdersManager />}
          {currentPage === 'reports' && <ReportsOverview />}
        </main>
      </div>
    </div>
  );
}
