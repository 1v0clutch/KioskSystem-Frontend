import {
  LayoutDashboard, Package, Tags, ShoppingCart, BarChart3,
  LogOut, Shield,
  UserRound,
} from 'lucide-react';

interface AdminSidebarProps {
  currentPage: 'dashboard' | 'products' | 'categories' | 'orders' | 'reports';
  setCurrentPage: (page: 'dashboard' | 'products' | 'categories' | 'orders' | 'reports') => void;
  username?: string;
  onLogout: () => void;
  onProfile: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ currentPage, setCurrentPage, username, onLogout, onProfile, mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as const, label: 'Products', icon: Package },
    { id: 'categories' as const, label: 'Categories', icon: Tags },
    { id: 'orders' as const, label: 'Orders', icon: ShoppingCart },
    { id: 'reports' as const, label: 'Reports', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fade-in"
        />
      )}

      <aside
        className={`fixed md:sticky inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white h-screen flex flex-col shadow-xl shrink-0 transition-transform duration-200 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-white leading-tight">Admin Portal</h1>
              <p className="text-xs text-slate-400 font-medium">{username || 'Administrator'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const active = currentPage === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  onCloseMobile?.();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <button
            onClick={() => {
              onProfile();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 transition-all duration-200"
          >
            <UserRound className="w-4 h-4" />
            <span>Profile</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-950/40 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
