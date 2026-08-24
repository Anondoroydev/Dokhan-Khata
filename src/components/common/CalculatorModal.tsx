import React, { useState } from 'react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [expr, setExpr] = useState<string>('');
  const [result, setResult] = useState<string>('');

  const append = (v: string) => {
    setExpr((s) => s + v);
  };

  const clearAll = () => {
    setExpr('');
    setResult('');
  };

  const safeEvaluate = (input: string) => {
    // Allow only digits, operators, decimal point, parentheses and spaces
    if (!/^[0-9+\-*/(). \t]+$/.test(input)) {
      return 'ERR';
    }
    try {
      // eslint-disable-next-line no-new-func
      // Use Function to evaluate safely after validation
      // Wrap in Math to avoid access to globals
      // Note: This is a minimal evaluator suitable for simple arithmetic.
      // For more complex needs, replace with a proper expression parser.
      // Avoid using user-supplied side-effectful expressions.
      // Evaluate
      // eslint-disable-next-line no-new-func
      const res = Function(`"use strict"; return (${input})`)();
      if (typeof res === 'number' && isFinite(res)) return String(res);
      return 'ERR';
    } catch (e) {
      return 'ERR';
    }
  };

  const handleEquals = () => {
    const r = safeEvaluate(expr);
    setResult(r);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xs bg-slate-900 rounded-2xl border border-white/10 shadow-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">Calculator</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setExpr((s) => s.slice(0, -1)); }}
              className="px-2 py-1 text-xs rounded bg-white/5 text-white"
            >
              ←
            </button>
            <button
              onClick={() => { clearAll(); }}
              className="px-2 py-1 text-xs rounded bg-rose-500/10 text-rose-300"
            >
              C
            </button>
            <button
              onClick={onClose}
              className="px-2 py-1 text-xs rounded bg-white/5 text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-md mb-3">
          <div className="text-xs text-slate-400 truncate">{expr || '0'}</div>
          <div className="text-right text-lg font-mono text-white">{result || ''}</div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','%','+'].map((k) => (
            <button
              key={k}
              onClick={() => append(k === '%' ? '/100' : k)}
              className="py-2 rounded-lg bg-white/5 text-white font-bold"
            >
              {k}
            </button>
          ))}

          <button
            onClick={handleEquals}
            className="col-span-4 py-2 rounded-lg bg-emerald-500 text-white font-bold"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
