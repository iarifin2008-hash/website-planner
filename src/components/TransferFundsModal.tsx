import React, { useState } from 'react';
import { WalletItem } from '../types';
import { 
  ArrowRightLeft, 
  X, 
  Check, 
  Building2, 
  Smartphone, 
  Banknote, 
  CreditCard,
  Sparkles,
  ArrowDown
} from 'lucide-react';

interface TransferFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletItem[];
  theme: any;
  onTransfer: (sourceWalletId: string, targetWalletId: string, amount: number, note: string) => void;
}

export const TransferFundsModal: React.FC<TransferFundsModalProps> = ({
  isOpen,
  onClose,
  wallets,
  theme,
  onTransfer
}) => {
  if (!isOpen || wallets.length < 2) return null;

  const [fromId, setFromId] = useState(wallets[0]?.id || '');
  const [toId, setToId] = useState(wallets[1]?.id || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);

  const formatRupiah = (num: number) => {
    return 'Rp ' + Math.round(num || 0).toLocaleString('id-ID');
  };

  const fromWallet = wallets.find(w => w.id === fromId) || wallets[0];
  const toWallet = wallets.find(w => w.id === toId) || wallets[1];

  const handleSwap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0 || fromId === toId) return;

    onTransfer(fromId, toId, Number(amount), notes.trim());
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setAmount('');
      setNotes('');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: theme.primary }}
            >
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Pindah / Transfer Saldo Kas
              </h3>
              <p className="text-xs text-slate-500">
                Tarik tunai, top-up e-wallet, atau mutasi antar rekening
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* From Wallet */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sumber Kas (Saldo Berkurang)
            </label>
            <select
              value={fromId}
              onChange={e => setFromId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id} disabled={w.id === toId}>
                  {w.name} (Modal Awal: {formatRupiah(w.initialBalance)})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2 bg-white border border-slate-200 rounded-full shadow-sm text-slate-600 hover:text-sky-600 hover:border-sky-300 transition cursor-pointer"
              title="Tukar Posisi"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* To Wallet */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tujuan Kas (Saldo Bertambah)
            </label>
            <select
              value={toId}
              onChange={e => setToId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id} disabled={w.id === fromId}>
                  {w.name} (Modal Awal: {formatRupiah(w.initialBalance)})
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Nominal Transfer / Top-Up (Rp)
            </label>
            <input
              type="number"
              required
              min="1000"
              placeholder="Contoh: 200000"
              value={amount}
              onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-extrabold text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {[50000, 100000, 200000, 500000, 1000000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer"
              >
                {formatRupiah(val)}
              </button>
            ))}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Catatan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Top-up saldo DANA untuk jajan"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
              style={{ backgroundColor: theme.primary }}
            >
              {success ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Transfer Berhasil!</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Proses Pindah Kas</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
