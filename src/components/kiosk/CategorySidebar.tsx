import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { LayoutGrid, Loader2 } from 'lucide-react';

interface CategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function CategorySidebar({ selectedCategory, onSelectCategory }: CategorySidebarProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const itemClass = (active: boolean) =>
    `w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-indigo-50 text-indigo-700 font-bold'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <aside className="hidden md:flex flex-col w-56 lg:w-64 bg-white border-r border-slate-200 h-screen shrink-0 sticky top-0">
      {/* Header */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200">
            <LayoutGrid className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900 leading-tight">Catalog</h1>
            <p className="text-xs text-slate-400 font-medium">Browse by category</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto scrollbar-thin">
        <button
          onClick={() => onSelectCategory('')}
          className={itemClass(selectedCategory === '')}
        >
          All Products
        </button>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
          </div>
        ) : (
          categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(String(cat.id))}
              className={itemClass(selectedCategory === String(cat.id))}
            >
              {cat.name}
            </button>
          ))
        )}
      </nav>
    </aside>
  );
}
