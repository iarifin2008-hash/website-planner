import React, { useState } from 'react';
import { 
  FixedExpenseItem, 
  VariableExpenseItem, 
  SavingItem, 
  SubscriptionItem, 
  WalletItem 
} from '../types';
import { 
  Home, 
  ShoppingBag, 
  PiggyBank, 
  Tv, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Wallet,
  AlertCircle
} from 'lucide-react';

interface ExpenseSectionsProps {
  fixed: FixedExpenseItem[];
  variable: VariableExpenseItem[];
  savings: SavingItem[];
  subscriptions: SubscriptionItem[];
  wallets: WalletItem[];
  currentMonthId: string;
  theme: any;
  isIphone?: boolean;
  onAddFixed: (item: Omit<FixedExpenseItem, 'id'>) => void;
  onDeleteFixed: (id: string) => void;
  onAddVariable: (item: Omit<VariableExpenseItem, 'id'>) => void;
  onDeleteVariable: (id: string) => void;
  onAddSaving: (item: Omit<SavingItem, 'id'>) => void;
  onDeleteSaving: (id: string) => void;
  onAddSub: (item: Omit<SubscriptionItem, 'id'>) => void;
  onDeleteSub: (id: string) => void;
}

export const ExpenseSections: React.FC<ExpenseSectionsProps> = ({
  fixed,
  variable,
  savings,
  subscriptions,
  wallets,
  currentMonthId,
  theme,
  isIphone = false,
  onAddFixed,
  onDeleteFixed,
  onAddVariable,
  onDeleteVariable,
  onAddSaving,
  onDeleteSaving,
  onAddSub,
  onDeleteSub
}) => {
  const [activeTab, setActiveTab] = useState<'FIXED' | 'VARIABLE' | 'SAVINGS' | 'SUBSCRIPTION'>('FIXED');
  
  // Generic form state
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [plannedAmount, setPlannedAmount] = useState<number | ''>('');
  const [actualAmount, setActualAmount] = useState<number | ''>('');
  const [walletName, setWalletName] = useState(wallets[0]?.name || 'Saldo Rekening BCA');
  const [isAdding, setIsAdding] = useState(false);

  const formatRupiah = (num: number) => {
    return 'Rp ' + Math.round(num || 0).toLocaleString('id-ID');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !plannedAmount || Number(plannedAmount) <= 0) return;

    const planned = Number(plannedAmount);
    const actual = actualAmount !== '' ? Number(actualAmount) : planned;
    const dateStr = new Date().toLocaleDateString('id-ID');

    if (activeTab === 'FIXED') {
      onAddFixed({
        monthId: currentMonthId,
        title: title.trim(),
        priority,
        plannedAmount: planned,
        actualAmount: actual,
        date: dateStr,
        walletName: walletName || wallets[0]?.name || 'Saldo Rekening BCA'
      });
    } else if (activeTab === 'VARIABLE') {
      onAddVariable({
        monthId: currentMonthId,
        title: title.trim(),
        priority,
        plannedAmount: planned,
        actualAmount: actual,
        date: dateStr,
        walletName: walletName || wallets[0]?.name || 'Saldo DANA'
      });
    } else if (activeTab === 'SAVINGS') {
      onAddSaving({
        monthId: currentMonthId,
        title: title.trim(),
        priority,
        plannedAmount: planned,
        actualAmount: actual,
        date: dateStr,
        walletName: walletName || wallets[0]?.name || 'Saldo Rekening BCA'
      });
    } else if (activeTab === 'SUBSCRIPTION') {
      onAddSub({
        monthId: currentMonthId,
        title: title.trim(),
        priority,
        plannedAmount: planned,
        actualAmount: actual,
        date: dateStr,
        walletName: walletName || wallets[0]?.name || 'Saldo Rekening BCA'
      });
    }

    setTitle('');
    setPlannedAmount('');
    setActualAmount('');
    setIsAdding(false);
  };

  // Filter current month
  const currentFixed = fixed.filter(f => f.monthId === currentMonthId);
  const currentVar = variable.filter(v => v.monthId === currentMonthId);
  const currentSav = savings.filter(s => s.monthId === currentMonthId);
  const currentSub = subscriptions.filter(s => s.monthId === currentMonthId);

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'High':
        return <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded">Prioritas Tinggi</span>;
      case 'Medium':
        return <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded">Prioritas Sedang</span>;
      default:
        return <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">Opsional</span>;
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-slate-200/80 ${
      isIphone ? 'p-4' : 'p-6'
    }`}>
      
      {/* Category Tabs */}
      <div className={`flex items-center justify-between gap-3 ${
        isIphone ? 'flex-col sm:flex-row items-stretch sm:items-center mb-4' : 'flex-wrap mb-6'
      }`}>
        <div className={`flex items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto text-xs font-semibold scrollbar-none ${
          isIphone ? 'w-full grid grid-cols-4 text-center' : ''
        }`}>
          <button
            type="button"
            onClick={() => { setActiveTab('FIXED'); setIsAdding(false); }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1 transition whitespace-nowrap ${
              isIphone ? 'px-1 text-[11px]' : 'px-3.5'
            } ${
              activeTab === 'FIXED' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span className="truncate">Pokok ({currentFixed.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('VARIABLE'); setIsAdding(false); }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1 transition whitespace-nowrap ${
              isIphone ? 'px-1 text-[11px]' : 'px-3.5'
            } ${
              activeTab === 'VARIABLE' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate">Variabel ({currentVar.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('SAVINGS'); setIsAdding(false); }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1 transition whitespace-nowrap ${
              isIphone ? 'px-1 text-[11px]' : 'px-3.5'
            } ${
              activeTab === 'SAVINGS' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <PiggyBank className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Tabungan ({currentSav.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('SUBSCRIPTION'); setIsAdding(false); }}
            className={`py-2 rounded-xl flex items-center justify-center gap-1 transition whitespace-nowrap ${
              isIphone ? 'px-1 text-[11px]' : 'px-3.5'
            } ${
              activeTab === 'SUBSCRIPTION' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="truncate">Langganan ({currentSub.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className={`inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition hover:opacity-90 cursor-pointer ${
            isIphone ? 'w-full sm:w-auto px-3' : 'px-3.5'
          }`}
          style={{ backgroundColor: theme.primary }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Pos</span>
        </button>
      </div>

      {/* Add Item Form */}
      {isAdding && (
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleFormSubmit(e); }} className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-fadeIn">
          <div className="text-xs font-bold text-slate-700 mb-3">
            Tambah Pos: {activeTab === 'FIXED' ? 'Kebutuhan Pokok' : activeTab === 'VARIABLE' ? 'Kebutuhan Variabel' : activeTab === 'SAVINGS' ? 'Tabungan / Investasi' : 'Langganan / Tagihan'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nama Pos / Keperluan
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Sewa Kos, Wifi, Dana Darurat"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tingkat Prioritas
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              >
                <option value="High">Tinggi (Wajib Utama)</option>
                <option value="Medium">Sedang (Penting)</option>
                <option value="Low">Rendah (Fleksibel / Opsional)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Potong dari Kas / Dompet
              </label>
              <select
                value={walletName}
                onChange={e => setWalletName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.name}>{w.name} (Sisa: {formatRupiah(w.balance)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Rencana Anggaran (Rp)
              </label>
              <input
                type="number"
                required
                placeholder="1000000"
                value={plannedAmount}
                onChange={e => setPlannedAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Realisasi Terbayar (Rp)
              </label>
              <input
                type="number"
                placeholder="Sama dengan rencana jika sudah dibayar"
                value={actualAmount}
                onChange={e => setActualAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: theme.primary }}
            >
              Simpan & Potong Kas
            </button>
          </div>
        </form>
      )}

      {/* List Items based on Active Tab */}
      <div className="space-y-2.5">
        {activeTab === 'FIXED' && currentFixed.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{item.title}</span>
                {getPriorityBadge(item.priority)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Kas: <span className="text-sky-600 font-medium">{item.walletName}</span> • Rencana: {formatRupiah(item.plannedAmount)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-bold text-rose-600">- {formatRupiah(item.actualAmount)}</div>
                <div className="text-[10px] text-slate-400">Realisasi Kas</div>
              </div>
              <button type="button" onClick={() => onDeleteFixed(item.id)} className="p-1 text-slate-400 hover:text-rose-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'VARIABLE' && currentVar.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{item.title}</span>
                {getPriorityBadge(item.priority)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Kas: <span className="text-sky-600 font-medium">{item.walletName}</span> • Rencana: {formatRupiah(item.plannedAmount)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-bold text-rose-600">- {formatRupiah(item.actualAmount)}</div>
                <div className="text-[10px] text-slate-400">Realisasi Kas</div>
              </div>
              <button type="button" onClick={() => onDeleteVariable(item.id)} className="p-1 text-slate-400 hover:text-rose-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'SAVINGS' && currentSav.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{item.title}</span>
                {getPriorityBadge(item.priority)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Kas: <span className="text-sky-600 font-medium">{item.walletName}</span> • Target: {item.targetTotal ? formatRupiah(item.targetTotal) : '-'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-bold text-emerald-600">+ {formatRupiah(item.actualAmount)}</div>
                <div className="text-[10px] text-slate-400">Disisihkan ke Tabungan</div>
              </div>
              <button type="button" onClick={() => onDeleteSaving(item.id)} className="p-1 text-slate-400 hover:text-rose-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {activeTab === 'SUBSCRIPTION' && currentSub.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{item.title}</span>
                {getPriorityBadge(item.priority)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Kas: <span className="text-sky-600 font-medium">{item.walletName}</span> • Rencana: {formatRupiah(item.plannedAmount)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-bold text-rose-600">- {formatRupiah(item.actualAmount)}</div>
                <div className="text-[10px] text-slate-400">Tagihan Terbayar</div>
              </div>
              <button type="button" onClick={() => onDeleteSub(item.id)} className="p-1 text-slate-400 hover:text-rose-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
