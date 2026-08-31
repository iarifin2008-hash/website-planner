import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  Calendar,
  PieChart as PieChartIcon,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Mic,
  FileText,
  Settings,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  ShoppingBag,
  Home,
  Coffee,
  CreditCard,
  Building,
  Smartphone,
  Tag,
  Share2,
  Download,
  Upload,
  RefreshCw,
  X,
  ChevronDown,
  Info
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import confetti from 'canvas-confetti';

import {
  WalletItem,
  UserProfile,
  BudgetMonth,
  IncomeItem,
  SavingItem,
  FixedExpenseItem,
  VariableExpenseItem,
  SubscriptionItem,
  DailyExpenseItem,
  BudgetPlanAllocation,
  CategoryRank,
  FinancialOverview
} from './types';
import {
  DEFAULT_PROFILE,
  DEFAULT_MONTHS,
  DEFAULT_WALLETS,
  DEFAULT_INCOMES,
  DEFAULT_ALLOCATIONS,
  DEFAULT_FIXED,
  DEFAULT_VARIABLE,
  DEFAULT_SAVINGS,
  DEFAULT_SUBSCRIPTIONS,
  DEFAULT_DAILY_EXPENSES,
  THEME_PRESETS
} from './defaultData';

// Utility for Rupiah formatting
export const formatRupiah = (number: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
};

