import { LayoutGrid } from 'lucide-react';

interface MobileCategoryChipsProps {
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function MobileCategoryChips({ categories, selectedCategory, onSelectCategory }: MobileCategoryChipsProps) {
  const chipClass = (active: boolean) =>
    `shrink-0 px-4 py-2 rounded-full text-xs font-bold border-2 transition-all duration-200 ${
      active
        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
        : 'bg-slate-50 border-slate-200 text-slate-500'
    }`;

  return (
    <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5">
      <div className="flex items-center gap-2">
        <LayoutGrid className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1 -mb-1">
          <button onClick={() => onSelectCategory('')} className={chipClass(selectedCategory === '')}>
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(String(cat.id))}
              className={chipClass(selectedCategory === String(cat.id))}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
