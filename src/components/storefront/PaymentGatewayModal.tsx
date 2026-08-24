import React, { useState } from 'react';
import { X, Lock, ShieldCheck, CheckCircle2, Smartphone, CreditCard, ArrowRight, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, StoreSettings } from '../../types';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'card';
  language: Language;
  settings: StoreSettings;
  onSuccess: (transactionId: string) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  amount,
  paymentMethod,
  language,
  settings,
  onSuccess,
}) => {
  const [step, setStep] = useState<'pin' | 'processing' | 'success'>('pin');
  const [pin, setPin] = useState('');
  const [generatedTrx, setGeneratedTrx] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setStep('pin');
      setPin('');
      setGeneratedTrx('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isBn = language === 'bn';
  const isBkash = paymentMethod === 'bkash';
  const isNagad = paymentMethod === 'nagad';
  const isRocket = paymentMethod === 'rocket';
  const isUpay = paymentMethod === 'upay';
  const isCard = paymentMethod === 'card';

  const themeBg = isBkash ? 'bg-[#E2136E]' : isNagad ? 'bg-[#E35925]' : isRocket ? 'bg-[#8C349B]' : isUpay ? 'bg-[#00A651]' : 'bg-slate-900';
  const brandName = isBkash ? 'bKash Payment' : isNagad ? 'Nagad Online Payment' : isRocket ? 'Rocket Payment' : isUpay ? 'Upay Payment' : 'Secure Card Checkout';

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleNextStep = () => {
    if (step === 'pin') {
      setStep('processing');
      setTimeout(() => {
        const trx = (isBkash ? 'BK' : isNagad ? 'NG' : isRocket ? 'RK' : isUpay ? 'UP' : 'CRD') + Math.floor(100000000 + Math.random() * 900000000).toString();
        setGeneratedTrx(trx);
        setStep('success');
        triggerConfetti();
        setTimeout(() => {
          onSuccess(trx);
        }, 1500);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Gateway Brand Header */}
        <div className={`${themeBg} text-white px-6 py-5 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              {isCard ? <CreditCard className="w-5 h-5 text-white" /> : <Smartphone className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight tracking-wide">{brandName}</h3>
              <p className="text-[11px] text-white/80">{settings.storeName}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
            <span className="text-xs text-white/80">{isBn ? 'পরিশোধযোগ্য টাকা' : 'Payable Amount'}:</span>
            <span className="text-xl font-extrabold font-mono tracking-tight text-white">৳{amount}</span>
          </div>
        </div>

        {/* Gateway Body */}
        <div className="p-6">


          {step === 'pin' && (
            <div className="space-y-4 text-center">
              <div>
                <p className="text-xs font-semibold text-white">
                  {isBn ? 'আপনার গোপন পিন (PIN) নাম্বার দিন' : 'Enter Your Secret PIN'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isBn ? 'নিরাপদ লেনদেনের জন্য পিন প্রদান করুন' : 'Demo: Enter any 4-5 digit PIN'}
                </p>
              </div>

              <div className="relative">
                <input
                  type="password"
                  maxLength={5}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="•••••"
                  className="w-full text-center text-xl tracking-widest font-mono font-bold py-2.5 border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white/[0.04] text-white"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
              </div>

              <button
                onClick={handleNextStep}
                className={`w-full py-3 rounded-xl font-bold text-xs text-white ${themeBg} hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-lg`}
              >
                <span>{isBn ? 'পেমেন্ট সম্পন্ন করুন' : 'Complete Payment'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 border-4 border-white/10 border-t-pink-500 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-white">
                {isBn ? 'পেমেন্ট প্রসেস হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...' : 'Processing secure payment, please wait...'}
              </p>
              <p className="text-[10px] text-slate-400">Encrypted 256-Bit SSL Connection</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-6 text-center space-y-3">
              <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-base text-white">
                {isBn ? 'পেমেন্ট সফল হয়েছে!' : 'Payment Successful!'}
              </h4>
              <p className="text-xs text-slate-300">
                {isBn ? 'ট্রানজেকশন আইডি:' : 'TrxID:'} <span className="font-mono font-bold text-emerald-400">{generatedTrx}</span>
              </p>
            </div>
          )}

          {/* Security badge footer */}
          <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>100% Secure PCI-DSS Level 1 Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
};
