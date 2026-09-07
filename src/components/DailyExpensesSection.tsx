import React, { useState } from 'react';
import { DailyExpenseItem, WalletItem } from '../types';
import { 
  Coffee, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  Wallet,
  Sparkles,
  TrendingDown,
  Info,
  CheckCircle2
} from 'lucide-react';

interface DailyExpensesSectionProps {
  expenses: DailyExpenseItem[];
  wallets: WalletItem[];
  currentMonthId: string;
  theme: any;
  onAddExpense: (expense: Omit<DailyExpenseItem, 'id'>, e?: React.SyntheticEvent | React.FormEvent) => void;
  onDeleteExpense: (id: string) => void;
}

export const DailyExpensesSection: React.FC<DailyExpensesSectionProps> = ({
  expenses,
  wallets,
  currentMonthId,
  theme,
  onAddExpense,
  onDeleteExpense
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Jajan');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [walletName, setWalletName] = useState(wallets[0]?.name || 'Uang Cash');
  const [date, setDate] = useState(new Date().toLocaleDateString('id-ID'));
  const [notes, setNotes] = useState('');

  const formatRupiah = (num: number) => {
    return 'Rp ' + Math.round(num || 0).toLocaleString('id-ID');
  };

  const currentExpenses = expenses.filter(e => e.monthId === currentMonthId);
  const totalDaily = currentExpenses.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!title.trim() || !unitPrice || Number(unitPrice) <= 0) return;

    const total = (Number(quantity) || 1) * Number(unitPrice);
    onAddExpense({
      monthId: currentMonthId,
      date: date || new Date().toLocaleDateString('id-ID'),
      title: title.trim(),
      category,
      quantity: Number(quantity) || 1,
      unitPrice: Number(unitPrice),
      totalAmount: total,
      notes: notes.trim(),
      walletName: walletName || wallets[0]?.name || 'Uang Cash'
    }, e);

    // Reset form
    setTitle('');
    setUnitPrice('');
    setQuantity(1);
    setNotes('');
    setIsAdding(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'jajan':
        return <Coffee className="w-3.5 h-3.5 text-amber-500" />;
      case 'makan':
        return <Utensils className="w-3.5 h-3.5 text-orange-500" />;
      case 'transport':
        return <Car className="w-3.5 h-3.5 text-blue-500" />;
      default:
        return <ShoppingBag className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span>Belanja & Jajan Harian</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700">
              {currentExpenses.length} Transaksi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Otomatis memotong saldo dompet yang dipilih
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">Total Harian</span>
            <span className="text-sm font-extrabold text-rose-600">{formatRupiah(totalDaily)}</span>
          </div>

          <button
            id="btn-add-daily-expense"
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: theme.primary }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Catat Jajan</span>
          </button>
        </div>
      </div>

      {/* Inline Form Add Daily Expense */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-fadeIn">
          <div className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
            <span>Input Transaksi Belanja / Jajan Baru</span>
            <span className="text-[11px] text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              Saldo dompet otomatis terpotong
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Nama Barang / Makanan
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Kopi Kenangan, Nasi Padang"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Kategori Pengeluaran
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              >
                <option value="Jajan">Jajan & Minuman</option>
                <option value="Makan">Makanan Pokok / Resto</option>
                <option value="Transport">Transportasi & Bensin</option>
                <option value="Belanja">Belanja Harian / Minimarket</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Potong dari Kas / Dompet
              </label>
              <select
                value={walletName}
                onChange={e => setWalletName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.name}>
                    {w.name} ({formatRupiah(w.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Jumlah / Porsi (Qty)
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Harga Satuan (Rp)
              </label>
              <input
                type="number"
                min="1"
                required
                placeholder="25000"
                value={unitPrice}
                onChange={e => setUnitPrice(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Tanggal Transaksi
              </label>
              <input
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Misal: Less sugar, traktiran teman, promo cashback"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-700">
              Total Potong: <strong className="text-rose-600 font-extrabold text-sm">{formatRupiah((Number(quantity) || 1) * (Number(unitPrice) || 0))}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
                style={{ backgroundColor: theme.primary }}
              >
                Simpan & Potong Kas
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Expenses List with smooth overflow-y-auto scrolling */}
      <div className="overflow-y-auto max-h-[520px] scrollbar-thin">
        {currentExpenses.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
            <Coffee className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">Belum ada catatan belanja & jajan bulan ini.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Klik tombol "+ Tambah Jajan" di atas atau gunakan asisten suara Hai Plenner.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Mobile Phone View (md:hidden): Compact item name & nominal amount with 44px touch targets */}
            <div className="space-y-2 md:hidden">
              {currentExpenses.map(item => (
                <div 
                  key={item.id} 
                  className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 min-w-[40px] min-h-[40px]"
                      style={{ backgroundColor: `${theme.primary}15`, color: theme.primary }}
                    >
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 text-sm block truncate">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono block">
                        {item.walletName || 'Kas'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-extrabold text-rose-600 text-sm font-mono block">
                        -{formatRupiah(item.totalAmount)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(item.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition active:scale-95 cursor-pointer"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Tablet & Desktop View (hidden md:block): Full detailed multi-column table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Item Belanja / Jajan</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-3">Kas Terpotong</th>
                    <th className="py-2.5 px-3 text-right">Qty & Harga</th>
                    <th className="py-2.5 px-3 text-right">Total Potong</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentExpenses.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800 block">{item.title}</span>
                        {item.notes && (
                          <span className="text-[10px] text-slate-400 italic block">{item.notes}</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {getCategoryIcon(item.category)}
                          <span>{item.category}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                          <Wallet className="w-3 h-3 text-sky-600" />
                          <span>{item.walletName || 'Uang Cash'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {item.quantity}x @ {formatRupiah(item.unitPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-rose-600 font-mono text-xs whitespace-nowrap">
                        - {formatRupiah(item.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(item.id)}
                          className="min-w-[36px] min-h-[36px] inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Hapus Transaksi & Kembalikan Saldo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
