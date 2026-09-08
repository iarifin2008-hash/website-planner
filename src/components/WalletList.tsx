import React, { useState } from 'react';
import { WalletItem } from '../types';
import { WalletComputedData } from '../utils/financeEngine';
import { 
  Wallet, 
  Building2, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingDown, 
  ArrowUpRight, 
  Check,
  X,
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Receipt,
  Coffee,
  PiggyBank,
  Layers,
  ArrowDownRight,
  ArrowRightLeft,
  ShieldCheck,
  Coins,
  TrendingUp
} from 'lucide-react';

interface WalletListProps {
  wallets: WalletItem[];
  computedWallets: WalletComputedData[];
  theme: any;
  isIphone?: boolean;
  onUpdateWallets: (wallets: WalletItem[]) => void;
  onOpenTransferModal?: () => void;
}

export const WalletList: React.FC<WalletListProps> = ({
  wallets,
  computedWallets,
  theme,
  isIphone = false,
  onUpdateWallets,
  onOpenTransferModal
}) => {
  const [editingWallet, setEditingWallet] = useState<WalletItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [expandedWalletId, setExpandedWalletId] = useState<string | null>(null);

  // Quick Top-up / Saldo Tambahan State per wallet
  const [activeTopUpWalletId, setActiveTopUpWalletId] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number | ''>('');

  // Form states for new/editing wallet
  const [formData, setFormData] = useState({
    name: '',
    type: 'BANK' as 'BANK' | 'E_WALLET' | 'CASH' | 'OTHER',
    initialBalance: 0,
    colorHex: '#6599B8',
    iconName: 'bank'
  });

  const formatRupiah = (num: number) => {
    return 'Rp ' + Math.round(num || 0).toLocaleString('id-ID');
  };

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

  const handleStartEdit = (wallet: WalletItem) => {
    setEditingWallet(wallet);
    setFormData({
      name: wallet.name,
      type: wallet.type,
      initialBalance: wallet.initialBalance ?? wallet.balance,
      colorHex: wallet.colorHex,
      iconName: wallet.iconName
    });
    setIsAddingNew(false);
    setActiveTopUpWalletId(null);
  };

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingWallet(null);
    setActiveTopUpWalletId(null);
    setFormData({
      name: '',
      type: 'E_WALLET',
      initialBalance: 500000,
      colorHex: '#52B788',
      iconName: 'wallet'
    });
  };

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isAddingNew) {
      const initBal = Number(formData.initialBalance) || 0;
      const newWallet: WalletItem = {
        id: 'w_' + Date.now(),
        name: formData.name.trim(),
        type: formData.type,
        initialBalance: initBal,
        balance: initBal,
        colorHex: formData.colorHex,
        iconName: formData.iconName
      };
      onUpdateWallets([...wallets, newWallet]);
      setIsAddingNew(false);
    } else if (editingWallet) {
      const initBal = Number(formData.initialBalance) || 0;
      const updated = wallets.map(w => {
        if (w.id === editingWallet.id) {
          return {
            ...w,
            name: formData.name.trim(),
            type: formData.type,
            initialBalance: initBal,
            colorHex: formData.colorHex
          };
        }
        return w;
      });
      onUpdateWallets(updated);
      setEditingWallet(null);
    }
  };

  const handleDeleteWallet = (id: string) => {
    if (wallets.length <= 1) {
      alert('Minimal harus menyisakan 1 akun dompet kas.');
      return;
    }
    if (confirm('Yakin ingin menghapus akun dompet ini?')) {
      onUpdateWallets(wallets.filter(w => w.id !== id));
      if (editingWallet?.id === id) setEditingWallet(null);
      if (activeTopUpWalletId === id) setActiveTopUpWalletId(null);
    }
  };

  // Quick reset wallet initial balance to 0 (Hapus Saldo)
  const handleResetWalletBalance = (walletId: string, walletName: string) => {
    if (confirm(`Kosongkan/Hapus saldo awal untuk akun ${walletName} menjadi Rp 0?`)) {
      const updated = wallets.map(w => {
        if (w.id === walletId) {
          return { ...w, initialBalance: 0, balance: 0 };
        }
        return w;
      });
      onUpdateWallets(updated);
    }
  };

  // Quick add additional funds to wallet (Tambah Saldo Tambahan)
  const handleApplyTopUp = (walletId: string) => {
    const amountToAdd = Number(topUpAmount) || 0;
    if (amountToAdd <= 0) return;

    const updated = wallets.map(w => {
      if (w.id === walletId) {
        const nextInit = (Number(w.initialBalance) || 0) + amountToAdd;
        return { ...w, initialBalance: nextInit, balance: nextInit };
      }
      return w;
    });

    onUpdateWallets(updated);
    setTopUpAmount('');
    setActiveTopUpWalletId(null);
  };

  // Aggregate totals across all computed wallets
  const totalModalAwal = computedWallets.reduce((acc, w) => acc + (Number(w.initialBalance) || 0), 0);
  const totalInflow = computedWallets.reduce((acc, w) => acc + (Number(w.inflowTotal) || 0), 0);
  const totalRealCapital = totalModalAwal + totalInflow;
  const totalOutflow = computedWallets.reduce((acc, w) => acc + (Number(w.totalOutflow) || 0), 0);
  const totalCurrentBalance = computedWallets.reduce((acc, w) => acc + w.computedBalance, 0);

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-slate-200/80 ${
      isIphone ? 'p-4' : 'p-6'
    }`}>
      
      {/* Title & Action Buttons */}
      <div className={`flex items-center justify-between gap-3 mb-4 ${
        isIphone ? 'flex-col sm:flex-row items-stretch sm:items-center' : 'flex-wrap'
      }`}>
        <div>
          <h3 className={`font-bold text-slate-900 flex items-center gap-2 ${
            isIphone ? 'text-sm' : 'text-base'
          }`}>
            <Wallet className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Kas & Dompet</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Sinkron otomatis dengan semua pemasukan & pengeluaran
          </p>
        </div>

        <div className={`flex items-center gap-1.5 ${
          isIphone ? 'w-full grid grid-cols-2' : 'flex-wrap'
        }`}>
          {onOpenTransferModal && wallets.length >= 2 && (
            <button
              id="btn-open-transfer-modal"
              type="button"
              onClick={onOpenTransferModal}
              className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer ${
                isIphone ? 'px-2 text-center' : 'px-3'
              }`}
              title="Pindah saldo antar kas"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Pindah Saldo</span>
            </button>
          )}

          <button
            id="btn-add-wallet"
            type="button"
            onClick={handleStartAdd}
            className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition hover:opacity-90 cursor-pointer ${
              isIphone ? 'px-2 text-center' : 'px-3.5'
            }`}
            style={{ backgroundColor: theme.primary }}
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Tambah Dompet</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Bar */}
      <div className={`rounded-2xl bg-slate-50 border border-slate-200/90 gap-2.5 text-xs ${
        isIphone ? 'p-3 mb-4 grid grid-cols-2' : 'mb-6 p-4 grid grid-cols-2 sm:grid-cols-4'
      }`}>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
          <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">1. Modal Saldo Awal</span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate block">{formatRupiah(totalModalAwal)}</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
          <span className="text-[9px] uppercase font-bold text-emerald-600 block truncate">+ 2. Pemasukan Masuk</span>
          <span className="text-xs sm:text-sm font-extrabold text-emerald-600 truncate block">+{formatRupiah(totalInflow)}</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
          <span className="text-[9px] uppercase font-bold text-rose-500 block truncate">- 3. Total Keluar</span>
          <span className="text-xs sm:text-sm font-extrabold text-rose-600 truncate block">-{formatRupiah(totalOutflow)}</span>
        </div>
        <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
          <span className="text-[9px] uppercase font-bold text-sky-600 block truncate">= Sisa Saldo Kas</span>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900 truncate block">{formatRupiah(totalCurrentBalance)}</span>
        </div>
      </div>

      {/* Add / Edit Wallet Modal Inline Form */}
      {(isAddingNew || editingWallet) && (
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleSaveWallet(e); }} className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700">
              {isAddingNew ? 'Tambah Akun Kas Baru' : `Edit Akun Kas: ${editingWallet?.name}`}
            </span>
            <button 
              type="button" 
              onClick={() => { setIsAddingNew(false); setEditingWallet(null); }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nama Akun Dompet / Kas
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: BCA, DANA, Uang Cash"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Jenis Dompet
              </label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              >
                <option value="BANK">Bank Transfer (BCA, Mandiri, BRI, dll)</option>
                <option value="E_WALLET">E-Wallet (DANA, GoPay, ShopeePay, OVO)</option>
                <option value="CASH">Uang Tunai / Cash</option>
                <option value="OTHER">Lainnya (Amplop Tabungan / Valas)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Saldo Modal Awal (Rp)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.initialBalance}
                onChange={e => setFormData({ ...formData, initialBalance: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { setIsAddingNew(false); setEditingWallet(null); }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSaveWallet}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
              style={{ backgroundColor: theme.primary }}
            >
              Simpan Akun
            </button>
          </div>
        </form>
      )}

      {/* Grid of Wallets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {computedWallets.map(w => {
          const isExpanded = expandedWalletId === w.id;
          const initialBal = Number(w.initialBalance) || 0;
          const remainingPct = w.remainingPercent;
          const isTopUpOpen = activeTopUpWalletId === w.id;
          const totalInflowForWallet = initialBal + w.inflowTotal;

          return (
            <div
              key={w.id}
              className="p-5 rounded-2xl border transition-all hover:shadow-md bg-slate-50/70 relative flex flex-col justify-between"
              style={{ borderColor: theme.border }}
            >
              <div>
                {/* Header of card */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: w.colorHex || theme.primary }}
                    >
                      {getWalletIcon(w.type)}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{w.name}</span>
                        {w.isDefault && (
                          <span className="text-[9px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                            Utama
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium capitalize">
                        {w.type.toLowerCase().replace('_', '-')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(w)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 cursor-pointer"
                      title="Edit Saldo Awal & Nama"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {wallets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteWallet(w.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Hapus Kas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sisa Saldo Kas Aktif */}
                <div className="mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Sisa Saldo Kas Sekarang
                  </span>
                  <div className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                    w.isNegative ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {formatRupiah(w.computedBalance)}
                  </div>
                </div>

                {/* Saldo Awal vs Terpotong Breakdown */}
                <div className="space-y-1.5 text-[11px] bg-white p-3 rounded-xl border border-slate-200/80 mb-3 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Modal Saldo Awal:</span>
                    <strong className="font-semibold text-slate-800">{formatRupiah(initialBal)}</strong>
                  </div>

                  {w.inflowTotal > 0 && (
                    <div className="flex items-center justify-between text-emerald-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>+ Pemasukan Masuk:</span>
                      </span>
                      <strong className="font-bold">+{formatRupiah(w.inflowTotal)}</strong>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-amber-700">
                    <span>- Jajan & Belanja:</span>
                    <strong className="font-bold">-{formatRupiah(w.dailyExpenseTotal)}</strong>
                  </div>

                  <div className="flex items-center justify-between text-rose-600">
                    <span>- Pos Anggaran & Tabungan:</span>
                    <strong className="font-bold">-{formatRupiah(w.fixedExpenseTotal + w.variableExpenseTotal + w.savingExpenseTotal + w.subExpenseTotal)}</strong>
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-slate-800 font-bold">
                    <span>Total Terpotong:</span>
                    <span className="text-rose-600">-{formatRupiah(w.totalOutflow)}</span>
                  </div>
                </div>

                {/* Quick Action Bar on Card: Tambah Saldo Tambahan & Kosongkan Saldo */}
                <div className="flex items-center gap-1.5 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTopUpWalletId(isTopUpOpen ? null : w.id);
                      setTopUpAmount('');
                    }}
                    className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Tambah saldo tambahan langsung ke kas ini"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Saldo Tambahan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResetWalletBalance(w.id, w.name)}
                    className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold rounded-xl text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                    title="Kosongkan/Reset saldo awal akun ini menjadi Rp 0"
                  >
                    <X className="w-3 h-3" />
                    <span>Hapus Saldo (0)</span>
                  </button>
                </div>

                {/* Inline Quick Top-Up Drawer */}
                {isTopUpOpen && (
                  <div className="mb-3 p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 animate-fadeIn text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 text-[11px]">Tambah Saldo ke {w.name}</span>
                      <button 
                        type="button" 
                        onClick={() => setActiveTopUpWalletId(null)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1000"
                        placeholder="Jumlah (Rp)..."
                        value={topUpAmount}
                        onChange={e => setTopUpAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-bold flex-1 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyTopUp(w.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
                      >
                        Tambah
                      </button>
                    </div>

                    {/* Preset buttons */}
                    <div className="flex flex-wrap gap-1">
                      {[50000, 100000, 500000, 1000000].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTopUpAmount(preset)}
                          className="px-1.5 py-0.5 bg-white border border-emerald-200 rounded text-[9px] font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                        >
                          +{preset >= 1000000 ? `${preset / 1000000}jt` : `${preset / 1000}rb`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                    <span>Daya Tahan Saldo</span>
                    <span className={remainingPct < 20 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                      {remainingPct}% Tersisa
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max(2, Math.min(100, remainingPct))}%`,
                        backgroundColor: remainingPct > 20 ? (w.colorHex || theme.primary) : '#EF4444'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Transactions log toggle */}
              <div className="pt-2 border-t border-slate-200/60 mt-1">
                <button
                  type="button"
                  onClick={() => setExpandedWalletId(isExpanded ? null : w.id)}
                  className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-600 hover:text-slate-900 py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <Receipt className="w-3.5 h-3.5 text-slate-400" />
                    <span>{w.transactionsCount} Mutasi Kas Terhubung</span>
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Expanded transactions list */}
                {isExpanded && (
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1 text-[10px] animate-fadeIn">
                    {w.recentTransactions.length === 0 ? (
                      <p className="text-slate-400 italic py-1 text-center">Belum ada transaksi di kas ini.</p>
                    ) : (
                      w.recentTransactions.map(tx => (
                        <div key={tx.id} className="p-1.5 bg-white rounded-lg border border-slate-100 flex items-center justify-between">
                          <div className="truncate pr-2">
                            <span className="font-semibold text-slate-700 block truncate">{tx.title}</span>
                            <span className="text-[9px] text-slate-400">{tx.date}</span>
                          </div>
                          <span className={`font-mono font-bold shrink-0 ${
                            tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {tx.amount > 0 ? '+' : ''}{formatRupiah(tx.amount)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
