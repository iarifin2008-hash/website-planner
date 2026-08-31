import React, { useState } from 'react';
import { FinancialOverview, UserProfile } from '../types';
import { WalletComputedData, getGreeting } from '../utils/financeEngine';
import { 
  Wallet, 
  TrendingDown, 
  TrendingUp,
  PiggyBank, 
  Layers, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  Receipt,
  Coffee,
  Building2,
  Tv,
  Plus,
  Minus
} from 'lucide-react';

interface BalanceHeroCardProps {
  overview: FinancialOverview;
  profile: UserProfile;
  computedWallets: WalletComputedData[];
  activeMonthName: string;
  activeYear: number;
  theme: any;
  onOpenWalletModal: () => void;
  onOpenSyncModal: () => void;
  onOpenInitialCashModal?: () => void;
  onQuickIncome?: () => void;
  onQuickExpense?: () => void;
}

export const BalanceHeroCard: React.FC<BalanceHeroCardProps> = ({
  overview,
  profile,
  computedWallets,
  activeMonthName,
  activeYear,
  theme,
  onOpenWalletModal,
  onOpenSyncModal,
  onOpenInitialCashModal,
  onQuickIncome,
  onQuickExpense
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const formatRupiah = (num: number) => {
    return 'Rp ' + Math.round(num || 0).toLocaleString('id-ID');
  };

  const { greeting, icon } = getGreeting(profile.name);

  // Remaining ratio of initial capital + income
  const totalInflowPool = overview.totalInitialBalance + overview.totalIncome;
  const remainingRatio = totalInflowPool > 0
    ? Math.max(0, Math.min(100, Math.round((overview.totalCurrentBalance / totalInflowPool) * 100)))
    : 0;

  const usedRatio = 100 - remainingRatio;

  // Personalized advice message
  let personalizedAdvice = `Halo ${profile.name || 'Sobat Cuan'}, keuangan kasmu dalam kondisi sangat sehat!`;
  if (remainingRatio < 25) {
    personalizedAdvice = `Perhatian ${profile.name || 'Sobat Cuan'}, sisa saldo kas aktifmu tersisa ${remainingRatio}%. Batasi jajan harian ya!`;
  } else if (overview.savingsRatePercent >= 20) {
    personalizedAdvice = `Luar biasa ${profile.name || 'Sobat Cuan'}! Rasio tabunganmu sudah mencapai ${overview.savingsRatePercent}% dari pemasukan.`;
  } else if (overview.totalDailyExpense > overview.totalFixedActual && overview.totalFixedActual > 0) {
    personalizedAdvice = `${profile.name || 'Sobat Cuan'}, pengeluaran belanja & jajan harianmu saat ini cukup dominan.`;
  }

  return (
    <div 
      className="relative rounded-3xl shadow-sm border overflow-hidden transition-all duration-300 p-4 sm:p-6 md:p-8"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.border,
        color: theme.primaryDark
      }}
    >
      {/* Decorative subtle ambient circles */}
      <div 
        className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ backgroundColor: theme.primary }}
      />
      <div 
        className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ backgroundColor: theme.accent || theme.primary }}
      />

      {/* Top Bar: Personalized Greeting & Month / Sync Badge */}
      <div className="flex items-center justify-between gap-3 relative z-10 mb-4 sm:mb-6 flex-wrap">
        
        {/* Left: Personalized Greeting */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-white shadow-md font-bold shrink-0 text-base sm:text-lg"
            style={{ backgroundColor: theme.primary }}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold tracking-tight text-slate-900 text-sm sm:text-lg truncate">
                {greeting}
              </h2>
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 whitespace-nowrap"
                style={{
                  backgroundColor: theme.primaryLight,
                  borderColor: theme.border,
                  color: theme.primaryDark
                }}
              >
                {activeMonthName} {activeYear}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate font-medium">
              {personalizedAdvice}
            </p>
          </div>
        </div>

        {/* Right: Sync Account Badge */}
        <button
          id="hero-btn-sync-code"
          type="button"
          onClick={onOpenSyncModal}
          className="flex items-center gap-1.5 rounded-2xl border shadow-2xs transition hover:scale-105 active:scale-95 bg-white shrink-0 cursor-pointer text-xs px-3 py-1.5 min-h-[36px]"
          style={{
            borderColor: theme.border,
            color: theme.primaryDark
          }}
          title="Klik untuk mengelola sinkronisasi multi-device"
        >
          <Smartphone className="w-3.5 h-3.5" style={{ color: theme.primary }} />
          <span className="font-semibold">{profile.syncCode}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </button>
      </div>

      {/* 1. HEADER UTAMA: TOTAL SALDO BERUKURAN BESAR */}
      <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs mb-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-sky-600" />
            <span>Total Saldo Bersih Aktif</span>
          </span>
          <span 
            className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
            style={{ 
              backgroundColor: remainingRatio > 25 ? '#D1FAE5' : '#FEE2E2',
              color: remainingRatio > 25 ? '#065F46' : '#991B1B'
            }}
          >
            {remainingRatio}% Sisa Kas
          </span>
        </div>

        <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono py-1">
          {formatRupiah(overview.totalCurrentBalance)}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
          <span>Dari total modal kas & pemasukan: <strong>{formatRupiah(overview.totalRealCapital)}</strong></span>
          <button
            type="button"
            onClick={onOpenInitialCashModal || onOpenWalletModal}
            className="text-sky-600 hover:text-sky-800 font-semibold underline cursor-pointer"
          >
            Atur Modal Awal
          </button>
        </div>

        {/* Progress Bar of Cash Balance */}
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex mt-2.5">
          <div 
            className="h-full transition-all duration-500 rounded-full"
            style={{ 
              width: `${Math.min(100, Math.max(2, remainingRatio))}%`,
              backgroundColor: remainingRatio > 25 ? theme.primary : '#EF4444'
            }}
          />
        </div>
      </div>

      {/* 2. DUA KOLOM INFO KECIL: TOTAL PEMASUKAN & TOTAL PENGELUARAN */}
      <div className="relative z-10 grid grid-cols-2 gap-3 mb-4">
        
        {/* Kolom Info 1: Total Pemasukan */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1">
            <div className="w-5 h-5 rounded-lg bg-emerald-200/70 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <span className="truncate">Total Pemasukan</span>
          </div>
          <div className="text-base sm:text-xl font-extrabold text-emerald-700 font-mono tracking-tight">
            +{formatRupiah(overview.totalIncome)}
          </div>
          <div className="text-[10px] text-emerald-700/80 mt-1 truncate">
            Bulan {activeMonthName}
          </div>
        </div>

        {/* Kolom Info 2: Total Pengeluaran */}
        <div className="bg-rose-50/90 border border-rose-200/90 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between gap-1 text-rose-800 text-[11px] font-bold uppercase tracking-wider mb-1">
            <div className="flex items-center gap-1.5 truncate">
              <div className="w-5 h-5 rounded-lg bg-rose-200/70 flex items-center justify-center shrink-0">
                <TrendingDown className="w-3.5 h-3.5 text-rose-700" />
              </div>
              <span className="truncate">Total Pengeluaran</span>
            </div>
            <button
              type="button"
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="text-rose-700 hover:text-rose-900 text-[10px] font-bold shrink-0 underline cursor-pointer"
            >
              {showBreakdown ? 'Tutup' : 'Rincian'}
            </button>
          </div>
          <div className="text-base sm:text-xl font-extrabold text-rose-600 font-mono tracking-tight">
            -{formatRupiah(overview.totalOutflow)}
          </div>
          <div className="text-[10px] text-rose-700/80 mt-1 truncate">
            Jajan + Pos + Tabungan
          </div>
        </div>

      </div>

      {/* 3. TOMBOL AKSI CEPAT: + PEMASUKAN (HIJAU) & - PENGELUARAN (MERAH) */}
      <div className="relative z-10 flex flex-col sm:flex-row items-stretch gap-2.5 w-full">
        
        {/* Tombol Hijau: + Pemasukan */}
        <button
          id="btn-quick-income"
          type="button"
          onClick={onQuickIncome}
          className="min-h-[44px] min-w-[44px] w-full sm:flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-white" />
          </div>
          <span>+ Tambah Pemasukan</span>
        </button>

        {/* Tombol Merah: - Pengeluaran */}
        <button
          id="btn-quick-expense"
          type="button"
          onClick={onQuickExpense}
          className="min-h-[44px] min-w-[44px] w-full sm:flex-1 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Minus className="w-3.5 h-3.5 text-white" />
          </div>
          <span>- Catat Pengeluaran / Jajan</span>
        </button>

      </div>

      {/* Synchronized Deductions Breakdown Drawer */}
      {showBreakdown && (
        <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs animate-fadeIn relative z-10 text-xs">
          <div className="font-bold text-slate-800 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-sky-600" />
              <span>Rincian Pemotongan Saldo Kas ({activeMonthName} {activeYear})</span>
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">100% Selaras</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
              <span className="text-[11px] text-amber-800 font-bold block flex items-center gap-1">
                <Coffee className="w-3.5 h-3.5 text-amber-600" />
                <span>Belanja & Jajan</span>
              </span>
              <div className="text-sm font-extrabold text-amber-900 mt-1">
                {formatRupiah(overview.totalDailyExpense)}
              </div>
            </div>

            <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-xl">
              <span className="text-[11px] text-sky-800 font-bold block flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>Pos Pokok (Fixed)</span>
              </span>
              <div className="text-sm font-extrabold text-sky-900 mt-1">
                {formatRupiah(overview.totalFixedActual)}
              </div>
            </div>

            <div className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-xl">
              <span className="text-[11px] text-orange-800 font-bold block flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-orange-600" />
                <span>Pos Variabel</span>
              </span>
              <div className="text-sm font-extrabold text-orange-900 mt-1">
                {formatRupiah(overview.totalVariableActual)}
              </div>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
              <span className="text-[11px] text-emerald-800 font-bold block flex items-center gap-1">
                <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tabungan Disisihkan</span>
              </span>
              <div className="text-sm font-extrabold text-emerald-900 mt-1">
                {formatRupiah(overview.totalSavingActual)}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

