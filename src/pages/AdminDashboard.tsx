import { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import DashboardOverview from '../components/admin/DashboardOverview';
import ProductsManager from '../components/admin/ProductsManager';
import CategoriesManager from '../components/admin/CategoriesManager';
import OrdersManager from '../components/admin/OrdersManager';
import ReportsOverview from '../components/admin/ReportsOverview';

interface AdminDashboardProps {
  user: any;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'reports'>('dashboard');

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <AdminSidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        username={user?.username}
        onLogout={onLogout}
      />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 scrollbar-thin">
        {currentPage === 'dashboard' && <DashboardOverview />}
        {currentPage === 'products' && <ProductsManager />}
        {currentPage === 'categories' && <CategoriesManager />}
        {currentPage === 'orders' && <OrdersManager />}
        {currentPage === 'reports' && <ReportsOverview />}
      </main>
    </div>
  );
}
