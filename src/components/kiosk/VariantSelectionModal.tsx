import { useEffect, useMemo, useState } from 'react';
import { PackageOpen, ShoppingCart } from 'lucide-react';
import Modal from '../ui/Modal';
import QuantityStepper from '../ui/QuantityStepper';
import {
  getProductImage,
  getVariantLabel,
  peso,
  type GroupCatalogCard,
  type ProductLike,
} from '../../catalog/productDisplay';

export interface VariantSelection {
  product: ProductLike;
  quantity: number;
}

interface VariantSelectionModalProps {
  card: GroupCatalogCard | null;
  onClose: () => void;
  onAddSelections: (selections: VariantSelection[]) => void;
  onLimit: (product: ProductLike) => void;
}

export default function VariantSelectionModal({
  card,
  onClose,
  onAddSelections,
  onLimit,
}: VariantSelectionModalProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    setQuantities({});
  }, [card?.id]);

  const selections = useMemo(() => {
    if (!card) return [];

    return card.products
      .map((product) => ({ product, quantity: quantities[product.id] || 0 }))
      .filter((selection) => selection.quantity > 0);
  }, [card, quantities]);

  if (!card) return null;

  const selectedCount = selections.reduce((sum, selection) => sum + selection.quantity, 0);
  const selectedTotal = selections.reduce(
    (sum, selection) => sum + Number(selection.product.price) * selection.quantity,
    0,
  );
  const unitLabel = card.group.unitLabel || 'item';
  const unitLabelPlural = selectedCount === 1 ? unitLabel : `${unitLabel}s`;

  const updateQuantity = (product: ProductLike, quantity: number) => {
    setQuantities((current) => ({
      ...current,
      [product.id]: Math.min(quantity, Number(product.stock || 0)),
    }));
  };

  const submitSelections = () => {
    if (selections.length === 0) return;

    onAddSelections(selections);
    onClose();
  };

  return (
    <Modal
      open={Boolean(card)}
      title={card.name}
      description={card.description}
      maxWidthClass="max-w-4xl"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Selected</p>
            <p className="text-sm font-semibold text-slate-900">
              {selectedCount} {unitLabelPlural} - {peso(selectedTotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={submitSelections}
            disabled={selectedCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            <ShoppingCart className="h-4 w-4" />
            Add Selected
          </button>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
          {card.image ? (
            <img src={card.image} alt={card.name} className="h-72 w-full object-cover lg:h-full" />
          ) : (
            <div className="flex h-72 items-center justify-center">
              <PackageOpen className="h-12 w-12 text-slate-300" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          {card.products.map((product) => {
            const variant = getVariantLabel(card.group, product.sku);
            const stock = Number(product.stock || 0);
            const quantity = quantities[product.id] || 0;
            const image = getProductImage(product, card.group.image);

            return (
              <div
                key={product.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:border-slate-200"
              >
                <div className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {image ? (
                      <img src={image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <PackageOpen className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-slate-900">{variant?.label || product.name}</h3>
                        {variant?.detail && <p className="text-xs font-medium text-slate-500">{variant.detail}</p>}
                        <p className="mt-1 text-xs leading-5 text-slate-400">{product.name}</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-bold text-emerald-600">{peso(Number(product.price))}</p>
                        <p className={`text-xs font-medium ${stock > 0 ? 'text-slate-400' : 'text-red-500'}`}>
                          {stock > 0 ? `${stock} available` : 'Out of stock'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <QuantityStepper
                        value={quantity}
                        max={stock}
                        disabled={stock === 0}
                        onChange={(next) => updateQuantity(product, next)}
                        onLimit={() => onLimit(product)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
