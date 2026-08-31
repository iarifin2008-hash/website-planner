import React, { useState, useEffect } from 'react';
import { WalletItem, IncomeItem } from '../types';
import { matchWallet } from '../utils/financeEngine';
import { 
  Wallet, 
  Building2, 
  Smartphone, 
  Banknote, 
  CreditCard, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Sparkles, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  TrendingUp,
  Coins,
  ArrowUpRight
} from 'lucide-react';

interface InitialCashSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletItem[];
  incomes?: IncomeItem[];
  currentMonthId?: string;
  activeMonthName?: string;
  activeYear?: number;
  theme: any;
  onSaveWallets: (updatedWallets: WalletItem[]) => void;
}

export const InitialCashSetupModal: React.FC<InitialCashSetupModalProps> = ({
  isOpen,
  onClose,
  wallets,
  incomes = [],
  currentMonthId = '',
  activeMonthName = '',
  activeYear,
  theme,
  onSaveWallets
}) => {
  if (!isOpen) return null;

  // Local draft of wallets for editing
  const [draftWallets, setDraftWallets] = useState<WalletItem[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState<'BANK' | 'E_WALLET' | 'CASH' | 'OTHER'>('BANK');
  const [newWalletInitial, setNewWalletInitial] = useState<number | ''>(1000000);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeCustomAddId, setActiveCustomAddId] = useState<string | null>(null);
  const [customAddAmount, setCustomAddAmount] = useState<number | ''>('');

  useEffect(() => {
    // Clone wallets into draft
    setDraftWallets(wallets.map(w => ({ ...w, initialBalance: Number(w.initialBalance) || 0 })));
  }, [wallets, isOpen]);

  const formatRupiah = (num: number) => {
    return 'Rp ' + Math.round(num || 0).toLocaleString('id-ID');
  };

  // Filter incomes for active month
  const monthIncomes = incomes.filter(i => !currentMonthId || i.monthId === currentMonthId);
  const totalMonthIncome = monthIncomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const handleInitialBalanceChange = (id: string, value: number) => {
    setDraftWallets(prev => prev.map(w => {
      if (w.id === id) {
        const cleanVal = Math.max(0, value);
        return {
          ...w,
          initialBalance: cleanVal,
          balance: cleanVal
        };
      }
      return w;
    }));
  };

  const handleQuickAdd = (id: string, amountToAdd: number) => {
    setDraftWallets(prev => prev.map(w => {
      if (w.id === id) {
        const nextVal = Math.max(0, (Number(w.initialBalance) || 0) + amountToAdd);
        return {
          ...w,
          initialBalance: nextVal,
          balance: nextVal
        };
      }
      return w;
    }));
  };

  const handleApplyCustomAdd = (id: string) => {
    const val = Number(customAddAmount) || 0;
    if (val > 0) {
      handleQuickAdd(id, val);
    }
    setCustomAddAmount('');
    setActiveCustomAddId(null);
  };

  const handleSetZero = (id: string) => {
    setDraftWallets(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, initialBalance: 0, balance: 0 };
      }
      return w;
    }));
  };

  const handleAddNewWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;

    let colorHex = '#6599B8';
    if (newWalletType === 'E_WALLET') colorHex = '#118EEA';
    if (newWalletType === 'CASH') colorHex = '#74C69D';
    if (newWalletType === 'OTHER') colorHex = '#A594F9';

    const newWallet: WalletItem = {
      id: 'w_' + Date.now(),
      name: newWalletName.trim(),
      type: newWalletType,
      initialBalance: Number(newWalletInitial) || 0,
      balance: Number(newWalletInitial) || 0,
      colorHex,
      iconName: newWalletType.toLowerCase()
    };

    setDraftWallets(prev => [...prev, newWallet]);
    setNewWalletName('');
    setNewWalletInitial(500000);
    setIsAddingNew(false);
  };

  const handleDeleteWallet = (id: string) => {
    if (draftWallets.length <= 1) {
      alert('Minimal harus memiliki 1 akun kas.');
      return;
    }
    setDraftWallets(prev => prev.filter(w => w.id !== id));
  };

  const handleSaveAll = () => {
    onSaveWallets(draftWallets);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  // Compute live total initial capital
  const totalModalAwalDompet = draftWallets.reduce((acc, w) => acc + (Number(w.initialBalance) || 0), 0);
  const totalAkumulasiUangAwalRiil = totalModalAwalDompet + totalMonthIncome;

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'BANK':
        return <Building2 className="w-4 h-4" />;
      case 'E_WALLET':
        return <Smartphone className="w-4 h-4" />;
      case 'CASH':
        return <Banknote className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md font-bold"
              style={{ backgroundColor: theme.primary }}
            >
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Sesuaikan Modal Awal Kas & Saldo</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                  Sinkronisasi Riil
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Akumulasi uang awal riil = Saldo bawaan rekening/dompet + Pemasukan bulanan {activeMonthName} {activeYear}
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

        {/* Live Total Akumulasi Card */}
        <div className="my-4 p-5 rounded-2xl bg-slate-900 text-white shadow-md space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                Total Akumulasi Uang Awal Kas Riil
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5">
                {formatRupiah(totalAkumulasiUangAwalRiil)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-800 text-emerald-300 border border-slate-700 inline-block">
                {draftWallets.length} Akun Kas Aktif
              </span>
              <span className="block text-[10px] text-slate-400 mt-1">100% Selaras & Akurat</span>
            </div>
          </div>

          {/* Breakdown Pills */}
          <div className="grid grid-cols-2 gap-2 pt-2.5 border-t border-slate-800 text-xs">
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-slate-400 text-[11px] block">1. Modal Saldo Awal Dompet:</span>
              <span className="font-bold text-white text-sm">{formatRupiah(totalModalAwalDompet)}</span>
            </div>
            <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-emerald-400 text-[11px] block">+ 2. Pemasukan Bulan Ini:</span>
              <span className="font-bold text-emerald-300 text-sm">+{formatRupiah(totalMonthIncome)}</span>
            </div>
          </div>
        </div>

        {/* Scrollable List of Wallets */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 my-2">
          {draftWallets.map(wallet => {
            const currentVal = Number(wallet.initialBalance) || 0;
            const matchedIncomes = monthIncomes.filter(i => matchWallet(i.walletName, wallet, draftWallets));
            const walletIncome = matchedIncomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
            const totalWalletInflow = currentVal + walletIncome;
            const isCustomAddOpen = activeCustomAddId === wallet.id;

            return (
              <div 
                key={wallet.id}
                className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-white transition-all space-y-3"
              >
                {/* Header of Item */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs shadow-xs"
                      style={{ backgroundColor: wallet.colorHex || theme.primary }}
                    >
                      {getWalletIcon(wallet.type)}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                        {wallet.name}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize">
                        {wallet.type.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Summary of this wallet inflow */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-semibold block">Total Kas Masuk Dompet:</span>
                    <span className="text-xs font-bold text-slate-800">{formatRupiah(totalWalletInflow)}</span>
                  </div>
                </div>

                {/* Input & Quick Adjustment Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Saldo Modal Awal (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        value={currentVal === 0 ? '' : currentVal}
                        placeholder="0"
                        onChange={e => handleInitialBalanceChange(wallet.id, e.target.value === '' ? 0 : Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-extrabold text-slate-900 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Quick additive buttons & Reset 0 */}
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Tambah Saldo / Hapus
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(wallet.id, 100000)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="Tambah Rp 100.000 ke saldo awal"
                      >
                        +100rb
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(wallet.id, 500000)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="Tambah Rp 500.000 ke saldo awal"
                      >
                        +500rb
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(wallet.id, 1000000)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="Tambah Rp 1.000.000 ke saldo awal"
                      >
                        +1jt
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCustomAddId(isCustomAddOpen ? null : wallet.id)}
                        className="px-2 py-1 bg-sky-50 border border-sky-200 rounded-lg text-[10px] font-bold text-sky-700 hover:bg-sky-100 cursor-pointer"
                        title="Tambah nominal kustom"
                      >
                        +Kustom
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetZero(wallet.id)}
                        className="px-2 py-1 bg-rose-50 border border-rose-200 rounded-lg text-[10px] font-bold text-rose-600 hover:bg-rose-100 cursor-pointer"
                        title="Kosongkan/Hapus saldo awal menjadi 0"
                      >
                        Hapus (0)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom Add Inflow Drawer */}
                {isCustomAddOpen && (
                  <div className="p-2.5 bg-sky-50 rounded-xl border border-sky-200 flex items-center gap-2 animate-fadeIn">
                    <span className="text-[11px] font-semibold text-sky-900 shrink-0">Tambah Saldo Tambahan:</span>
                    <input
                      type="number"
                      min="1"
                      placeholder="Contoh: 250000"
                      value={customAddAmount}
                      onChange={e => setCustomAddAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      className="bg-white border border-sky-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-bold flex-1 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCustomAdd(wallet.id)}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Terapkan
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveCustomAddId(null); setCustomAddAmount(''); }}
                      className="text-slate-400 hover:text-slate-600 text-xs px-1"
                    >
                      Batal
                    </button>
                  </div>
                )}

                {/* Sub-info on synchronized monthly income */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pemasukan Terhubung: <strong className="text-emerald-600 font-bold">+{formatRupiah(walletIncome)}</strong></span>
                  </span>
                  {draftWallets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteWallet(wallet.id)}
                      className="text-slate-400 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                      title="Hapus akun kas"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Hapus Akun</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add New Wallet Inline Form inside Modal */}
          {isAddingNew ? (
            <form onSubmit={handleAddNewWallet} className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900">Tambah Akun Kas Baru</span>
                <button 
                  type="button" 
                  onClick={() => setIsAddingNew(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Nama Akun</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bank Jago, OVO, Dompet Kulit"
                    value={newWalletName}
                    onChange={e => setNewWalletName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Jenis Kas</label>
                  <select
                    value={newWalletType}
                    onChange={e => setNewWalletType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="BANK">Bank Transfer</option>
                    <option value="E_WALLET">E-Wallet</option>
                    <option value="CASH">Uang Tunai / Cash</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Saldo Awal (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    value={newWalletInitial}
                    onChange={e => setNewWalletInitial(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
                  style={{ backgroundColor: theme.primary }}
                >
                  Tambah ke Daftar
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingNew(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rekening / Dompet Kas Baru</span>
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Tutup
          </button>

          <button
            id="btn-save-initial-modal"
            type="button"
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition hover:scale-105 active:scale-95 cursor-pointer"
            style={{ backgroundColor: theme.primary }}
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Tersimpan & Tersinkron!</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Simpan & Terapkan Modal Awal</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
