import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  onLimit?: () => void;
}

export default function QuantityStepper({
  value,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  disabled = false,
  onChange,
  onLimit,
}: QuantityStepperProps) {
  const decreaseDisabled = disabled || value <= min;
  const increaseDisabled = disabled || value >= max;

  const updateValue = (next: number) => {
    if (next > max) {
      onLimit?.();
      return;
    }

    onChange(Math.max(min, next));
  };

  return (
    <div className="inline-flex h-9 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={() => updateValue(value - 1)}
        disabled={decreaseDisabled}
        className="flex h-9 w-9 items-center justify-center text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-300"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="min-w-10 px-2 text-center text-sm font-bold text-slate-800">{value}</span>
      <button
        type="button"
        onClick={() => updateValue(value + 1)}
        disabled={increaseDisabled}
        className="flex h-9 w-9 items-center justify-center text-slate-600 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-300"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
