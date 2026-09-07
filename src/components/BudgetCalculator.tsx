import React, { useState } from 'react';
import { 
  BudgetPlanAllocation, 
  IncomeItem, 
  WalletItem, 
  AllocationCalculationResult 
} from '../types';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  PieChart, 
  Layers,
  Sparkles,
  Edit3,
  X,
  Wallet,
  ArrowDownRight
} from 'lucide-react';

interface BudgetCalculatorProps {
  allocations: BudgetPlanAllocation[];
  incomes: IncomeItem[];
  wallets: WalletItem[];
  currentMonthId: string;
  results: AllocationCalculationResult[];
  theme: any;
  isIphone?: boolean;
  onAddIncome: (income: Omit<IncomeItem, 'id'>) => void;
  onUpdateIncome?: (income: IncomeItem) => void;
  onDeleteIncome: (id: string) => void;
  onUpdateAllocations: (allocations: BudgetPlanAllocation[]) => void;
}

export const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({
  allocations,
  incomes,
  wallets,
  currentMonthId,
  results,
  theme,
  isIphone = false,
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome,
  onUpdateAllocations
}) => {
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);

  const [source, setSource] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState<'Utama' | 'Sampingan' | 'Bonus' | 'Passive'>('Utama');
  const [walletName, setWalletName] = useState(wallets[0]?.name || 'Saldo Rekening BCA');

  const formatRupiah = (num: number) => {
    return 'Rp ' + Math.round(num || 0).toLocaleString('id-ID');
  };

  const currentIncomes = incomes.filter(i => i.monthId === currentMonthId);
  const totalIncome = currentIncomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const handleStartAdd = (prefillType?: 'Utama' | 'Sampingan' | 'Bonus' | 'Passive') => {
    setIsAddingIncome(true);
    setEditingIncome(null);
    setSource(prefillType === 'Utama' ? 'Gaji Pokok Bulanan' : '');
    setAmount('');
    setType(prefillType || 'Utama');
    setWalletName(wallets[0]?.name || 'Saldo Rekening BCA');
  };

  const handleStartEdit = (item: IncomeItem) => {
    setEditingIncome(item);
    setIsAddingIncome(false);
    setSource(item.source);
    setAmount(item.amount);
    setType(item.type);
    setWalletName(item.walletName);
  };

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !amount || Number(amount) <= 0) return;

    if (editingIncome && onUpdateIncome) {
      onUpdateIncome({
        ...editingIncome,
        source: source.trim(),
        type,
        amount: Number(amount),
        walletName: walletName || wallets[0]?.name || 'Saldo Rekening BCA'
      });
      setEditingIncome(null);
    } else {
      onAddIncome({
        monthId: currentMonthId,
        source: source.trim(),
        type,
        amount: Number(amount),
        date: new Date().toLocaleDateString('id-ID'),
        walletName: walletName || wallets[0]?.name || 'Saldo Rekening BCA'
      });
      setIsAddingIncome(false);
    }

    setSource('');
    setAmount('');
  };

  const handlePercentChange = (id: string, newPercent: number) => {
    const updated = allocations.map(a => a.id === id ? { ...a, targetPercent: Math.max(0, Math.min(100, newPercent)) } : a);
    onUpdateAllocations(updated);
  };

  // Group incomes by wallet for synchronization transparency
  const incomesByWallet = wallets.map(w => {
    const matched = currentIncomes.filter(i => i.walletName === w.name || i.walletName === w.id);
    const sum = matched.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    return { wallet: w, sum, count: matched.length };
  }).filter(item => item.sum > 0);

  return (
    <div className={isIphone ? 'space-y-4' : 'space-y-6'}>
      
      {/* Income Section Card */}
      <div className={`bg-white rounded-3xl shadow-sm border border-slate-200/80 ${
        isIphone ? 'p-4' : 'p-6'
      }`}>
        <div className={`flex items-center justify-between gap-3 mb-4 ${
          isIphone ? 'flex-col sm:flex-row items-stretch sm:items-center' : 'flex-wrap'
        }`}>
          <div>
            <h3 className={`font-bold text-slate-800 flex items-center gap-2 ${
              isIphone ? 'text-sm' : 'text-base'
            }`}>
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Gaji & Pemasukan</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Total: <strong className="text-emerald-600 font-bold">{formatRupiah(totalIncome)}</strong> • Otomatis menambah saldo kas
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-add-salary"
              type="button"
              onClick={() => handleStartAdd('Utama')}
              className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>+ Gaji Pokok</span>
            </button>

            <button
              id="btn-add-income"
              type="button"
              onClick={() => handleStartAdd('Sampingan')}
              className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition hover:opacity-90 cursor-pointer ${
                isIphone ? 'w-full sm:w-auto px-3' : 'px-3.5'
              }`}
              style={{ backgroundColor: theme.primary }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Pemasukan Lain</span>
            </button>
          </div>
        </div>

        {/* Informative Synchronized Info Banner */}
        <div className="mb-4 p-3 bg-sky-50/80 border border-sky-200/90 rounded-2xl flex items-center gap-2 text-xs text-sky-900">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
          <div className="leading-relaxed">
            Pemasukan atau gaji otomatis menambah kas dompet tujuan dan saldo bersih.
          </div>
        </div>

        {/* Per-wallet incoming summary pill */}
        {incomesByWallet.length > 0 && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200/70 rounded-2xl flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5 text-sky-600" />
              <span>Pemasukan Masuk ke:</span>
            </span>
            {incomesByWallet.map(({ wallet, sum }) => (
              <span 
                key={wallet.id}
                className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 shadow-2xs font-semibold text-slate-800 flex items-center gap-1"
              >
                <span>{wallet.name}:</span>
                <strong className="text-emerald-600 font-bold">+{formatRupiah(sum)}</strong>
              </span>
            ))}
          </div>
        )}

        {/* Add / Edit Income Form */}
        {(isAddingIncome || editingIncome) && (
          <form onSubmit={handleIncomeSubmit} className="mb-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700">
                {editingIncome ? `Edit Pemasukan: ${editingIncome.source}` : 'Tambah Sumber Pemasukan Baru'}
              </span>
              <button 
                type="button"
                onClick={() => { setIsAddingIncome(false); setEditingIncome(null); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Sumber / Keterangan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Gaji, Freelance, Bonus"
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Jenis Pemasukan
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                >
                  <option value="Utama">Gaji Pokok / Utama</option>
                  <option value="Sampingan">Freelance / Sampingan</option>
                  <option value="Bonus">Bonus / THR</option>
                  <option value="Passive">Passive Income / Dividen</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  placeholder="5000000"
                  value={amount}
                  onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Masuk ke Kas / Dompet
                </label>
                <select
                  value={walletName}
                  onChange={e => setWalletName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-semibold"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setIsAddingIncome(false); setEditingIncome(null); }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer"
                style={{ backgroundColor: theme.primary }}
              >
                {editingIncome ? 'Simpan Perubahan' : 'Simpan & Tambah Saldo'}
              </button>
            </div>
          </form>
        )}

        {/* List of Income Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {currentIncomes.length === 0 ? (
            <div className="col-span-2 text-center py-6 text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
              Belum ada pemasukan bulan ini. Klik tombol Tambah Pemasukan di atas.
            </div>
          ) : (
            currentIncomes.map(item => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white transition text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">{item.source}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.2 rounded text-[10px]">
                      {item.type}
                    </span>
                    <span>• Masuk ke: <strong>{item.walletName}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-emerald-600 text-xs sm:text-sm">
                    + {formatRupiah(item.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 cursor-pointer"
                    title="Edit Pemasukan & Dompet"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteIncome(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                    title="Hapus Pemasukan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 50/25/20/5 Budget Allocation Formulas Card */}
      <div className={`bg-white rounded-3xl shadow-sm border border-slate-200/80 ${
        isIphone ? 'p-4' : 'p-6'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={`font-bold text-slate-800 flex items-center gap-2 ${
              isIphone ? 'text-sm' : 'text-base'
            }`}>
              <Calculator className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Formula Anggaran 50/25/20/5</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Alokasi otomatis dari total pemasukan bulan ini
            </p>
          </div>
        </div>

        <div className={isIphone ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
          {results.map(({ allocation, maxAllowanceAmount, actualSpentAmount, remainingAmount, usagePercentOfPlan, isExceeded, isNearMax }) => {
            return (
              <div 
                key={allocation.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: allocation.colorHex }}
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {allocation.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={allocation.targetPercent}
                      onChange={e => handlePercentChange(allocation.id, Number(e.target.value))}
                      className="w-12 bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 text-xs text-center font-bold text-slate-700 focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>

                {/* Progress calculation */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Terpakai / Realisasi:</div>
                    <div className={`font-bold ${isExceeded ? 'text-rose-600' : 'text-slate-700'}`}>
                      {formatRupiah(actualSpentAmount)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400">Jatah Maksimal ({allocation.targetPercent}%):</div>
                    <div className="font-bold text-slate-800">
                      {formatRupiah(maxAllowanceAmount)}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, usagePercentOfPlan)}%`,
                        backgroundColor: isExceeded ? '#EF4444' : isNearMax ? '#F59E0B' : allocation.colorHex
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-medium">
                    <span>
                      {isExceeded ? (
                        <span className="text-rose-600 font-bold">⚠️ Overbudget {formatRupiah(actualSpentAmount - maxAllowanceAmount)}</span>
                      ) : (
                        <span>Sisa jatah: <strong className="text-emerald-600">{formatRupiah(remainingAmount)}</strong></span>
                      )}
                    </span>
                    <span>{usagePercentOfPlan}% Kuota Terpakai</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
