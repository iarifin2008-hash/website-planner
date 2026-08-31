import React, { useState } from 'react';
import { UserProfile, WalletItem, BudgetMonth, IncomeItem, SavingItem, FixedExpenseItem, VariableExpenseItem, SubscriptionItem, DailyExpenseItem, BudgetPlanAllocation } from '../types';
import { 
  Smartphone, 
  Copy, 
  Check, 
  Download, 
  Upload, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  Layers, 
  AlertCircle,
  HelpCircle,
  Share2,
  Wallet,
  Coins,
  ArrowRight
} from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  wallets: WalletItem[];
  months: BudgetMonth[];
  incomes: IncomeItem[];
  savings: SavingItem[];
  fixed: FixedExpenseItem[];
  variable: VariableExpenseItem[];
  subscriptions: SubscriptionItem[];
  dailyExpenses: DailyExpenseItem[];
  allocations: BudgetPlanAllocation[];
  theme: any;
  onUpdateSyncCode: (newCode: string) => void;
  onImportFullData: (payload: any) => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  profile,
  wallets,
  months,
  incomes,
  savings,
  fixed,
  variable,
  subscriptions,
  dailyExpenses,
  allocations,
  theme,
  onUpdateSyncCode,
  onImportFullData
}) => {
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [importJsonText, setImportJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'CODE' | 'MODAL_AWAL' | 'JSON_BACKUP'>('CODE');

  if (!isOpen) return null;

  const totalModalAwal = wallets.reduce((acc, w) => acc + (w.initialBalance || 0), 0);
  const totalSisaSaldo = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplySyncCode = (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) {
      setStatusMessage({ type: 'error', text: 'Masukkan kode sinkronisasi yang valid.' });
      return;
    }
    onUpdateSyncCode(code);
    setStatusMessage({ type: 'success', text: `Berhasil sinkronisasi dengan kode ${code}!` });
    setInputCode('');
  };

  const handleExportJson = () => {
    const fullPayload = {
      app: 'MoneyPlannerSync',
      version: '2.0.0',
      syncedAt: new Date().toISOString(),
      syncCode: profile.syncCode,
      profile,
      wallets,
      months,
      incomes,
      savings,
      fixed,
      variable,
      subscriptions,
      dailyExpenses,
      allocations
    };

    const jsonStr = JSON.stringify(fullPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `money_planner_backup_${profile.syncCode}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ type: 'success', text: 'File cadangan JSON berhasil diunduh!' });
  };

  const handleImportJson = () => {
    try {
      if (!importJsonText.trim()) {
        setStatusMessage({ type: 'error', text: 'Tempelkan teks JSON cadangan terlebih dahulu.' });
        return;
      }
      const parsed = JSON.parse(importJsonText);
      onImportFullData(parsed);
      setStatusMessage({ type: 'success', text: 'Data cadangan termasuk Modal Awal Kas berhasil dipulihkan!' });
      setImportJsonText('');
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Format data JSON tidak valid. Pastikan format sesuai ekspor.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: theme.primary }}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Sinkronisasi Multi-Device & Akun
              </h3>
              <p className="text-xs text-slate-500">
                Hubungkan data kas, modal awal, dan riwayat belanja antar perangkat
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

        {/* Tab switch */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl mb-4 text-[11px] sm:text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('CODE')}
            className={`py-2 px-1 rounded-lg transition text-center cursor-pointer ${
              activeTab === 'CODE' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Kode Sinkron
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('MODAL_AWAL')}
            className={`py-2 px-1 rounded-lg transition text-center cursor-pointer ${
              activeTab === 'MODAL_AWAL' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Modal Awal Kas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('JSON_BACKUP')}
            className={`py-2 px-1 rounded-lg transition text-center cursor-pointer ${
              activeTab === 'JSON_BACKUP' ? 'bg-white text-slate-800 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Cadangan File
          </button>
        </div>

        {/* Notification message */}
        {statusMessage && (
          <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tab 1: Sync Code */}
        {activeTab === 'CODE' && (
          <div className="space-y-4">
            {/* Active sync code box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                Kode Sinkronisasi Anda Saat Ini:
              </span>
              <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 p-2.5 rounded-xl">
                <span className="font-mono text-base font-bold text-sky-700 tracking-wider">
                  {profile.syncCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Salin kode ini dan masukkan ke aplikasi Android atau browser lain untuk menghubungkan akun & riwayat kas secara langsung.
              </p>
            </div>

            {/* Form switch sync code */}
            <form onSubmit={handleApplySyncCode} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Ganti / Hubungkan ke Kode Akun Lain:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Contoh: CUAN-9921"
                  value={inputCode}
                  onChange={e => setInputCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-mono uppercase focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1 cursor-pointer"
                  style={{ backgroundColor: theme.primary }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Hubungkan</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Modal Awal Kas (Direct transparency on how initial balance is synchronized) */}
        {activeTab === 'MODAL_AWAL' && (
          <div className="space-y-4">
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Wallet className="w-4 h-4 text-sky-700" />
                <span className="text-xs font-bold text-slate-800">
                  Di mana Modal Awal Kas Disinkronkan?
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Modal awal kas melekat pada masing-masing <strong>Dompet & Rekening</strong> (<code className="text-sky-800 font-bold bg-white px-1 py-0.5 rounded">initialBalance</code>). Ketika disinkronkan, sistem tetap mencatat akumulasi modal awal ini sebagai batas acuan saldo dasar.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <span className="text-[10px] font-semibold text-slate-500 block">Total Modal Awal Terdaftar</span>
                <span className="text-sm font-bold text-slate-800">
                  Rp {totalModalAwal.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-[10px] font-semibold text-emerald-700 block">Sisa Saldo Kas Riil Aktif</span>
                <span className="text-sm font-bold text-emerald-800">
                  Rp {totalSisaSaldo.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Wallets List with Initial Balance */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Rincian Modal Awal per Dompet ({wallets.length}):
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {wallets.map(w => (
                  <div key={w.id} className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: w.colorHex }} />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{w.name}</span>
                        <span className="text-[10px] text-slate-400">Tipe: {w.type}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 block">
                        Rp {(w.initialBalance || 0).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        Sisa: Rp {(w.balance || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Export & Import JSON */}
        {activeTab === 'JSON_BACKUP' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Unduh Cadangan Lengkap (.JSON)
                </span>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: theme.primary }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Menyimpan seluruh modal awal kas, saldo terpotong, rincian dompet, alokasi 50/25/20/5, serta histori transaksi harian.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Pulihkan dari Teks JSON Cadangan:
              </label>
              <textarea
                rows={4}
                placeholder='Tempelkan isi file JSON di sini (contoh: {"app": "MoneyPlannerSync", ...})'
                value={importJsonText}
                onChange={e => setImportJsonText(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-[11px] font-mono text-slate-800 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={handleImportJson}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-white hover:bg-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Impor & Pulihkan Data</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tersinkron: {profile.lastSyncedAt || 'Hari ini'}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 font-semibold hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