export default function App() {
  // Local state persisted in localStorage
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mp_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [months, setMonths] = useState<BudgetMonth[]>(() => {
    const saved = localStorage.getItem('mp_months');
    return saved ? JSON.parse(saved) : DEFAULT_MONTHS;
  });

  const [currentMonthId, setCurrentMonthId] = useState<string>('2026-01');

  const [wallets, setWallets] = useState<WalletItem[]>(() => {
    const saved = localStorage.getItem('mp_wallets');
    return saved ? JSON.parse(saved) : DEFAULT_WALLETS;
  });

  const [incomes, setIncomes] = useState<IncomeItem[]>(() => {
    const saved = localStorage.getItem('mp_incomes');
    return saved ? JSON.parse(saved) : DEFAULT_INCOMES;
  });

  const [allocations, setAllocations] = useState<BudgetPlanAllocation[]>(() => {
    const saved = localStorage.getItem('mp_allocations');
    return saved ? JSON.parse(saved) : DEFAULT_ALLOCATIONS;
  });

  const [fixedExpenses, setFixedExpenses] = useState<FixedExpenseItem[]>(() => {
    const saved = localStorage.getItem('mp_fixed');
    return saved ? JSON.parse(saved) : DEFAULT_FIXED;
  });

  const [variableExpenses, setVariableExpenses] = useState<VariableExpenseItem[]>(() => {
    const saved = localStorage.getItem('mp_variable');
    return saved ? JSON.parse(saved) : DEFAULT_VARIABLE;
  });

  const [savings, setSavings] = useState<SavingItem[]>(() => {
    const saved = localStorage.getItem('mp_savings');
    return saved ? JSON.parse(saved) : DEFAULT_SAVINGS;
  });

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(() => {
    const saved = localStorage.getItem('mp_subscriptions');
    return saved ? JSON.parse(saved) : DEFAULT_SUBSCRIPTIONS;
  });

  const [dailyExpenses, setDailyExpenses] = useState<DailyExpenseItem[]>(() => {
    const saved = localStorage.getItem('mp_daily');
    return saved ? JSON.parse(saved) : DEFAULT_DAILY_EXPENSES;
  });

  // UI Navigation / Modals State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'daily' | 'planning' | 'recap'>('dashboard');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!profile.isPinEnabled);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Modals
  const [showWalletModal, setShowWalletModal] = useState<boolean>(false);
  const [editingWallet, setEditingWallet] = useState<WalletItem | null>(null);

  const [showManualBalanceModal, setShowManualBalanceModal] = useState<boolean>(false);
  const [manualBalanceInput, setManualBalanceInput] = useState<string>(profile.manualBalance.toString());

  const [showIncomeModal, setShowIncomeModal] = useState<boolean>(false);
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);

  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [expenseModalType, setExpenseModalType] = useState<'FIXED' | 'VARIABLE' | 'SAVINGS' | 'SUBSCRIPTION'>('FIXED');
  const [editingExpenseItem, setEditingExpenseItem] = useState<any>(null);

  const [showDailyModal, setShowDailyModal] = useState<boolean>(false);
  const [editingDaily, setEditingDaily] = useState<DailyExpenseItem | null>(null);

  const [showNewMonthModal, setShowNewMonthModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showAllocationEditModal, setShowAllocationEditModal] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('mp_profile', JSON.stringify(profile));
    localStorage.setItem('mp_months', JSON.stringify(months));
    localStorage.setItem('mp_wallets', JSON.stringify(wallets));
    localStorage.setItem('mp_incomes', JSON.stringify(incomes));
    localStorage.setItem('mp_allocations', JSON.stringify(allocations));
    localStorage.setItem('mp_fixed', JSON.stringify(fixedExpenses));
    localStorage.setItem('mp_variable', JSON.stringify(variableExpenses));
    localStorage.setItem('mp_savings', JSON.stringify(savings));
    localStorage.setItem('mp_subscriptions', JSON.stringify(subscriptions));
    localStorage.setItem('mp_daily', JSON.stringify(dailyExpenses));
  }, [profile, months, wallets, incomes, allocations, fixedExpenses, variableExpenses, savings, subscriptions, dailyExpenses]);

  // Current active theme colors
  const activeTheme = THEME_PRESETS[profile.themePreset] || THEME_PRESETS.SHARK_BLUE;

  // Filtered data for current month
  const currentMonthIncomes = useMemo(() => incomes.filter(i => i.monthId === currentMonthId), [incomes, currentMonthId]);
  const currentMonthFixed = useMemo(() => fixedExpenses.filter(i => i.monthId === currentMonthId), [fixedExpenses, currentMonthId]);
  const currentMonthVariable = useMemo(() => variableExpenses.filter(i => i.monthId === currentMonthId), [variableExpenses, currentMonthId]);
  const currentMonthSavings = useMemo(() => savings.filter(i => i.monthId === currentMonthId), [savings, currentMonthId]);
  const currentMonthSubscriptions = useMemo(() => subscriptions.filter(i => i.monthId === currentMonthId), [subscriptions, currentMonthId]);
  const currentMonthDaily = useMemo(() => dailyExpenses.filter(i => i.monthId === currentMonthId), [dailyExpenses, currentMonthId]);
  const currentMonthAllocations = useMemo(() => {
    const list = allocations.filter(i => i.monthId === currentMonthId);
    if (list.length > 0) return list;
    return DEFAULT_ALLOCATIONS.map(a => ({ ...a, monthId: currentMonthId }));
  }, [allocations, currentMonthId]);

  const currentMonthObj = useMemo(() => {
    return months.find(m => m.monthId === currentMonthId) || {
      monthId: currentMonthId,
      monthName: 'Januari',
      year: 2026,
      notes: '',
      isClosed: false
    };
  }, [months, currentMonthId]);

  // Financial Calculations
  const overview: FinancialOverview = useMemo(() => {
    const totalWalletBalance = wallets.reduce((acc, w) => acc + w.balance, 0);
    const totalInc = currentMonthIncomes.reduce((acc, i) => acc + i.amount, 0);
    // Effective total income is wallet balance or registered incomes
    const totalIncome = totalWalletBalance > 0 ? totalWalletBalance : totalInc;

    const totalSavingPlanned = currentMonthSavings.reduce((acc, s) => acc + s.plannedAmount, 0);
    const totalSavingActual = currentMonthSavings.reduce((acc, s) => acc + s.actualAmount, 0);

    const totalFixedPlanned = currentMonthFixed.reduce((acc, f) => acc + f.plannedAmount, 0);
    const totalFixedActual = currentMonthFixed.reduce((acc, f) => acc + f.actualAmount, 0);

    const totalVariablePlanned = currentMonthVariable.reduce((acc, v) => acc + v.plannedAmount, 0);
    const totalVariableActual = currentMonthVariable.reduce((acc, v) => acc + v.actualAmount, 0);

    const totalSubPlanned = currentMonthSubscriptions.reduce((acc, s) => acc + s.plannedAmount, 0);
    const totalSubActual = currentMonthSubscriptions.reduce((acc, s) => acc + s.actualAmount, 0);

    const totalDailyExpense = currentMonthDaily.reduce((acc, d) => acc + d.totalAmount, 0);

    const totalActualExpense = totalFixedActual + totalVariableActual + totalSubActual + totalDailyExpense;
    const remainingBalance = totalWalletBalance > 0 ? totalWalletBalance : Math.max(0, totalIncome - (totalActualExpense + totalSavingActual));
    const remainingBudgetPercent = totalIncome > 0 ? Math.min(100, Math.max(0, (remainingBalance / totalIncome) * 100)) : 100;
    const savingsRatePercent = totalIncome > 0 ? (totalSavingActual / totalIncome) * 100 : 0;

    const effectiveBalance = profile.useManualBalance ? profile.manualBalance : remainingBalance;

    return {
      totalIncome,
      totalSavingPlanned,
      totalSavingActual,
      totalFixedPlanned,
      totalFixedActual,
      totalVariablePlanned,
      totalVariableActual,
      totalSubPlanned,
      totalSubActual,
      totalDailyExpense,
      totalActualExpense,
      remainingBalance,
      remainingBudgetPercent,
      savingsRatePercent,
      useManualBalance: profile.useManualBalance,
      effectiveBalance
    };
  }, [wallets, currentMonthIncomes, currentMonthSavings, currentMonthFixed, currentMonthVariable, currentMonthSubscriptions, currentMonthDaily, profile.useManualBalance, profile.manualBalance]);

  // Jatah Persen Calculations (50-25-20-5 Planner)
  const allocationCalculations = useMemo(() => {
    const fixedSpent = overview.totalFixedActual;
    const varSpent = overview.totalVariableActual + overview.totalDailyExpense;
    const savSpent = overview.totalSavingActual;
    const subSpent = overview.totalSubActual;

    return currentMonthAllocations.map(alloc => {
      let actualSpent = 0;
      if (alloc.categoryKey === 'FIXED') actualSpent = fixedSpent;
      else if (alloc.categoryKey === 'VARIABLE') actualSpent = varSpent;
      else if (alloc.categoryKey === 'SAVINGS') actualSpent = savSpent;
      else if (alloc.categoryKey === 'SUBSCRIPTION') actualSpent = subSpent;

      const maxAllowance = overview.totalIncome * (alloc.targetPercent / 100);
      const remaining = maxAllowance - actualSpent;
      const usagePercent = maxAllowance > 0 ? (actualSpent / maxAllowance) * 100 : 0;
      const isNearMax = usagePercent >= 80 && usagePercent < 100;
      const isExceeded = actualSpent > maxAllowance && maxAllowance > 0;
      const excessAmount = isExceeded ? actualSpent - maxAllowance : 0;

      return {
        allocation: alloc,
        totalIncome: overview.totalIncome,
        maxAllowanceAmount: maxAllowance,
        actualSpentAmount: actualSpent,
        remainingAmount: remaining,
        usagePercentOfPlan: usagePercent,
        isNearMax,
        isExceeded,
        excessAmount
      };
    });
  }, [currentMonthAllocations, overview]);

  // Category Rankings
  const categoryRankings: CategoryRank[] = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};

    currentMonthFixed.forEach(item => {
      map[item.title] = {
        total: (map[item.title]?.total || 0) + item.actualAmount,
        count: (map[item.title]?.count || 0) + 1
      };
    });
    currentMonthVariable.forEach(item => {
      map[item.title] = {
        total: (map[item.title]?.total || 0) + item.actualAmount,
        count: (map[item.title]?.count || 0) + 1
      };
    });
    currentMonthSubscriptions.forEach(item => {
      map[item.title] = {
        total: (map[item.title]?.total || 0) + item.actualAmount,
        count: (map[item.title]?.count || 0) + 1
      };
    });
    currentMonthDaily.forEach(item => {
      const key = item.category ? `Jajan: ${item.category}` : item.title;
      map[key] = {
        total: (map[key]?.total || 0) + item.totalAmount,
        count: (map[key]?.count || 0) + 1
      };
    });

    const totalAll = Object.values(map).reduce((acc, cur) => acc + cur.total, 0);

    return Object.entries(map)
      .map(([name, data]) => ({
        categoryName: name,
        totalAmount: data.total,
        percentageOfExpense: totalAll > 0 ? (data.total / totalAll) * 100 : 0,
        transactionCount: data.count
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }, [currentMonthFixed, currentMonthVariable, currentMonthSubscriptions, currentMonthDaily]);

  // Chart Data: Wallet Balance Distribution
  const walletChartData = useMemo(() => {
    return wallets.map(w => ({
      name: w.name,
      value: w.balance,
      color: w.colorHex
    }));
  }, [wallets]);

  // Chart Data: Expense Realization vs Savings
  const expensePieData = useMemo(() => {
    return [
      { name: 'Kebutuhan Pokok', value: overview.totalFixedActual, color: '#E2847A' },
      { name: 'Kebutuhan Variabel', value: overview.totalVariableActual, color: '#F4A261' },
      { name: 'Jajan & Harian', value: overview.totalDailyExpense, color: '#E76F51' },
      { name: 'Langganan & Cicilan', value: overview.totalSubActual, color: '#A594F9' },
      { name: 'Tabungan & Investasi', value: overview.totalSavingActual, color: '#74C69D' }
    ].filter(item => item.value > 0);
  }, [overview]);

  // Chart Data: Plan vs Actual Bar Chart
  const planVsActualData = useMemo(() => {
    return [
      {
        name: 'Pokok',
        Rencana: overview.totalFixedPlanned,
        Aktual: overview.totalFixedActual
      },
      {
        name: 'Variabel',
        Rencana: overview.totalVariablePlanned,
        Aktual: overview.totalVariableActual + overview.totalDailyExpense
      },
      {
        name: 'Tabungan',
        Rencana: overview.totalSavingPlanned,
        Aktual: overview.totalSavingActual
      },
      {
        name: 'Langganan',
        Rencana: overview.totalSubPlanned,
        Aktual: overview.totalSubActual
      }
    ];
  }, [overview]);

  // Wallet deduction helper
  const deductWallet = (walletName: string, amount: number) => {
    setWallets(prev =>
      prev.map(w => {
        if (w.name.toLowerCase() === walletName.toLowerCase()) {
          return { ...w, balance: Math.max(0, w.balance - amount) };
        }
        return w;
      })
    );
  };

  const addWalletBalance = (walletName: string, amount: number) => {
    setWallets(prev =>
      prev.map(w => {
        if (w.name.toLowerCase() === walletName.toLowerCase()) {
          return { ...w, balance: w.balance + amount };
        }
        return w;
      })
    );
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // PIN Unlock Check
  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === profile.pin) {
      setIsUnlocked(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('PIN salah! Coba default PIN: 1234');
    }
  };

  // If PIN lock is active and locked
  if (profile.isPinEnabled && !isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F9FC] p-4">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-lg border border-[#BCE0FD] text-center">
          <div className="w-16 h-16 bg-[#D6EAF8] text-[#2B536E] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-[#1E293B] mb-1">Money Planner</h2>
          <p className="text-sm text-[#64748B] mb-6">Masukkan PIN keamanan untuk membuka akses keuangan Anda</p>

          <form onSubmit={handleUnlockPin} className="space-y-4">
            <div>
              <input
                id="pin-input"
                type="password"
                maxLength={6}
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                placeholder="Masukkan PIN"
                className="w-full text-center tracking-widest text-2xl py-3 px-4 rounded-xl border border-[#BCE0FD] focus:outline-none focus:ring-2 focus:ring-[#6599B8] bg-[#F8FAFC]"
                autoFocus
              />
            </div>
            {pinError && <p className="text-xs text-red-500 font-medium">{pinError}</p>}
            <button
              id="btn-unlock-pin"
              type="submit"
              className="w-full py-3 bg-[#6599B8] hover:bg-[#2B536E] text-white font-bold rounded-xl transition shadow-md"
            >
              Buka Kunci
            </button>
            <p className="text-xs text-[#94A3B8] pt-2">Default PIN: 1234</p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pb-16 transition-colors duration-300"
      style={{
        backgroundColor: activeTheme.background,
        fontSize: `${profile.fontSizeScale * 100}%`
      }}
    >
      {/* 1. TOP HEADER & NAVIGATION */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md border-b transition-colors shadow-xs"
        style={{
          backgroundColor: `${activeTheme.surface}EE`,
          borderColor: activeTheme.border
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xs"
              style={{ backgroundColor: activeTheme.primary }}
            >
              🦈
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-extrabold text-lg tracking-tight" style={{ color: activeTheme.primaryDark }}>
                  Money Planner
                </h1>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: activeTheme.primaryLight, color: activeTheme.primaryDark }}
                >
                  Pastel Edition
                </span>
              </div>
              <p className="text-xs text-[#64748B]">Halo, <span className="font-semibold">{profile.name}</span> • {profile.syncCode}</p>
            </div>
          </div>

          {/* Month Selector & Action Controls */}
          <div className="flex items-center gap-2">
            {/* Month Dropdown */}
            <div className="relative">
              <select
                id="month-selector"
                value={currentMonthId}
                onChange={e => {
                  if (e.target.value === 'NEW') {
                    setShowNewMonthModal(true);
                  } else {
                    setCurrentMonthId(e.target.value);
                  }
                }}
                className="appearance-none bg-white border font-bold text-xs py-2 pl-3 pr-8 rounded-xl shadow-xs cursor-pointer focus:outline-none focus:ring-2"
                style={{ borderColor: activeTheme.border, color: activeTheme.primaryDark }}
              >
                {months.map(m => (
                  <option key={m.monthId} value={m.monthId}>
                    📅 {m.monthName} {m.year}
                  </option>
                ))}
                <option value="NEW">➕ Tambah Bulan Baru...</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {/* AI Voice Assistant Trigger Button */}
            <button
              id="btn-open-voice"
              onClick={() => setShowVoiceModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:opacity-90 transition cursor-pointer"
              style={{ backgroundColor: activeTheme.primary }}
              title="Hai Plenner - Asisten Suara/Catat Cepat"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Hai Plenner</span>
            </button>

            {/* Mutasi Bank Import Parser */}
            <button
              id="btn-open-import"
              onClick={() => setShowImportModal(true)}
              className="p-2 bg-white border rounded-xl hover:bg-slate-50 transition cursor-pointer"
              style={{ borderColor: activeTheme.border, color: activeTheme.primaryDark }}
              title="Import Mutasi Bank / Rekening"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Settings & Theme Picker */}
            <button
              id="btn-open-settings"
              onClick={() => setShowSettingsModal(true)}
              className="p-2 bg-white border rounded-xl hover:bg-slate-50 transition cursor-pointer"
              style={{ borderColor: activeTheme.border, color: activeTheme.primaryDark }}
              title="Pengaturan & Tema Pastel"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-2 border-t pt-1 overflow-x-auto no-scrollbar" style={{ borderColor: `${activeTheme.border}60` }}>
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'border-current text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            style={{ color: activeTab === 'dashboard' ? activeTheme.primaryDark : undefined, borderColor: activeTab === 'dashboard' ? activeTheme.primary : 'transparent' }}
          >
            📊 Dashboard & Pos Anggaran
          </button>
          <button
            id="tab-daily"
            onClick={() => setActiveTab('daily')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'daily'
                ? 'border-current text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            style={{ color: activeTab === 'daily' ? activeTheme.primaryDark : undefined, borderColor: activeTab === 'daily' ? activeTheme.primary : 'transparent' }}
          >
            🛍️ Catatan Jajan & Harian ({currentMonthDaily.length})
          </button>
          <button
            id="tab-planning"
            onClick={() => setActiveTab('planning')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'planning'
                ? 'border-current text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            style={{ color: activeTab === 'planning' ? activeTheme.primaryDark : undefined, borderColor: activeTab === 'planning' ? activeTheme.primary : 'transparent' }}
          >
            🎯 Formula Jatah % (50/25/20/5)
          </button>
          <button
            id="tab-recap"
            onClick={() => setActiveTab('recap')}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'recap'
                ? 'border-current text-slate-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            style={{ color: activeTab === 'recap' ? activeTheme.primaryDark : undefined, borderColor: activeTab === 'recap' ? activeTheme.primary : 'transparent' }}
          >
            📑 Rekap & Kesehatan Finansial
          </button>
        </div>
      </header>

      {/* 2. MAIN APP CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD & POS ANGGARAN                                           */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* HERO OVERVIEW SALDO & FINANCIAL METRICS */}
            <div
              className="rounded-3xl p-6 shadow-sm border transition-all relative overflow-hidden"
              style={{
                backgroundColor: activeTheme.surface,
                borderColor: activeTheme.border
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                      {overview.useManualBalance ? 'Saldo Manual (Override)' : 'Total Saldo Kas & Sisa Anggaran'}
                    </span>
                    <button
                      id="btn-edit-manual-balance"
                      onClick={() => {
                        setManualBalanceInput(overview.effectiveBalance.toString());
                        setShowManualBalanceModal(true);
                      }}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border hover:bg-slate-50 text-slate-600 transition flex items-center gap-1 cursor-pointer"
                      style={{ borderColor: activeTheme.border }}
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      {overview.useManualBalance ? 'Edit Manual' : 'Ubah ke Saldo Manual'}
                    </button>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black font-heading tracking-tight" style={{ color: activeTheme.primaryDark }}>
                    {formatRupiah(overview.effectiveBalance)}
                  </h2>
                  <p className="text-xs text-[#64748B] mt-1">
                    Bulan Aktif: <span className="font-bold text-slate-700">{currentMonthObj.monthName} {currentMonthObj.year}</span> • Sinkron Multi-Kas
                  </p>
                </div>

                {/* Metric Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 border border-emerald-100 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold mb-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> Pemasukan
                    </div>
                    <p className="text-base font-bold text-slate-800">{formatRupiah(overview.totalIncome)}</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 border border-rose-100 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold mb-1">
                      <ArrowDownRight className="w-3.5 h-3.5" /> Pengeluaran
                    </div>
                    <p className="text-base font-bold text-slate-800">{formatRupiah(overview.totalActualExpense)}</p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 border border-teal-100 shadow-2xs col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-1.5 text-xs text-teal-700 font-semibold mb-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Tabungan ({overview.savingsRatePercent.toFixed(0)}%)
                    </div>
                    <p className="text-base font-bold text-slate-800">{formatRupiah(overview.totalSavingActual)}</p>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="mt-6 pt-4 border-t flex flex-wrap items-center gap-2" style={{ borderColor: `${activeTheme.border}80` }}>
                <button
                  id="btn-quick-add-daily"
                  onClick={() => {
                    setEditingDaily(null);
                    setShowDailyModal(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: activeTheme.primary }}
                >
                  <Plus className="w-3.5 h-3.5" /> Catat Jajan / Harian
                </button>

                <button
                  id="btn-quick-add-income"
                  onClick={() => {
                    setEditingIncome(null);
                    setShowIncomeModal(true);
                  }}
                  className="px-3.5 py-2 text-xs font-bold bg-white border text-slate-700 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                  style={{ borderColor: activeTheme.border }}
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Tambah Pemasukan
                </button>

                <button
                  id="btn-quick-voice"
                  onClick={() => setShowVoiceModal(true)}
                  className="px-3.5 py-2 text-xs font-bold bg-white border text-slate-700 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                  style={{ borderColor: activeTheme.border }}
                >
                  <Mic className="w-3.5 h-3.5 text-purple-500" /> Input Suara Cepat
                </button>

                <button
                  id="btn-quick-import"
                  onClick={() => setShowImportModal(true)}
                  className="px-3.5 py-2 text-xs font-bold bg-white border text-slate-700 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                  style={{ borderColor: activeTheme.border }}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" /> Paste Mutasi Bank
                </button>
              </div>
            </div>

            {/* MULTI-SUMBER KAS & DOMPET SALDO */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" style={{ color: activeTheme.primary }} />
                  <h3 className="font-heading font-bold text-base text-slate-800">
                    Sumber Dana & Dompet Kas ({wallets.length})
                  </h3>
                </div>
                <button
                  id="btn-add-wallet"
                  onClick={() => {
                    setEditingWallet(null);
                    setShowWalletModal(true);
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Tambah Dompet
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {wallets.map(wallet => (
                  <div
                    key={wallet.id}
                    className="p-4 rounded-2xl border transition-all hover:shadow-sm relative group bg-gradient-to-b from-white to-slate-50/50"
                    style={{ borderColor: `${wallet.colorHex}50` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-2xs"
                        style={{ backgroundColor: wallet.colorHex }}
                      >
                        {wallet.type === 'BANK' ? <Building className="w-4 h-4" /> : wallet.type === 'E_WALLET' ? <Smartphone className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                      </div>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => {
                            setEditingWallet(wallet);
                            setShowWalletModal(true);
                          }}
                          className="p-1 hover:bg-slate-200/60 rounded-md text-slate-500 cursor-pointer"
                          title="Edit Dompet"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs font-medium text-slate-500 truncate">{wallet.name}</p>
                    <p className="text-base font-extrabold text-slate-800 tracking-tight mt-0.5">
                      {formatRupiah(wallet.balance)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* FORMULA JATAH PERSEN SUMMARY CARDS (50-25-20-5) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-500" />
                    Batas Alokasi Formula Anggaran (Jatah %)
                  </h3>
                  <p className="text-xs text-slate-500">Membantu menjaga disiplin pengeluaran agar tidak overbudget</p>
                </div>
                <button
                  id="btn-edit-allocations"
                  onClick={() => setShowAllocationEditModal(true)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  style={{ borderColor: activeTheme.border }}
                >
                  Sesuaikan %
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {allocationCalculations.map((calc, idx) => (
                  <div
                    key={calc.allocation.id || idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      calc.isExceeded
                        ? 'bg-rose-50/70 border-rose-200'
                        : calc.isNearMax
                        ? 'bg-amber-50/70 border-amber-200'
                        : 'bg-slate-50/60 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-700 truncate">{calc.allocation.title}</span>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                        {calc.allocation.targetPercent}%
                      </span>
                    </div>

                    <div className="my-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>Terpakai: <b>{formatRupiah(calc.actualSpentAmount)}</b></span>
                        <span>Maks: <b>{formatRupiah(calc.maxAllowanceAmount)}</b></span>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            calc.isExceeded
                              ? 'bg-rose-500'
                              : calc.isNearMax
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, calc.usagePercentOfPlan)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500">
                        {calc.isExceeded ? 'Overbudget:' : 'Sisa Jatah:'}
                      </span>
                      <span
                        className={`font-bold ${
                          calc.isExceeded ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        {calc.isExceeded ? `+${formatRupiah(calc.excessAmount)}` : formatRupiah(calc.remainingAmount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VISUAL CHARTS & CATEGORY RANKINGS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart 1: Expense Distribution Pie Chart */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs lg:col-span-2">
                <h3 className="font-heading font-bold text-base text-slate-800 mb-1 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-teal-500" />
                  Komposisi Pengeluaran & Tabungan Aktual
                </h3>
                <p className="text-xs text-slate-500 mb-4">Distribusi pengeluaran riil bulan ini</p>

                {expensePieData.length === 0 ? (
                  <div className="h-60 flex flex-col items-center justify-center text-slate-400 text-xs">
                    <PieChartIcon className="w-10 h-10 mb-2 opacity-40" />
                    Belum ada pengeluaran aktual yang dicatat bulan ini
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensePieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {expensePieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(val: any) => formatRupiah(Number(val))} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Top 5 Expense Rankings */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
                <h3 className="font-heading font-bold text-base text-slate-800 mb-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-rose-500" />
                  Top Pengeluaran Terbesar
                </h3>
                <p className="text-xs text-slate-500 mb-4">Item & pos dengan biaya tertinggi</p>

                {categoryRankings.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">Belum ada transaksi pengeluaran</p>
                ) : (
                  <div className="space-y-3">
                    {categoryRankings.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-slate-800 truncate">{item.categoryName}</p>
                            <p className="text-[10px] text-slate-400">{item.transactionCount} transaksi ({item.percentageOfExpense.toFixed(1)}%)</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-slate-800 shrink-0">
                          {formatRupiah(item.totalAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* POS ANGGARAN SECTIONS (Fixed, Variable, Savings, Subscriptions) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* 1. Pengeluaran Tetap (Fixed Cost) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-800">Pengeluaran Tetap</h4>
                      <p className="text-[11px] text-slate-500">Kos, Listrik, Wifi, Air</p>
                    </div>
                  </div>
                  <button
                    id="btn-add-fixed"
                    onClick={() => {
                      setExpenseModalType('FIXED');
                      setEditingExpenseItem(null);
                      setShowExpenseModal(true);
                    }}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>

                <div className="space-y-2">
                  {currentMonthFixed.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Belum ada pos pengeluaran tetap</p>
                  ) : (
                    currentMonthFixed.map(item => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{item.title}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.walletName} • Rencana: {formatRupiah(item.plannedAmount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{formatRupiah(item.actualAmount)}</span>
                          <button
                            onClick={() => {
                              setExpenseModalType('FIXED');
                              setEditingExpenseItem(item);
                              setShowExpenseModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setFixedExpenses(prev => prev.filter(f => f.id !== item.id))}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 2. Pengeluaran Variabel (Variable Cost) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-800">Pengeluaran Variabel</h4>
                      <p className="text-[11px] text-slate-500">Makan, Bensin, Belanja</p>
                    </div>
                  </div>
                  <button
                    id="btn-add-variable"
                    onClick={() => {
                      setExpenseModalType('VARIABLE');
                      setEditingExpenseItem(null);
                      setShowExpenseModal(true);
                    }}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>

                <div className="space-y-2">
                  {currentMonthVariable.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Belum ada pos pengeluaran variabel</p>
                  ) : (
                    currentMonthVariable.map(item => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{item.title}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.walletName} • Rencana: {formatRupiah(item.plannedAmount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{formatRupiah(item.actualAmount)}</span>
                          <button
                            onClick={() => {
                              setExpenseModalType('VARIABLE');
                              setEditingExpenseItem(item);
                              setShowExpenseModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setVariableExpenses(prev => prev.filter(v => v.id !== item.id))}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 3. Tabungan & Investasi */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-800">Tabungan & Investasi</h4>
                      <p className="text-[11px] text-slate-500">Dana Darurat, Reksadana, Saham</p>
                    </div>
                  </div>
                  <button
                    id="btn-add-savings"
                    onClick={() => {
                      setExpenseModalType('SAVINGS');
                      setEditingExpenseItem(null);
                      setShowExpenseModal(true);
                    }}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>

                <div className="space-y-2">
                  {currentMonthSavings.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Belum ada pos tabungan</p>
                  ) : (
                    currentMonthSavings.map(item => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{item.title}</p>
                          <p className="text-[10px] text-slate-400">
                            {item.walletName} • Target: {item.targetTotal ? formatRupiah(item.targetTotal) : '-'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-teal-700">{formatRupiah(item.actualAmount)}</span>
                          <button
                            onClick={() => {
                              setExpenseModalType('SAVINGS');
                              setEditingExpenseItem(item);
                              setShowExpenseModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setSavings(prev => prev.filter(s => s.id !== item.id))}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 4. Langganan & Cicilan */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-slate-800">Langganan & Cicilan</h4>
                      <p className="text-[11px] text-slate-500">Spotify, Netflix, Software</p>
                    </div>
                  </div>
                  <button
                    id="btn-add-subscription"
                    onClick={() => {
                      setExpenseModalType('SUBSCRIPTION');
                      setEditingExpenseItem(null);
                      setShowExpenseModal(true);
                    }}
                    className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>

                <div className="space-y-2">
                  {currentMonthSubscriptions.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Belum ada langganan aktif</p>
                  ) : (
                    currentMonthSubscriptions.map(item => (
                      <div key={item.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{item.title}</p>
                          <p className="text-[10px] text-slate-400">{item.walletName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-700">{formatRupiah(item.actualAmount)}</span>
                          <button
                            onClick={() => {
                              setExpenseModalType('SUBSCRIPTION');
                              setEditingExpenseItem(item);
                              setShowExpenseModal(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setSubscriptions(prev => prev.filter(s => s.id !== item.id))}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CATATAN JAJAN & HARIAN                                             */}
        {/* ========================================================================= */}
        {activeTab === 'daily' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Coffee className="w-5 h-5 text-amber-500" />
                  Daftar Transaksi Harian & Jajan ({currentMonthDaily.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Total Pengeluaran Harian Bulan Ini:{' '}
                  <span className="font-bold text-rose-600">{formatRupiah(overview.totalDailyExpense)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-add-daily-entry"
                  onClick={() => {
                    setEditingDaily(null);
                    setShowDailyModal(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
                  style={{ backgroundColor: activeTheme.primary }}
                >
                  <Plus className="w-3.5 h-3.5" /> Catat Transaksi Baru
                </button>
              </div>
            </div>

            {/* Daily Expense List */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              {currentMonthDaily.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Coffee className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-semibold">Belum ada catatan jajan atau pengeluaran harian</p>
                  <p className="text-xs">Klik tombol "Catat Transaksi Baru" untuk menambahkan</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {currentMonthDaily.map(item => (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.category === 'Jajan' ? '☕' : item.category === 'Makan' ? '🍛' : item.category === 'Transport' ? '🛵' : '🛒'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-sm text-slate-800">{item.title}</h5>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {item.date} • {item.walletName} {item.quantity > 1 ? `• ${item.quantity}x @ ${formatRupiah(item.unitPrice)}` : ''} {item.notes ? `• "${item.notes}"` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm text-rose-600">
                          -{formatRupiah(item.totalAmount)}
                        </span>
                        <button
                          onClick={() => {
                            setEditingDaily(item);
                            setShowDailyModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            // Re-add balance to wallet if user wants to delete
                            addWalletBalance(item.walletName, item.totalAmount);
                            setDailyExpenses(prev => prev.filter(d => d.id !== item.id));
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FORMULA JATAH PERSEN (50/25/20/5)                                  */}
        {/* ========================================================================= */}
        {activeTab === 'planning' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600" />
                    Manajemen Formula Alokasi Jatah Persen
                  </h3>
                  <p className="text-xs text-slate-500">
                    Berdasarkan Total Pendapatan / Kas Bulan Ini:{' '}
                    <span className="font-bold text-slate-800">{formatRupiah(overview.totalIncome)}</span>
                  </p>
                </div>
                <button
                  id="btn-edit-formula-percent"
                  onClick={() => setShowAllocationEditModal(true)}
                  className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs hover:opacity-90 transition cursor-pointer"
                  style={{ backgroundColor: activeTheme.primary }}
                >
                  Ubah Target Persentase
                </button>
              </div>

              {/* Allocation Deep Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allocationCalculations.map((calc, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border bg-slate-50/50 border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: calc.allocation.colorHex }}
                        />
                        <h4 className="font-bold text-sm text-slate-800">{calc.allocation.title}</h4>
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-white border border-slate-200">
                        {calc.allocation.targetPercent}% Jatah
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Batas Maksimal Anggaran:</span>
                        <span className="font-bold">{formatRupiah(calc.maxAllowanceAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Total Realisasi Terpakai:</span>
                        <span className="font-bold text-rose-600">{formatRupiah(calc.actualSpentAmount)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-200">
                        <span>{calc.isExceeded ? 'Kelebihan (Over):' : 'Sisa Kuota Anggaran:'}</span>
                        <span className={calc.isExceeded ? 'text-rose-600' : 'text-emerald-700'}>
                          {calc.isExceeded ? `+${formatRupiah(calc.excessAmount)}` : formatRupiah(calc.remainingAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          calc.isExceeded ? 'bg-rose-500' : calc.isNearMax ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, calc.usagePercentOfPlan)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Tingkat Pemakaian: <b>{calc.usagePercentOfPlan.toFixed(1)}%</b> {calc.isExceeded ? '⚠️ Overbudget!' : calc.isNearMax ? '⚠️ Mendekati batas jatah!' : '✅ Dalam batas aman'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan vs Actual Bar Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h4 className="font-heading font-bold text-base text-slate-800 mb-1">
                Perbandingan Rencana Anggaran vs Realisasi Aktual
              </h4>
              <p className="text-xs text-slate-500 mb-4">Grafik batang komparasi per kategori anggaran</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={planVsActualData}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val: any) => `${Number(val) / 1000}k`} />
                    <Tooltip formatter={(val: any) => formatRupiah(Number(val))} />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Rencana" fill="#6599B8" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Aktual" fill="#F4A261" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: REKAP BULANAN & KESEHATAN FINANSIAL                                 */}
        {/* ========================================================================= */}
        {activeTab === 'recap' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Laporan Rekap Bulanan: {currentMonthObj.monthName} {currentMonthObj.year}
                  </h3>
                  <p className="text-xs text-slate-500">Ringkasan menyeluruh performa finansial</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      triggerConfetti();
                      const reportData = {
                        month: `${currentMonthObj.monthName} ${currentMonthObj.year}`,
                        overview,
                        fixed: currentMonthFixed,
                        variable: currentMonthVariable,
                        savings: currentMonthSavings,
                        subscriptions: currentMonthSubscriptions,
                        daily: currentMonthDaily
                      };
                      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Laporan_Keuangan_${currentMonthObj.monthId}.json`;
                      a.click();
                    }}
                    className="px-3.5 py-2 text-xs font-bold bg-white border text-slate-700 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5 cursor-pointer"
                    style={{ borderColor: activeTheme.border }}
                  >
                    <Download className="w-3.5 h-3.5" /> Download JSON Backup
                  </button>
                </div>
              </div>

              {/* Financial Health Scorecard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <span className="text-xs font-semibold text-emerald-700">Tingkat Tabungan (Savings Rate)</span>
                  <p className="text-2xl font-black text-emerald-900 mt-1">{overview.savingsRatePercent.toFixed(1)}%</p>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    {overview.savingsRatePercent >= 20 ? '🎉 Sangat Bagus (Target >= 20% terpenuhi)' : '⚠️ Coba tingkatkan tabungan hingga 20%'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <span className="text-xs font-semibold text-blue-700">Rasio Pengeluaran Tetap</span>
                  <p className="text-2xl font-black text-blue-900 mt-1">
                    {overview.totalIncome > 0 ? ((overview.totalFixedActual / overview.totalIncome) * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-[11px] text-blue-700 mt-1">Batas ideal maksimal 50% dari pemasukan</p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200">
                  <span className="text-xs font-semibold text-purple-700">Sisa Anggaran Bersih</span>
                  <p className="text-2xl font-black text-purple-900 mt-1">{formatRupiah(overview.remainingBalance)}</p>
                  <p className="text-[11px] text-purple-700 mt-1">Dana bebas cadangan akhir bulan</p>
                </div>
              </div>

              {/* Financial Summary Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Pos Finansial</th>
                      <th className="p-3 text-right">Rencana / Jatah</th>
                      <th className="p-3 text-right">Realisasi Aktual</th>
                      <th className="p-3 text-right">Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-3 font-semibold">Total Pemasukan</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right font-bold text-emerald-700">{formatRupiah(overview.totalIncome)}</td>
                      <td className="p-3 text-right">-</td>
                    </tr>
                    <tr>
                      <td className="p-3">Pengeluaran Tetap</td>
                      <td className="p-3 text-right">{formatRupiah(overview.totalFixedPlanned)}</td>
                      <td className="p-3 text-right font-bold">{formatRupiah(overview.totalFixedActual)}</td>
                      <td className="p-3 text-right text-emerald-600">
                        {formatRupiah(overview.totalFixedPlanned - overview.totalFixedActual)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">Pengeluaran Variabel & Operasional</td>
                      <td className="p-3 text-right">{formatRupiah(overview.totalVariablePlanned)}</td>
                      <td className="p-3 text-right font-bold">{formatRupiah(overview.totalVariableActual)}</td>
                      <td className="p-3 text-right text-emerald-600">
                        {formatRupiah(overview.totalVariablePlanned - overview.totalVariableActual)}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3">Catatan Jajan & Belanja Harian</td>
                      <td className="p-3 text-right">-</td>
                      <td className="p-3 text-right font-bold text-rose-600">{formatRupiah(overview.totalDailyExpense)}</td>
                      <td className="p-3 text-right">-</td>
                    </tr>
                    <tr>
                      <td className="p-3">Langganan & Cicilan</td>
                      <td className="p-3 text-right">{formatRupiah(overview.totalSubPlanned)}</td>
                      <td className="p-3 text-right font-bold">{formatRupiah(overview.totalSubActual)}</td>
                      <td className="p-3 text-right text-emerald-600">
                        {formatRupiah(overview.totalSubPlanned - overview.totalSubActual)}
                      </td>
                    </tr>
                    <tr className="bg-teal-50/50">
                      <td className="p-3 font-semibold text-teal-800">Tabungan & Investasi</td>
                      <td className="p-3 text-right">{formatRupiah(overview.totalSavingPlanned)}</td>
                      <td className="p-3 text-right font-bold text-teal-800">{formatRupiah(overview.totalSavingActual)}</td>
                      <td className="p-3 text-right text-teal-700">
                        {formatRupiah(overview.totalSavingActual - overview.totalSavingPlanned)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: TAMBAH / EDIT DOMPET KAS (WALLETS)                               */}
      {/* ========================================================================= */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-base text-slate-800">
                {editingWallet ? 'Edit Dompet Kas' : 'Tambah Dompet / Rekening Baru'}
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const name = (form.elements.namedItem('walletName') as HTMLInputElement).value;
                const type = (form.elements.namedItem('walletType') as HTMLSelectElement).value as any;
                const balance = parseFloat((form.elements.namedItem('walletBalance') as HTMLInputElement).value) || 0;
                const colorHex = (form.elements.namedItem('walletColor') as HTMLInputElement).value;

                if (editingWallet) {
                  setWallets(prev =>
                    prev.map(w => (w.id === editingWallet.id ? { ...w, name, type, balance, colorHex } : w))
                  );
                } else {
                  const newW: WalletItem = {
                    id: `w_${Date.now()}`,
                    name,
                    type,
                    balance,
                    colorHex,
                    iconName: 'wallet'
                  };
                  setWallets(prev => [...prev, newW]);
                }
                setShowWalletModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Dompet / Rekening</label>
                <input
                  name="walletName"
                  defaultValue={editingWallet?.name || ''}
                  placeholder="e.g. Saldo Rekening BCA, DANA, Uang Cash"
                  required
                  className="w-full p-2.5 border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jenis Kas</label>
                  <select
                    name="walletType"
                    defaultValue={editingWallet?.type || 'BANK'}
                    className="w-full p-2.5 border rounded-xl border-slate-200 focus:outline-none"
                  >
                    <option value="BANK">Bank Transfer / BCA / Mandiri</option>
                    <option value="E_WALLET">E-Wallet / DANA / GoPay</option>
                    <option value="CASH">Uang Tunai / Cash</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Warna Badge</label>
                  <input
                    name="walletColor"
                    type="color"
                    defaultValue={editingWallet?.colorHex || '#6599B8'}
                    className="w-full h-10 p-1 border rounded-xl border-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Saldo Sekarang (Rp)</label>
                <input
                  name="walletBalance"
                  type="number"
                  defaultValue={editingWallet?.balance || 0}
                  placeholder="0"
                  required
                  className="w-full p-2.5 border rounded-xl border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2">
                {editingWallet && (
                  <button
                    type="button"
                    onClick={() => {
                      setWallets(prev => prev.filter(w => w.id !== editingWallet.id));
                      setShowWalletModal(false);
                    }}
                    className="px-4 py-2.5 bg-rose-50 text-rose-700 font-bold rounded-xl hover:bg-rose-100 transition cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                  style={{ backgroundColor: activeTheme.primary }}
                >
                  Simpan Dompet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANUAL BALANCE OVERRIDE DIALOG                                   */}
      {/* ========================================================================= */}
      {showManualBalanceModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-base text-slate-800">
                Ubah / Override Saldo Manual
              </h3>
              <button
                onClick={() => setShowManualBalanceModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Secara default, saldo dihitung otomatis dari total dompet kas. Anda dapat mengaktifkan saldo manual untuk override angka total.
            </p>

            <div className="space-y-4 text-xs">
              <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.useManualBalance}
                  onChange={e => setProfile(prev => ({ ...prev, useManualBalance: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600"
                />
                Gunakan Input Saldo Manual (Override Otomatis)
              </label>

              {profile.useManualBalance && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nominal Saldo Manual (Rp)</label>
                  <input
                    type="number"
                    value={manualBalanceInput}
                    onChange={e => setManualBalanceInput(e.target.value)}
                    className="w-full p-2.5 border rounded-xl border-slate-200 font-bold text-sm"
                  />
                </div>
              )}

              <button
                onClick={() => {
                  const val = parseFloat(manualBalanceInput) || 0;
                  setProfile(prev => ({ ...prev, manualBalance: val }));
                  setShowManualBalanceModal(false);
                }}
                className="w-full py-2.5 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                style={{ backgroundColor: activeTheme.primary }}
              >
                Terapkan Pengaturan Saldo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TAMBAH / EDIT PEMASUKAN (INCOME)                                 */}
      {/* ========================================================================= */}
      {showIncomeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-base text-slate-800">
                {editingIncome ? 'Edit Pemasukan' : 'Tambah Pemasukan Baru'}
              </h3>
              <button
                onClick={() => setShowIncomeModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const source = (form.elements.namedItem('incomeSource') as HTMLInputElement).value;
                const type = (form.elements.namedItem('incomeType') as HTMLSelectElement).value as any;
                const amount = parseFloat((form.elements.namedItem('incomeAmount') as HTMLInputElement).value) || 0;
                const walletName = (form.elements.namedItem('incomeWallet') as HTMLSelectElement).value;

                if (editingIncome) {
                  setIncomes(prev =>
                    prev.map(i => (i.id === editingIncome.id ? { ...i, source, type, amount, walletName } : i))
                  );
                } else {
                  const newInc: IncomeItem = {
                    id: `inc_${Date.now()}`,
                    monthId: currentMonthId,
                    source,
                    type,
                    amount,
                    date: new Date().toLocaleDateString('id-ID'),
                    walletName
                  };
                  setIncomes(prev => [...prev, newInc]);
                  // Also add to target wallet balance!
                  addWalletBalance(walletName, amount);
                }
                setShowIncomeModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sumber Pemasukan</label>
                <input
                  name="incomeSource"
                  defaultValue={editingIncome?.source || ''}
                  placeholder="e.g. Gaji Bulanan, Bonus, Freelance"
                  required
                  className="w-full p-2.5 border rounded-xl border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    name="incomeType"
                    defaultValue={editingIncome?.type || 'Utama'}
                    className="w-full p-2.5 border rounded-xl border-slate-200"
                  >
                    <option value="Utama">Utama</option>
                    <option value="Sampingan">Sampingan</option>
                    <option value="Bonus">Bonus</option>
                    <option value="Passive">Passive</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Masuk ke Dompet</label>
                  <select
                    name="incomeWallet"
                    defaultValue={editingIncome?.walletName || wallets[0]?.name || 'Saldo Rekening BCA'}
                    className="w-full p-2.5 border rounded-xl border-slate-200"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal (Rp)</label>
                <input
                  name="incomeAmount"
                  type="number"
                  defaultValue={editingIncome?.amount || ''}
                  placeholder="0"
                  required
                  className="w-full p-2.5 border rounded-xl border-slate-200 font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                style={{ backgroundColor: activeTheme.primary }}
              >
                Simpan Pemasukan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: TAMBAH / EDIT POS ANGGARAN (Fixed, Variable, Savings, Sub)       */}
      {/* ========================================================================= */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-base text-slate-800">
                {editingExpenseItem ? 'Edit Pos Anggaran' : 'Tambah Pos Anggaran Baru'}
              </h3>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const title = (form.elements.namedItem('itemTitle') as HTMLInputElement).value;
                const plannedAmount = parseFloat((form.elements.namedItem('plannedAmount') as HTMLInputElement).value) || 0;
                const actualAmount = parseFloat((form.elements.namedItem('actualAmount') as HTMLInputElement).value) || 0;
                const walletName = (form.elements.namedItem('itemWallet') as HTMLSelectElement).value;

                if (expenseModalType === 'FIXED') {
                  if (editingExpenseItem) {
                    setFixedExpenses(prev => prev.map(f => f.id === editingExpenseItem.id ? { ...f, title, plannedAmount, actualAmount, walletName } : f));
                  } else {
                    setFixedExpenses(prev => [...prev, { id: `fx_${Date.now()}`, monthId: currentMonthId, title, priority: 'High', plannedAmount, actualAmount, date: '', walletName }]);
                  }
                } else if (expenseModalType === 'VARIABLE') {
                  if (editingExpenseItem) {
                    setVariableExpenses(prev => prev.map(v => v.id === editingExpenseItem.id ? { ...v, title, plannedAmount, actualAmount, walletName } : v));
                  } else {
                    setVariableExpenses(prev => [...prev, { id: `vr_${Date.now()}`, monthId: currentMonthId, title, priority: 'Medium', plannedAmount, actualAmount, date: '', walletName }]);
                  }
                } else if (expenseModalType === 'SAVINGS') {
                  if (editingExpenseItem) {
                    setSavings(prev => prev.map(s => s.id === editingExpenseItem.id ? { ...s, title, plannedAmount, actualAmount, walletName } : s));
                  } else {
                    setSavings(prev => [...prev, { id: `sv_${Date.now()}`, monthId: currentMonthId, title, priority: 'High', plannedAmount, actualAmount, targetTotal: 0, date: '', walletName }]);
                  }
                } else if (expenseModalType === 'SUBSCRIPTION') {
                  if (editingExpenseItem) {
                    setSubscriptions(prev => prev.map(s => s.id === editingExpenseItem.id ? { ...s, title, plannedAmount, actualAmount, walletName } : s));
                  } else {
                    setSubscriptions(prev => [...prev, { id: `sb_${Date.now()}`, monthId: currentMonthId, title, priority: 'Low', plannedAmount, actualAmount, date: '', walletName }]);
                  }
                }

                setShowExpenseModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pos Anggaran</label>
                <input
                  name="itemTitle"
                  defaultValue={editingExpenseItem?.title || ''}
                  placeholder="e.g. Sewa Kos, Makan, Tabungan, Spotify"
                  required
                  className="w-full p-2.5 border rounded-xl border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rencana Anggaran (Rp)</label>
                  <input
                    name="plannedAmount"
                    type="number"
                    defaultValue={editingExpenseItem?.plannedAmount || ''}
                    placeholder="0"
                    required
                    className="w-full p-2.5 border rounded-xl border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Realisasi Aktual (Rp)</label>
                  <input
                    name="actualAmount"
                    type="number"
                    defaultValue={editingExpenseItem?.actualAmount || ''}
                    placeholder="0"
                    className="w-full p-2.5 border rounded-xl border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sumber Dompet Kas</label>
                <select
                  name="itemWallet"
                  defaultValue={editingExpenseItem?.walletName || wallets[0]?.name || 'Saldo Rekening BCA'}
                  className="w-full p-2.5 border rounded-xl border-slate-200"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                style={{ backgroundColor: activeTheme.primary }}
              >
                Simpan Pos Anggaran
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: TAMBAH / EDIT TRANSAKSI HARIAN / JAJAN                            */}
      {/* ========================================================================= */}
      {showDailyModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-base text-slate-800">
                {editingDaily ? 'Edit Catatan Harian' : 'Catat Pengeluaran Jajan / Harian'}
              </h3>
              <button
                onClick={() => setShowDailyModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const title = (form.elements.namedItem('dailyTitle') as HTMLInputElement).value;
                const category = (form.elements.namedItem('dailyCategory') as HTMLSelectElement).value;
                const unitPrice = parseFloat((form.elements.namedItem('dailyPrice') as HTMLInputElement).value) || 0;
                const quantity = parseInt((form.elements.namedItem('dailyQty') as HTMLInputElement).value) || 1;
                const totalAmount = unitPrice * quantity;
                const walletName = (form.elements.namedItem('dailyWallet') as HTMLSelectElement).value;
                const notes = (form.elements.namedItem('dailyNotes') as HTMLInputElement).value;

                if (editingDaily) {
                  setDailyExpenses(prev =>
                    prev.map(d => (d.id === editingDaily.id ? { ...d, title, category, unitPrice, quantity, totalAmount, walletName, notes } : d))
                  );
                } else {
                  const newD: DailyExpenseItem = {
                    id: `dl_${Date.now()}`,
                    monthId: currentMonthId,
                    date: new Date().toLocaleDateString('id-ID'),
                    title,
                    category,
                    quantity,
                    unitPrice,
                    totalAmount,
                    notes,
                    walletName
                  };
                  setDailyExpenses(prev => [newD, ...prev]);
                  // Deduct from wallet balance automatically
                  deductWallet(walletName, totalAmount);
                }
                setShowDailyModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Item / Pengeluaran</label>
                <input
                  name="dailyTitle"
                  defaultValue={editingDaily?.title || ''}
                  placeholder="e.g. Kopi Kenangan, Nasi Padang, Bensin"
                  required
                  className="w-full p-2.5 border rounded-xl border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori Jajan</label>
                  <select
                    name="dailyCategory"
                    defaultValue={editingDaily?.category || 'Jajan'}
                    className="w-full p-2.5 border rounded-xl border-slate-200"
                  >
                    <option value="Jajan">Jajan / Kopi / Cemilan</option>
                    <option value="Makan">Makan Pokok / Siang</option>
                    <option value="Transport">Bensin / Ojek Online</option>
                    <option value="Belanja">Belanja / Minimarket</option>
                    <option value="Hiburan">Hiburan / Nonton</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Potong dari Dompet</label>
                  <select
                    name="dailyWallet"
                    defaultValue={editingDaily?.walletName || wallets[2]?.name || wallets[0]?.name}
                    className="w-full p-2.5 border rounded-xl border-slate-200"
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Harga Satuan (Rp)</label>
                  <input
                    name="dailyPrice"
                    type="number"
                    defaultValue={editingDaily?.unitPrice || ''}
                    placeholder="25000"
                    required
                    className="w-full p-2.5 border rounded-xl border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jumlah (Qty)</label>
                  <input
                    name="dailyQty"
                    type="number"
                    defaultValue={editingDaily?.quantity || 1}
                    min={1}
                    required
                    className="w-full p-2.5 border rounded-xl border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  name="dailyNotes"
                  defaultValue={editingDaily?.notes || ''}
                  placeholder="e.g. Less sugar, makan siang bareng teman"
                  className="w-full p-2.5 border rounded-xl border-slate-200"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                style={{ backgroundColor: activeTheme.primary }}
              >
                Catat & Potong Saldo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: ASISTEN SUARA & INPUT CEPAT ("HAI PLENNER")                      */}
      {/* ========================================================================= */}
      {showVoiceModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <h3 className="font-heading font-bold text-base text-slate-800">
                  Hai Plenner - Asisten Keuangan
                </h3>
              </div>
              <button
                onClick={() => setShowVoiceModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Ketik atau ucapkan pengeluaran harian secara alami. AI akan otomatis mengurai nominal, pos kategori, dan dompet yang dipotong.
            </p>

            {/* Quick Preset Prompts */}
            <div className="space-y-1.5 mb-4">
              <p className="text-[11px] font-bold text-slate-600">Contoh Perintah Cepat:</p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Beli Kopi Kenangan 25rb pakai Uang Cash',
                  'Beli Bensin Pertamax 35000 pakai GoPay',
                  'Makan Siang Nasi Padang 28rb pakai Saldo DANA',
                  'Gaji Masuk 6000000 ke Saldo Rekening BCA'
                ].map((txt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('voice-text-input') as HTMLInputElement;
                      if (input) input.value = txt;
                    }}
                    className="text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition cursor-pointer"
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const text = (form.elements.namedItem('voiceText') as HTMLInputElement).value;

                // Simple natural language parser
                const numbers = text.match(/\d+[\d.,]*/g);
                let amount = 0;
                if (text.toLowerCase().includes('rb') || text.toLowerCase().includes('k')) {
                  const rawNum = parseFloat(numbers?.[0] || '0');
                  amount = rawNum * 1000;
                } else if (numbers) {
                  amount = parseFloat(numbers[0].replace(/[.,]/g, '')) || 0;
                }

                let category = 'Jajan';
                if (text.toLowerCase().includes('makan') || text.toLowerCase().includes('nasi')) category = 'Makan';
                else if (text.toLowerCase().includes('bensin') || text.toLowerCase().includes('transport') || text.toLowerCase().includes('ojek')) category = 'Transport';
                else if (text.toLowerCase().includes('gaji') || text.toLowerCase().includes('masuk')) category = 'Income';

                let targetWallet = wallets[0]?.name || 'Uang Cash';
                if (text.toLowerCase().includes('cash') || text.toLowerCase().includes('tunai')) targetWallet = 'Uang Cash';
                else if (text.toLowerCase().includes('dana')) targetWallet = 'Saldo DANA';
                else if (text.toLowerCase().includes('gopay')) targetWallet = 'GoPay';
                else if (text.toLowerCase().includes('bca') || text.toLowerCase().includes('rekening')) targetWallet = 'Saldo Rekening BCA';

                if (category === 'Income') {
                  const newInc: IncomeItem = {
                    id: `inc_${Date.now()}`,
                    monthId: currentMonthId,
                    source: text,
                    type: 'Utama',
                    amount,
                    date: new Date().toLocaleDateString('id-ID'),
                    walletName: targetWallet
                  };
                  setIncomes(prev => [...prev, newInc]);
                  addWalletBalance(targetWallet, amount);
                } else {
                  const newD: DailyExpenseItem = {
                    id: `dl_${Date.now()}`,
                    monthId: currentMonthId,
                    date: new Date().toLocaleDateString('id-ID'),
                    title: text.split(' pakai ')[0] || text,
                    category,
                    quantity: 1,
                    unitPrice: amount,
                    totalAmount: amount,
                    walletName: targetWallet
                  };
                  setDailyExpenses(prev => [newD, ...prev]);
                  deductWallet(targetWallet, amount);
                }

                setShowVoiceModal(false);
                triggerConfetti();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <input
                  id="voice-text-input"
                  name="voiceText"
                  placeholder="Ketik e.g. Beli Matcha 20rb pakai Saldo DANA"
                  required
                  className="w-full p-3 border rounded-xl border-slate-300 font-medium focus:ring-2 focus:ring-purple-400 focus:outline-none"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Proses & Catat Otomatis
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: IMPORT MUTASI BANK / REKENING PARSER                             */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-base text-slate-800">
                  Import Mutasi Rekening / SMS Banking
                </h3>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Paste teks riwayat mutasi dari m-Banking BCA, Mandiri, BRI, DANA, atau GoPay. Sistem akan memparsing transaksi pengeluaran dan pemasukan.
            </p>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const transcript = (form.elements.namedItem('transcriptText') as HTMLTextAreaElement).value;

                // Simple lines parser
                const lines = transcript.split('\n').filter(l => l.trim().length > 0);
                let importedCount = 0;

                lines.forEach(line => {
                  const matchNumber = line.match(/\d+[\d.,]*/g);
                  if (matchNumber) {
                    const amount = parseFloat(matchNumber[matchNumber.length - 1].replace(/[.,]/g, '')) || 0;
                    if (amount > 0) {
                      const newD: DailyExpenseItem = {
                        id: `dl_${Date.now()}_${Math.random()}`,
                        monthId: currentMonthId,
                        date: new Date().toLocaleDateString('id-ID'),
                        title: line.substring(0, 30),
                        category: 'Belanja',
                        quantity: 1,
                        unitPrice: amount,
                        totalAmount: amount,
                        walletName: 'Saldo Rekening BCA'
                      };
                      setDailyExpenses(prev => [newD, ...prev]);
                      importedCount++;
                    }
                  }
                });

                setShowImportModal(false);
                if (importedCount > 0) triggerConfetti();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <textarea
                  name="transcriptText"
                  rows={6}
                  placeholder={`Contoh format:\n29/01 TRSF E-BANKING DB 50.000 KOPI KENANGAN\n30/01 QRIS SPAY DB 25.000 AYAM GEPREK\n30/01 TRSF CR 500.000 TRANSFER MASUK`}
                  required
                  className="w-full p-3 border rounded-xl border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                Parsing & Masukkan ke Catatan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: PENGATURAN & TEMA WARNA PASTEL                                   */}
      {/* ========================================================================= */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-base text-slate-800">
                Pengaturan & Preferensi
              </h3>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Nama Pengguna */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Profil</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 border rounded-xl border-slate-200"
                />
              </div>

              {/* Tema Pastel Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Pilihan Tema Pastel</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(THEME_PRESETS).map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setProfile(prev => ({ ...prev, themePreset: theme.id }))}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                        profile.themePreset === theme.id ? 'border-slate-800 ring-2 ring-slate-400 bg-slate-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                      <span className="font-bold text-slate-800 text-[11px]">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* PIN Keamanan */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.isPinEnabled}
                    onChange={e => setProfile(prev => ({ ...prev, isPinEnabled: e.target.checked }))}
                    className="w-4 h-4 rounded"
                  />
                  Kunci Aplikasi dengan PIN
                </label>

                {profile.isPinEnabled && (
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Setel PIN Baru (4-6 Angka)</label>
                    <input
                      type="password"
                      maxLength={6}
                      value={profile.pin}
                      onChange={e => setProfile(prev => ({ ...prev, pin: e.target.value }))}
                      className="w-full p-2 border rounded-lg bg-white"
                    />
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-full py-2.5 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                style={{ backgroundColor: activeTheme.primary }}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 9: UBAH TARGET PERSENTASE JATAH FORMULA                             */}
      {/* ========================================================================= */}
      {showAllocationEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-base text-slate-800">
                Atur Target Persentase Formula Jatah (%)
              </h3>
              <button
                onClick={() => setShowAllocationEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Standar ideal keuangan: Kebutuhan Pokok 50%, Kebutuhan Variabel 25%, Tabungan & Investasi 20%, Langganan 5%. (Total 100%)
            </p>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const fixPct = parseFloat((form.elements.namedItem('pct_fixed') as HTMLInputElement).value) || 0;
                const varPct = parseFloat((form.elements.namedItem('pct_var') as HTMLInputElement).value) || 0;
                const savPct = parseFloat((form.elements.namedItem('pct_sav') as HTMLInputElement).value) || 0;
                const subPct = parseFloat((form.elements.namedItem('pct_sub') as HTMLInputElement).value) || 0;

                setAllocations([
                  { id: 'al1', monthId: currentMonthId, categoryKey: 'FIXED', title: 'Kebutuhan Pokok (Fixed Cost)', targetPercent: fixPct, colorHex: '#6599B8' },
                  { id: 'al2', monthId: currentMonthId, categoryKey: 'VARIABLE', title: 'Kebutuhan Variabel & Jajan', targetPercent: varPct, colorHex: '#F4A261' },
                  { id: 'al3', monthId: currentMonthId, categoryKey: 'SAVINGS', title: 'Tabungan & Investasi', targetPercent: savPct, colorHex: '#74C69D' },
                  { id: 'al4', monthId: currentMonthId, categoryKey: 'SUBSCRIPTION', title: 'Langganan & Cicilan', targetPercent: subPct, colorHex: '#A594F9' }
                ]);

                setShowAllocationEditModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Kebutuhan Pokok (Fixed)</span>
                <div className="flex items-center gap-1">
                  <input
                    name="pct_fixed"
                    type="number"
                    defaultValue={currentMonthAllocations.find(a => a.categoryKey === 'FIXED')?.targetPercent || 50}
                    className="w-16 p-2 border rounded-lg text-center font-bold"
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Kebutuhan Variabel & Jajan</span>
                <div className="flex items-center gap-1">
                  <input
                    name="pct_var"
                    type="number"
                    defaultValue={currentMonthAllocations.find(a => a.categoryKey === 'VARIABLE')?.targetPercent || 25}
                    className="w-16 p-2 border rounded-lg text-center font-bold"
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Tabungan & Investasi</span>
                <div className="flex items-center gap-1">
                  <input
                    name="pct_sav"
                    type="number"
                    defaultValue={currentMonthAllocations.find(a => a.categoryKey === 'SAVINGS')?.targetPercent || 20}
                    className="w-16 p-2 border rounded-lg text-center font-bold"
                  />
                  <span>%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Langganan & Cicilan</span>
                <div className="flex items-center gap-1">
                  <input
                    name="pct_sub"
                    type="number"
                    defaultValue={currentMonthAllocations.find(a => a.categoryKey === 'SUBSCRIPTION')?.targetPercent || 5}
                    className="w-16 p-2 border rounded-lg text-center font-bold"
                  />
                  <span>%</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-white font-bold rounded-xl shadow-xs transition mt-2 cursor-pointer"
                style={{ backgroundColor: activeTheme.primary }}
              >
                Simpan Target Formula %
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 10: TAMBAH BULAN BARU                                               */}
      {/* ========================================================================= */}
      {showNewMonthModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-base text-slate-800">
                Tambah Bulan Anggaran Baru
              </h3>
              <button
                onClick={() => setShowNewMonthModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const mName = (form.elements.namedItem('newMonthName') as HTMLSelectElement).value;
                const mYear = parseInt((form.elements.namedItem('newMonthYear') as HTMLInputElement).value) || 2026;
                const copyPrev = (form.elements.namedItem('copyPrevBudget') as HTMLInputElement).checked;

                const monthMap: Record<string, string> = {
                  Januari: '01', Februari: '02', Maret: '03', April: '04',
                  Mei: '05', Juni: '06', Juli: '07', Agustus: '08',
                  September: '09', Oktober: '10', November: '11', Desember: '12'
                };
                const newId = `${mYear}-${monthMap[mName] || '01'}`;

                if (!months.some(m => m.monthId === newId)) {
                  setMonths(prev => [...prev, { monthId: newId, monthName: mName, year: mYear, notes: '', isClosed: false }]);
                }

                if (copyPrev) {
                  // Copy fixed & variable templates with 0 actual amount
                  const prevFixed = fixedExpenses.filter(f => f.monthId === currentMonthId);
                  const prevVar = variableExpenses.filter(v => v.monthId === currentMonthId);
                  const prevSav = savings.filter(s => s.monthId === currentMonthId);
                  const prevSub = subscriptions.filter(s => s.monthId === currentMonthId);

                  setFixedExpenses(prev => [...prev, ...prevFixed.map(f => ({ ...f, id: `fx_${Date.now()}_${Math.random()}`, monthId: newId, actualAmount: 0 }))]);
                  setVariableExpenses(prev => [...prev, ...prevVar.map(v => ({ ...v, id: `vr_${Date.now()}_${Math.random()}`, monthId: newId, actualAmount: 0 }))]);
                  setSavings(prev => [...prev, ...prevSav.map(s => ({ ...s, id: `sv_${Date.now()}_${Math.random()}`, monthId: newId, actualAmount: 0 }))]);
                  setSubscriptions(prev => [...prev, ...prevSub.map(s => ({ ...s, id: `sb_${Date.now()}_${Math.random()}`, monthId: newId, actualAmount: 0 }))]);
                }

                setCurrentMonthId(newId);
                setShowNewMonthModal(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Bulan</label>
                  <select
                    name="newMonthName"
                    defaultValue="Februari"
                    className="w-full p-2.5 border rounded-xl border-slate-200"
                  >
                    {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tahun</label>
                  <input
                    name="newMonthYear"
                    type="number"
                    defaultValue={2026}
                    className="w-full p-2.5 border rounded-xl border-slate-200 font-bold"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                <input
                  name="copyPrevBudget"
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded text-blue-600"
                />
                Salin daftar pos anggaran dari bulan aktif saat ini
              </label>

              <button
                type="submit"
                className="w-full py-2.5 text-white font-bold rounded-xl shadow-xs transition cursor-pointer"
                style={{ backgroundColor: activeTheme.primary }}
              >
                Buat Bulan Baru
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
