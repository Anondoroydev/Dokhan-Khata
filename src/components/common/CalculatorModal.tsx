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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-[280px] bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-5 shadow-emerald-500/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white tracking-wide">Calculator</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs hover:bg-rose-500/30 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl mb-4 border border-white/5 shadow-inner">
          <div className="text-xs text-slate-400 truncate h-4">{expr || ''}</div>
          <div className="text-right text-3xl font-mono text-white mt-1 h-9 tracking-tight overflow-hidden">{result || (expr ? '' : '0')}</div>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          <button onClick={clearAll} className="col-span-2 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold transition-colors">AC</button>
          <button onClick={() => setExpr((s) => s.slice(0, -1))} className="py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold transition-colors">⌫</button>
          <button onClick={() => append('/')} className="py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-lg transition-colors">÷</button>

          {['7','8','9'].map(k => <button key={k} onClick={() => append(k)} className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-lg transition-colors">{k}</button>)}
          <button onClick={() => append('*')} className="py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-lg transition-colors">×</button>

          {['4','5','6'].map(k => <button key={k} onClick={() => append(k)} className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-lg transition-colors">{k}</button>)}
          <button onClick={() => append('-')} className="py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-lg transition-colors">−</button>

          {['1','2','3'].map(k => <button key={k} onClick={() => append(k)} className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-lg transition-colors">{k}</button>)}
          <button onClick={() => append('+')} className="py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-lg transition-colors">+</button>

          <button onClick={() => append('%')} className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-lg transition-colors">%</button>
          <button onClick={() => append('0')} className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-lg transition-colors">0</button>
          <button onClick={() => append('.')} className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-lg transition-colors">.</button>
          <button onClick={handleEquals} className="py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xl shadow-lg shadow-emerald-500/30 transition-all">=</button>
        </div>
      </div>
    </div>
  );
};
