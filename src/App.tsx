import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  UserProfile, 
  WalletItem, 
  BudgetMonth, 
  IncomeItem, 
  SavingItem, 
  FixedExpenseItem, 
  VariableExpenseItem, 
  SubscriptionItem, 
  DailyExpenseItem, 
  BudgetPlanAllocation, 
  AllocationCalculationResult 
} from './types';
import { 
  DEFAULT_PROFILE, 
  DEFAULT_WALLETS, 
  DEFAULT_MONTHS, 
  DEFAULT_INCOMES, 
  DEFAULT_ALLOCATIONS, 
  DEFAULT_FIXED, 
  DEFAULT_VARIABLE, 
  DEFAULT_SAVINGS, 
  DEFAULT_SUBSCRIPTIONS, 
  DEFAULT_DAILY_EXPENSES, 
  THEME_PRESETS 
} from './defaultData';

import { 
  computeAllWallets, 
  computeFinancialOverview, 
  getGreeting 
} from './utils/financeEngine';

import { 
  supabase, 
  fetchUserTransactions, 
  insertUserTransaction, 
  deleteUserTransaction, 
  getSupabaseConfig, 
  SupabaseTransaction 
} from './lib/supabase';

import { AuthGate } from './components/AuthGate';
import { BalanceHeroCard } from './components/BalanceHeroCard';
import { WalletList } from './components/WalletList';
import { DailyExpensesSection } from './components/DailyExpensesSection';
import { BudgetCalculator } from './components/BudgetCalculator';
import { ExpenseSections } from './components/ExpenseSections';
import { HaiPlennerVoiceAssistant } from './components/HaiPlennerVoiceAssistant';
import { MonthlyReportSection } from './components/MonthlyReportSection';
import { SyncModal } from './components/SyncModal';
import { SettingsModal } from './components/SettingsModal';
import { TransferFundsModal } from './components/TransferFundsModal';

import { 
  Wallet, 
  Calendar, 
  PieChart, 
  Settings, 
  Smartphone, 
  Sparkles, 
  Layers, 
  TrendingDown, 
  Plus,
  Minus,
  ArrowRightLeft,
  X,
  Radio,
  Database,
  RefreshCw,
  CalendarDays
} from 'lucide-react';

export function App() {
  // --- Persistent States ---
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mp_profile');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [wallets, setWallets] = useState<WalletItem[]>(() => {
    const saved = localStorage.getItem('mp_wallets');
    return saved ? JSON.parse(saved) : DEFAULT_WALLETS;
  });

  const [months, setMonths] = useState<BudgetMonth[]>(() => {
    const saved = localStorage.getItem('mp_months');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 12) {
          return parsed;
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((p: any) => p.monthId));
          const missing = DEFAULT_MONTHS.filter(d => !existingIds.has(d.monthId));
          return [...parsed, ...missing];
        }
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_MONTHS;
  });

  const [activeMonthId, setActiveMonthId] = useState<string>('2026-01');

  const [incomes, setIncomes] = useState<IncomeItem[]>(() => {
    const saved = localStorage.getItem('mp_incomes');
    return saved ? JSON.parse(saved) : DEFAULT_INCOMES;
  });

  const [allocations, setAllocations] = useState<BudgetPlanAllocation[]>(() => {
    const saved = localStorage.getItem('mp_allocations');
    return saved ? JSON.parse(saved) : DEFAULT_ALLOCATIONS;
  });

  const [fixed, setFixed] = useState<FixedExpenseItem[]>(() => {
    const saved = localStorage.getItem('mp_fixed');
    return saved ? JSON.parse(saved) : DEFAULT_FIXED;
  });

  const [variable, setVariable] = useState<VariableExpenseItem[]>(() => {
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

  // --- Supabase Realtime & Data State ---
  const [supabaseTransactions, setSupabaseTransactions] = useState<SupabaseTransaction[]>([]);
  const [isSupabaseLive, setIsSupabaseLive] = useState<boolean>(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);

  // --- Active Tab State in Dashboard ---
  const [dashboardTab, setDashboardTab] = useState<'OVERVIEW' | 'DAILY' | 'BUDGET_CALC' | 'EXPENSES' | 'REPORT'>('OVERVIEW');

  // --- Modals State ---
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddMonthModalOpen, setIsAddMonthModalOpen] = useState(false);
  
  // New Month Form State
  const [newMonthForm, setNewMonthForm] = useState({
    monthName: 'Januari',
    year: 2027,
    notes: 'Anggaran Baru'
  });
  
  // Quick Action Modal States
  const [isQuickIncomeModalOpen, setIsQuickIncomeModalOpen] = useState(false);
  const [isQuickExpenseModalOpen, setIsQuickExpenseModalOpen] = useState(false);

  // Quick Income Form State
  const [quickIncomeForm, setQuickIncomeForm] = useState({
    title: '',
    amount: '' as number | '',
    category: 'Utama' as 'Utama' | 'Sampingan' | 'Bonus' | 'Passive',
    sourceWalletName: ''
  });

  // Quick Expense Form State
  const [quickExpenseForm, setQuickExpenseForm] = useState({
    title: '',
    amount: '' as number | '',
    category: 'Jajan',
    walletName: ''
  });

  // --- Save to LocalStorage on state changes ---
  useEffect(() => {
    localStorage.setItem('mp_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('mp_wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('mp_months', JSON.stringify(months));
  }, [months]);

  useEffect(() => {
    localStorage.setItem('mp_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('mp_allocations', JSON.stringify(allocations));
  }, [allocations]);

  useEffect(() => {
    localStorage.setItem('mp_fixed', JSON.stringify(fixed));
  }, [fixed]);

  useEffect(() => {
    localStorage.setItem('mp_variable', JSON.stringify(variable));
  }, [variable]);

  useEffect(() => {
    localStorage.setItem('mp_savings', JSON.stringify(savings));
  }, [savings]);

  useEffect(() => {
    localStorage.setItem('mp_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('mp_daily', JSON.stringify(dailyExpenses));
  }, [dailyExpenses]);

  // --- 2. AMBIL DATA DARI SUPABASE (READ) & SINKRONISASI KE STATE ---
  const loadSupabaseData = useCallback(async (userId: string) => {
    if (!userId) return;
    setIsSyncingSupabase(true);
    try {
      const data = await fetchUserTransactions(userId);
      setSupabaseTransactions(data);

      if (data.length > 0) {
        // Convert Supabase transactions into Incomes and Daily Expenses
        const supaIncomes: IncomeItem[] = data
          .filter(t => t.type === 'INCOME')
          .map(t => ({
            id: t.id,
            monthId: activeMonthId,
            source: t.title,
            type: 'Utama',
            amount: Number(t.amount) || 0,
            date: t.date || new Date().toLocaleDateString('id-ID'),
            walletName: t.wallet_name || 'Bank BCA'
          }));

        const supaExpenses: DailyExpenseItem[] = data
          .filter(t => t.type === 'EXPENSE')
          .map(t => ({
            id: t.id,
            monthId: activeMonthId,
            date: t.date || new Date().toLocaleDateString('id-ID'),
            title: t.title,
            category: t.category || 'Makan & Minum',
            quantity: 1,
            unitPrice: Number(t.amount) || 0,
            totalAmount: Number(t.amount) || 0,
            notes: t.notes,
            walletName: t.wallet_name || 'Uang Cash'
          }));

        // Replace or merge with state
        if (supaIncomes.length > 0) {
          setIncomes(supaIncomes);
        }
        if (supaExpenses.length > 0) {
          setDailyExpenses(supaExpenses);
        }
      }
    } catch (err) {
      console.error('Failed to load Supabase transactions:', err);
    } finally {
      setIsSyncingSupabase(false);
    }
  }, [activeMonthId]);

  // --- 3. SINKRONISASI REAL-TIME DENGAN SUPABASE CHANNEL ---
  useEffect(() => {
    const config = getSupabaseConfig();
    const userId = profile.supabaseUserId;

    // Check existing Supabase auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !profile.isLoggedIn) {
        setProfile(prev => ({
          ...prev,
          isLoggedIn: true,
          supabaseUserId: session.user.id,
          supabaseEmail: session.user.email,
          email: session.user.email || prev.email,
          name: session.user.user_metadata?.name || prev.name
        }));
      }
    }).catch(console.error);

    // Listen to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setProfile(prev => ({
          ...prev,
          isLoggedIn: true,
          supabaseUserId: session.user.id,
          supabaseEmail: session.user.email,
          email: session.user.email || prev.email,
          name: session.user.user_metadata?.name || prev.name
        }));
      } else if (event === 'SIGNED_OUT') {
        // Reset Supabase user
        setProfile(prev => ({
          ...prev,
          supabaseUserId: undefined,
          supabaseEmail: undefined
        }));
      }
    });

    if (!config.isConfigured || !userId) {
      setIsSupabaseLive(false);
      return () => {
        authListener.subscription.unsubscribe();
      };
    }

    // Initial data fetch
    loadSupabaseData(userId);

    // Setup real-time channel subscription
    const channel = supabase
      .channel(`public:transactions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Realtime change from Supabase:', payload);
          // Automatically re-fetch and recalculate total balance
          loadSupabaseData(userId);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSupabaseLive(true);
        } else {
          setIsSupabaseLive(false);
        }
      });

    return () => {
      authListener.subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [profile.supabaseUserId, loadSupabaseData, profile.isLoggedIn]);

  // --- Active Month Object ---
  const activeMonth = useMemo(() => {
    return months.find(m => m.monthId === activeMonthId) || months[0] || {
      monthId: '2026-01',
      monthName: 'Januari',
      year: 2026,
      notes: '',
      isClosed: false
    };
  }, [months, activeMonthId]);

  // --- Computed Wallets Engine ---
  const computedWallets = useMemo(() => {
    return computeAllWallets(wallets, incomes, dailyExpenses, fixed, variable, savings, subscriptions, activeMonthId);
  }, [wallets, incomes, dailyExpenses, fixed, variable, savings, subscriptions, activeMonthId]);

  // --- Computed Financial Overview & Otomatisasi Perhitungan Saldo ---
  const overview = useMemo(() => {
    return computeFinancialOverview(
      computedWallets,
      incomes,
      fixed,
      variable,
      savings,
      subscriptions,
      dailyExpenses,
      profile,
      activeMonthId
    );
  }, [computedWallets, incomes, fixed, variable, savings, subscriptions, dailyExpenses, profile, activeMonthId]);

  // --- 50/25/20/5 Allocation Calculations ---
  const allocationResults: AllocationCalculationResult[] = useMemo(() => {
    const totalMonthIncome = overview.totalIncome;

    return allocations.map(al => {
      const maxAllowanceAmount = (totalMonthIncome * al.targetPercent) / 100;
      let actualSpentAmount = 0;

      if (al.categoryKey === 'FIXED') {
        actualSpentAmount = fixed
          .filter(f => f.monthId === activeMonthId)
          .reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);
      } else if (al.categoryKey === 'VARIABLE') {
        const varActual = variable
          .filter(v => v.monthId === activeMonthId)
          .reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);
        const dailyActual = dailyExpenses
          .filter(d => d.monthId === activeMonthId)
          .reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);
        actualSpentAmount = varActual + dailyActual;
      } else if (al.categoryKey === 'SAVINGS') {
        actualSpentAmount = savings
          .filter(s => s.monthId === activeMonthId)
          .reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);
      } else if (al.categoryKey === 'SUBSCRIPTION') {
        actualSpentAmount = subscriptions
          .filter(sub => sub.monthId === activeMonthId)
          .reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);
      }

      const remainingAmount = maxAllowanceAmount - actualSpentAmount;
      const usagePercentOfPlan = maxAllowanceAmount > 0 
        ? Math.round((actualSpentAmount / maxAllowanceAmount) * 100) 
        : 0;
      const isExceeded = actualSpentAmount > maxAllowanceAmount && maxAllowanceAmount > 0;
      const isNearMax = usagePercentOfPlan >= 85 && !isExceeded;
      const excessAmount = isExceeded ? actualSpentAmount - maxAllowanceAmount : 0;

      return {
        allocation: al,
        totalIncome: totalMonthIncome,
        maxAllowanceAmount,
        actualSpentAmount,
        remainingAmount,
        usagePercentOfPlan,
        isNearMax,
        isExceeded,
        excessAmount
      };
    });
  }, [allocations, overview.totalIncome, fixed, variable, dailyExpenses, savings, subscriptions, activeMonthId]);

  // --- Current Theme Config ---
  const currentTheme = THEME_PRESETS[profile.themePreset] || THEME_PRESETS.SHARK_BLUE;

  // --- Action Handlers ---
  const handleAddDailyExpense = async (newItem: Omit<DailyExpenseItem, 'id'>) => {
    const expense: DailyExpenseItem = {
      ...newItem,
      id: 'd_' + Date.now() + Math.random().toString(36).substr(2, 4)
    };
    setDailyExpenses(prev => [expense, ...prev]);

    // Push to Supabase if connected
    if (profile.supabaseUserId) {
      await insertUserTransaction({
        user_id: profile.supabaseUserId,
        title: newItem.title,
        amount: newItem.totalAmount,
        type: 'EXPENSE',
        category: newItem.category,
        wallet_name: newItem.walletName,
        date: newItem.date,
        notes: newItem.notes
      });
    }
  };

  const handleDeleteDailyExpense = async (id: string) => {
    setDailyExpenses(prev => prev.filter(d => d.id !== id));
    if (profile.supabaseUserId) {
      await deleteUserTransaction(id, profile.supabaseUserId);
    }
  };

  const handleAddIncome = async (item: Omit<IncomeItem, 'id' | 'monthId'>) => {
    const newInc: IncomeItem = {
      ...item,
      id: 'inc_' + Date.now(),
      monthId: activeMonthId
    };
    setIncomes(prev => [...prev, newInc]);

    // Push to Supabase if connected
    if (profile.supabaseUserId) {
      await insertUserTransaction({
        user_id: profile.supabaseUserId,
        title: item.source,
        amount: item.amount,
        type: 'INCOME',
        category: item.type,
        wallet_name: item.walletName,
        date: item.date
      });
    }
  };

  const handleUpdateIncome = (updated: IncomeItem) => {
    setIncomes(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const handleDeleteIncome = async (id: string) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
    if (profile.supabaseUserId) {
      await deleteUserTransaction(id, profile.supabaseUserId);
    }
  };

  const handleTransferFunds = (sourceWalletId: string, targetWalletId: string, amount: number, _note?: string) => {
    setWallets(prev => prev.map(w => {
      if (w.id === sourceWalletId) {
        const nextInit = Math.max(0, (Number(w.initialBalance) || 0) - amount);
        return { ...w, initialBalance: nextInit, balance: nextInit };
      }
      if (w.id === targetWalletId) {
        const nextInit = (Number(w.initialBalance) || 0) + amount;
        return { ...w, initialBalance: nextInit, balance: nextInit };
      }
      return w;
    }));
    setIsTransferModalOpen(false);
  };

  const handleAddNewMonth = (monthName: string, year: number, notes?: string) => {
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const monthIndex = monthNames.indexOf(monthName) + 1;
    const padIndex = monthIndex > 0 ? String(monthIndex).padStart(2, '0') : '01';
    const newMonthId = `${year}-${padIndex}`;

    if (months.some(m => m.monthId === newMonthId)) {
      setActiveMonthId(newMonthId);
      setIsAddMonthModalOpen(false);
      return;
    }

    const newMonth: BudgetMonth = {
      monthId: newMonthId,
      monthName,
      year,
      notes: notes || `Anggaran ${monthName} ${year}`,
      isClosed: false
    };

    setMonths(prev => [...prev, newMonth].sort((a, b) => a.monthId.localeCompare(b.monthId)));
    setActiveMonthId(newMonthId);
    setIsAddMonthModalOpen(false);
  };

  const handleAddFixed = (item: Omit<FixedExpenseItem, 'id' | 'monthId'>) => {
    setFixed(prev => [...prev, { ...item, id: 'fx_' + Date.now(), monthId: activeMonthId }]);
  };
  const handleDeleteFixed = (id: string) => setFixed(prev => prev.filter(f => f.id !== id));

  const handleAddVariable = (item: Omit<VariableExpenseItem, 'id' | 'monthId'>) => {
    setVariable(prev => [...prev, { ...item, id: 'var_' + Date.now(), monthId: activeMonthId }]);
  };
  const handleDeleteVariable = (id: string) => setVariable(prev => prev.filter(v => v.id !== id));

  const handleAddSaving = (item: Omit<SavingItem, 'id' | 'monthId'>) => {
    setSavings(prev => [...prev, { ...item, id: 'sav_' + Date.now(), monthId: activeMonthId }]);
  };
  const handleDeleteSaving = (id: string) => setSavings(prev => prev.filter(s => s.id !== id));

  const handleAddSub = (item: Omit<SubscriptionItem, 'id' | 'monthId'>) => {
    setSubscriptions(prev => [...prev, { ...item, id: 'sub_' + Date.now(), monthId: activeMonthId }]);
  };
  const handleDeleteSub = (id: string) => setSubscriptions(prev => prev.filter(s => s.id !== id));

  const handleAutoAddFromAssistant = (params: {
    title: string;
    amount: number;
    category: string;
    walletName: string;
    type: 'EXPENSE' | 'INCOME' | 'SAVING';
  }) => {
    const todayFormatted = new Date().toLocaleDateString('id-ID');

    if (params.type === 'EXPENSE') {
      handleAddDailyExpense({
        monthId: activeMonthId,
        date: todayFormatted,
        category: params.category || 'Makan & Minum',
        title: params.title,
        quantity: 1,
        unitPrice: params.amount,
        totalAmount: params.amount,
        walletName: params.walletName
      });
    } else if (params.type === 'INCOME') {
      handleAddIncome({
        source: params.title,
        type: 'Sampingan',
        amount: params.amount,
        date: todayFormatted,
        walletName: params.walletName
      });
    } else if (params.type === 'SAVING') {
      handleAddSaving({
        title: params.title,
        priority: 'Medium',
        plannedAmount: params.amount,
        actualAmount: params.amount,
        targetTotal: params.amount * 5,
        date: todayFormatted,
        walletName: params.walletName
      });
    }
  };

  const handleLoginSuccess = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    if (updatedProfile.supabaseUserId) {
      loadSupabaseData(updatedProfile.supabaseUserId);
    }
  };

  const handleDemoLogin = () => {
    setProfile({
      ...profile,
      isLoggedIn: true,
      name: 'Budi Santoso',
      syncCode: 'CUAN-7701'
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn(e);
    }
    setProfile({
      ...profile,
      isLoggedIn: false,
      supabaseUserId: undefined,
      supabaseEmail: undefined
    });
    setIsSettingsModalOpen(false);
  };

  const handleImportFullData = (payload: any) => {
    if (payload.profile) setProfile({ ...payload.profile, isLoggedIn: true });
    if (payload.wallets) setWallets(payload.wallets);
    if (payload.months) setMonths(payload.months);
    if (payload.incomes) setIncomes(payload.incomes);
    if (payload.allocations) setAllocations(payload.allocations);
    if (payload.fixed) setFixed(payload.fixed);
    if (payload.variable) setVariable(payload.variable);
    if (payload.savings) setSavings(payload.savings);
    if (payload.subscriptions) setSubscriptions(payload.subscriptions);
    if (payload.dailyExpenses) setDailyExpenses(payload.dailyExpenses);
    setIsSyncModalOpen(false);
  };

  // Quick Income Submit Handler
  const handleQuickIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIncomeForm.title.trim() || !quickIncomeForm.amount || Number(quickIncomeForm.amount) <= 0) return;

    handleAddIncome({
      source: quickIncomeForm.title.trim(),
      type: quickIncomeForm.category,
      amount: Number(quickIncomeForm.amount),
      date: new Date().toLocaleDateString('id-ID'),
      walletName: quickIncomeForm.sourceWalletName || wallets[0]?.name || 'Bank BCA'
    });

    setQuickIncomeForm({
      title: '',
      amount: '',
      category: 'Utama',
      sourceWalletName: ''
    });
    setIsQuickIncomeModalOpen(false);
  };

  // Quick Expense Submit Handler
  const handleQuickExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickExpenseForm.title.trim() || !quickExpenseForm.amount || Number(quickExpenseForm.amount) <= 0) return;

    handleAddDailyExpense({
      monthId: activeMonthId,
      date: new Date().toLocaleDateString('id-ID'),
      title: quickExpenseForm.title.trim(),
      category: quickExpenseForm.category,
      quantity: 1,
      unitPrice: Number(quickExpenseForm.amount),
      totalAmount: Number(quickExpenseForm.amount),
      notes: 'Ditambahkan via tombol cepat',
      walletName: quickExpenseForm.walletName || wallets[0]?.name || 'Uang Cash'
    });

    setQuickExpenseForm({
      title: '',
      amount: '',
      category: 'Jajan',
      walletName: ''
    });
    setIsQuickExpenseModalOpen(false);
  };

  // If user is not logged in, render the clean pastel AuthGate
  if (!profile.isLoggedIn) {
    return (
      <AuthGate
        profile={profile}
        onLoginSuccess={handleLoginSuccess}
        onDemoLogin={handleDemoLogin}
        onThemeChange={(newThemeKey) => setProfile(p => ({ ...p, themePreset: newThemeKey }))}
      />
    );
  }

  const { greeting } = getGreeting(profile.name);

  return (
    <div 
      className="min-h-[100dvh] flex flex-col md:flex-row transition-colors duration-300 font-sans text-slate-800"
      style={{ backgroundColor: currentTheme.background }}
    >
      {/* 1. PERMANENT SIDEBAR FOR TABLET & DESKTOP (hidden md:flex) */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-white border-r border-slate-200/80 p-5 shrink-0 min-h-[100dvh] sticky top-0 justify-between shadow-xs z-30">
        <div className="space-y-6">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md font-bold shrink-0"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 truncate">
                Money Planner
              </h1>
              <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1.5">
                <span>{profile.name}</span>
                <span>•</span>
                <span className="font-mono font-bold text-sky-700">{profile.syncCode}</span>
              </p>
            </div>
          </div>

          {/* Realtime Supabase Connection Pill */}
          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-semibold text-slate-700 truncate">
                {isSupabaseLive ? 'Supabase Real-Time' : 'Database Aktif'}
              </span>
            </div>
            {isSyncingSupabase && (
              <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
            )}
          </div>

          {/* Month Selector in Sidebar */}
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">
              Bulan Anggaran Aktif:
            </label>
            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Calendar className="w-4 h-4 text-slate-500 ml-1 shrink-0" />
              <select
                value={activeMonthId}
                onChange={e => setActiveMonthId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 w-full focus:outline-none cursor-pointer py-1"
              >
                {months.map(m => (
                  <option key={m.monthId} value={m.monthId}>
                    {m.monthName} {m.year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fast Action Buttons in Sidebar */}
          <div className="space-y-2">
            <button
              id="sidebar-btn-quick-income"
              type="button"
              onClick={() => setIsQuickIncomeModalOpen(true)}
              className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Pemasukan</span>
            </button>
            <button
              id="sidebar-btn-quick-expense"
              type="button"
              onClick={() => setIsQuickExpenseModalOpen(true)}
              className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.98] cursor-pointer"
            >
              <Minus className="w-4 h-4" />
              <span>- Pengeluaran / Jajan</span>
            </button>
          </div>

          {/* Sidebar Navigation Menu */}
          <nav className="space-y-1">
            <button
              id="sidebar-nav-overview"
              type="button"
              onClick={() => setDashboardTab('OVERVIEW')}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition text-xs font-semibold cursor-pointer ${
                dashboardTab === 'OVERVIEW'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Kas & Dompet ({computedWallets.length})</span>
            </button>

            <button
              id="sidebar-nav-daily"
              type="button"
              onClick={() => setDashboardTab('DAILY')}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition text-xs font-semibold cursor-pointer ${
                dashboardTab === 'DAILY'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span>Belanja & Jajan ({dailyExpenses.filter(d => d.monthId === activeMonthId).length})</span>
            </button>

            <button
              id="sidebar-nav-calc"
              type="button"
              onClick={() => setDashboardTab('BUDGET_CALC')}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition text-xs font-semibold cursor-pointer ${
                dashboardTab === 'BUDGET_CALC'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Kalkulator 50/25/20/5</span>
            </button>

            <button
              id="sidebar-nav-expenses"
              type="button"
              onClick={() => setDashboardTab('EXPENSES')}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition text-xs font-semibold cursor-pointer ${
                dashboardTab === 'EXPENSES'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-500" />
              <span>Pos Anggaran</span>
            </button>

            <button
              id="sidebar-nav-report"
              type="button"
              onClick={() => setDashboardTab('REPORT')}
              className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl flex items-center gap-3 transition text-xs font-semibold cursor-pointer ${
                dashboardTab === 'REPORT'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PieChart className="w-4 h-4 text-emerald-500" />
              <span>Laporan Keuangan</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Controls: Theme & Settings */}
        <div className="pt-4 border-t border-slate-200/80 space-y-2">
          <button
            type="button"
            onClick={() => setIsSyncModalOpen(true)}
            className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center justify-between transition cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Smartphone className="w-3.5 h-3.5 text-sky-600" />
              <span>Sync Cloud / Supabase</span>
            </span>
            <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500' : 'bg-sky-500'} animate-pulse`} />
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-2 transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Tema Pastel & Profil</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN SCROLLABLE CONTENT COLUMN (min-h-[100dvh]) */}
      <div className="flex-1 flex flex-col min-h-[100dvh] overflow-y-auto">
        
        {/* Mobile Sticky Top Header (md:hidden) */}
        <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs font-bold shrink-0 text-sm"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <Wallet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 truncate">
                Money Planner
              </h1>
              <p className="text-[10px] text-slate-500 truncate font-mono flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseLive ? 'bg-emerald-500' : 'bg-sky-400'}`} />
                <span>{profile.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Month Dropdown on Mobile */}
            <select
              value={activeMonthId}
              onChange={e => setActiveMonthId(e.target.value)}
              className="bg-slate-100 text-[11px] font-bold text-slate-800 py-1.5 px-2 rounded-xl border border-slate-200 focus:outline-none cursor-pointer max-w-[110px]"
            >
              {months.map(m => (
                <option key={m.monthId} value={m.monthId}>
                  {m.monthName}
                </option>
              ))}
            </select>

            <button
              id="mobile-btn-sync"
              type="button"
              onClick={() => {
                if (profile.supabaseUserId) loadSupabaseData(profile.supabaseUserId);
                setIsSyncModalOpen(true);
              }}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-1.5 rounded-xl border border-slate-200 bg-white text-sky-600 shadow-2xs transition active:scale-95"
              title="Sync Multi-Device & Supabase"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            <button
              id="mobile-btn-settings"
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition active:scale-95"
              title="Pengaturan & Tema"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Desktop Sticky Header (hidden md:flex) */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span 
              className="text-xs font-bold px-2.5 py-1 rounded-full border"
              style={{
                backgroundColor: currentTheme.badgeBg,
                borderColor: currentTheme.border,
                color: currentTheme.primaryDark
              }}
            >
              {currentTheme.name}
            </span>
            <h2 className="text-sm font-bold text-slate-800">
              {dashboardTab === 'OVERVIEW' && 'Kas & Dompet'}
              {dashboardTab === 'DAILY' && 'Jajan Harian'}
              {dashboardTab === 'BUDGET_CALC' && 'Formula Anggaran'}
              {dashboardTab === 'EXPENSES' && 'Pos Anggaran'}
              {dashboardTab === 'REPORT' && 'Laporan Bulanan'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {profile.supabaseUserId && (
              <button
                type="button"
                onClick={() => loadSupabaseData(profile.supabaseUserId!)}
                disabled={isSyncingSupabase}
                className="text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                title="Sinkronkan ulang data Supabase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                <span>{isSyncingSupabase ? 'Menyinkronkan...' : 'Sync Supabase'}</span>
              </button>
            )}

            <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{activeMonth.monthName} {activeMonth.year}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsTransferModalOpen(true)}
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-sky-600" />
              <span>Transfer Saldo</span>
            </button>
          </div>
        </header>

        {/* Unified Main Content Canvas */}
        <main className="px-3 sm:px-6 md:px-8 py-4 md:py-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto w-full pb-24 md:pb-12 animate-fadeIn">
          
          {/* 1. Header Utama: Ringkasan Total Saldo + Pemasukan & Pengeluaran + Tombol Aksi */}
          <BalanceHeroCard
            overview={overview}
            profile={profile}
            computedWallets={computedWallets}
            activeMonthName={activeMonth.monthName}
            activeYear={activeMonth.year}
            theme={currentTheme}
            onOpenWalletModal={() => setDashboardTab('OVERVIEW')}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            onQuickIncome={() => setIsQuickIncomeModalOpen(true)}
            onQuickExpense={() => setIsQuickExpenseModalOpen(true)}
          />

          {/* 2. 12-Bulan Anggaran Quick Selector Bar */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-sky-600" />
                <span>Bulan Anggaran: <strong className="text-slate-800">{activeMonth.monthName} {activeMonth.year}</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setIsAddMonthModalOpen(true)}
                className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Bulan</span>
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {months.map(m => {
                const isActive = m.monthId === activeMonthId;
                const shortName = m.monthName.slice(0, 3);
                return (
                  <button
                    key={m.monthId}
                    type="button"
                    onClick={() => setActiveMonthId(m.monthId)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex flex-col items-center min-w-[56px] ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                    }`}
                  >
                    <span>{shortName}</span>
                    <span className={`text-[9px] font-normal ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                      {m.year}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Asisten Keuangan Suara & Teks */}
          <HaiPlennerVoiceAssistant
            wallets={computedWallets}
            userName={profile.name}
            theme={currentTheme}
            onAutoAddTransaction={handleAutoAddFromAssistant}
          />

          {/* 4. In-page Tab Navigation Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto text-xs font-semibold scrollbar-none">
            <button
              id="tab-nav-overview"
              type="button"
              onClick={() => setDashboardTab('OVERVIEW')}
              className={`min-h-[40px] py-2 px-3.5 sm:px-4 rounded-xl flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                dashboardTab === 'OVERVIEW'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Kas & Dompet ({computedWallets.length})</span>
            </button>

            <button
              id="tab-nav-daily"
              type="button"
              onClick={() => setDashboardTab('DAILY')}
              className={`min-h-[40px] py-2 px-3.5 sm:px-4 rounded-xl flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                dashboardTab === 'DAILY'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TrendingDown className="w-4 h-4 text-rose-500" />
              <span>Jajan Harian ({dailyExpenses.filter(d => d.monthId === activeMonthId).length})</span>
            </button>

            <button
              id="tab-nav-calc"
              type="button"
              onClick={() => setDashboardTab('BUDGET_CALC')}
              className={`min-h-[40px] py-2 px-3.5 sm:px-4 rounded-xl flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                dashboardTab === 'BUDGET_CALC'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Formula 50/25/20/5</span>
            </button>

            <button
              id="tab-nav-expenses"
              type="button"
              onClick={() => setDashboardTab('EXPENSES')}
              className={`min-h-[40px] py-2 px-3.5 sm:px-4 rounded-xl flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                dashboardTab === 'EXPENSES'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-500" />
              <span>Pos Anggaran</span>
            </button>

            <button
              id="tab-nav-report"
              type="button"
              onClick={() => setDashboardTab('REPORT')}
              className={`min-h-[40px] py-2 px-3.5 sm:px-4 rounded-xl flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                dashboardTab === 'REPORT'
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <PieChart className="w-4 h-4 text-emerald-500" />
              <span>Laporan</span>
            </button>
          </div>

          {/* 5. Tab Views */}
          {dashboardTab === 'OVERVIEW' && (
            <div className="space-y-5">
              <WalletList
                wallets={wallets}
                computedWallets={computedWallets}
                theme={currentTheme}
                onUpdateWallets={setWallets}
                onOpenTransferModal={() => setIsTransferModalOpen(true)}
              />

              {/* Quick preview of daily transactions */}
              <DailyExpensesSection
                expenses={dailyExpenses}
                wallets={computedWallets}
                currentMonthId={activeMonthId}
                theme={currentTheme}
                onAddExpense={handleAddDailyExpense}
                onDeleteExpense={handleDeleteDailyExpense}
              />
            </div>
          )}

          {dashboardTab === 'DAILY' && (
            <DailyExpensesSection
              expenses={dailyExpenses}
              wallets={computedWallets}
              currentMonthId={activeMonthId}
              theme={currentTheme}
              onAddExpense={handleAddDailyExpense}
              onDeleteExpense={handleDeleteDailyExpense}
            />
          )}

          {dashboardTab === 'BUDGET_CALC' && (
            <BudgetCalculator
              allocations={allocations}
              incomes={incomes}
              wallets={computedWallets}
              currentMonthId={activeMonthId}
              results={allocationResults}
              theme={currentTheme}
              onAddIncome={handleAddIncome}
              onUpdateIncome={handleUpdateIncome}
              onDeleteIncome={handleDeleteIncome}
              onUpdateAllocations={setAllocations}
            />
          )}

          {dashboardTab === 'EXPENSES' && (
            <ExpenseSections
              fixed={fixed}
              variable={variable}
              savings={savings}
              subscriptions={subscriptions}
              wallets={computedWallets}
              currentMonthId={activeMonthId}
              theme={currentTheme}
              onAddFixed={handleAddFixed}
              onDeleteFixed={handleDeleteFixed}
              onAddVariable={handleAddVariable}
              onDeleteVariable={handleDeleteVariable}
              onAddSaving={handleAddSaving}
              onDeleteSaving={handleDeleteSaving}
              onAddSub={handleAddSub}
              onDeleteSub={handleDeleteSub}
            />
          )}

          {dashboardTab === 'REPORT' && (
            <MonthlyReportSection
              overview={overview}
              wallets={computedWallets}
              results={allocationResults}
              theme={currentTheme}
            />
          )}

        </main>
      </div>

      {/* 3. MOBILE THUMB BOTTOM NAVIGATION BAR (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1.5 flex items-center justify-around shadow-lg">
        <button
          id="mobile-bottom-nav-overview"
          type="button"
          onClick={() => setDashboardTab('OVERVIEW')}
          className={`min-w-[44px] min-h-[44px] flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
            dashboardTab === 'OVERVIEW' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">Kas</span>
        </button>

        <button
          id="mobile-bottom-nav-daily"
          type="button"
          onClick={() => setDashboardTab('DAILY')}
          className={`min-w-[44px] min-h-[44px] flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
            dashboardTab === 'DAILY' ? 'text-rose-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <TrendingDown className="w-5 h-5" />
          <span className="text-[10px]">Jajan</span>
        </button>

        <button
          id="mobile-bottom-nav-calc"
          type="button"
          onClick={() => setDashboardTab('BUDGET_CALC')}
          className={`min-w-[44px] min-h-[44px] flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
            dashboardTab === 'BUDGET_CALC' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Formula</span>
        </button>

        <button
          id="mobile-bottom-nav-expenses"
          type="button"
          onClick={() => setDashboardTab('EXPENSES')}
          className={`min-w-[44px] min-h-[44px] flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
            dashboardTab === 'EXPENSES' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">Pos</span>
        </button>

        <button
          id="mobile-bottom-nav-report"
          type="button"
          onClick={() => setDashboardTab('REPORT')}
          className={`min-w-[44px] min-h-[44px] flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl transition ${
            dashboardTab === 'REPORT' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px]">Laporan</span>
        </button>
      </nav>

      {/* QUICK INCOME MODAL (+ Pemasukan) */}
      {isQuickIncomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">+ Catat Pemasukan Cepat</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickIncomeModalOpen(false)}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickIncomeSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sumber Pemasukan:</label>
                <input
                  type="text"
                  required
                  placeholder="Cth: Gaji Bulanan, Bonus, Freelance"
                  value={quickIncomeForm.title}
                  onChange={e => setQuickIncomeForm({ ...quickIncomeForm, title: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nominal Uang (Rp):</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Cth: 5000000"
                  value={quickIncomeForm.amount}
                  onChange={e => setQuickIncomeForm({ ...quickIncomeForm, amount: Number(e.target.value) || '' })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori Pemasukan:</label>
                <select
                  value={quickIncomeForm.category}
                  onChange={e => setQuickIncomeForm({ ...quickIncomeForm, category: e.target.value as 'Utama' | 'Sampingan' | 'Bonus' | 'Passive' })}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="Utama">Gaji Pokok / Utama</option>
                  <option value="Sampingan">Freelance & Sampingan</option>
                  <option value="Bonus">Bonus & THR</option>
                  <option value="Passive">Passive Income & Investasi</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dompet Penerima:</label>
                <select
                  value={quickIncomeForm.sourceWalletName}
                  onChange={e => setQuickIncomeForm({ ...quickIncomeForm, sourceWalletName: e.target.value })}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickIncomeModalOpen(false)}
                  className="min-h-[44px] flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan Pemasukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK EXPENSE MODAL (- Pengeluaran) */}
      {isQuickExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                  <Minus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">- Catat Pengeluaran Cepat</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickExpenseModalOpen(false)}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Item Belanja / Jajan:</label>
                <input
                  type="text"
                  required
                  placeholder="Cth: Kopi Kenangan, Beli Makan Siang, Bensin"
                  value={quickExpenseForm.title}
                  onChange={e => setQuickExpenseForm({ ...quickExpenseForm, title: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nominal Uang (Rp):</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Cth: 25000"
                  value={quickExpenseForm.amount}
                  onChange={e => setQuickExpenseForm({ ...quickExpenseForm, amount: Number(e.target.value) || '' })}
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-sm font-bold text-rose-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kategori:</label>
                <select
                  value={quickExpenseForm.category}
                  onChange={e => setQuickExpenseForm({ ...quickExpenseForm, category: e.target.value })}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  <option value="Jajan">Jajan & Kopi</option>
                  <option value="Makan & Minum">Makan Siang / Malam</option>
                  <option value="Transport & Bensin">Bensin / Transport / Ojek</option>
                  <option value="Belanja & Keperluan">Belanja Harian / Minimarket</option>
                  <option value="Hiburan & Nongkrong">Hiburan & Bioskop</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Potong Dari Dompet Kas:</label>
                <select
                  value={quickExpenseForm.walletName}
                  onChange={e => setQuickExpenseForm({ ...quickExpenseForm, walletName: e.target.value })}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white font-medium"
                >
                  {wallets.map(w => (
                    <option key={w.id} value={w.name}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQuickExpenseModalOpen(false)}
                  className="min-h-[44px] flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan & Potong Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sync Code & Multi-Device Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        profile={profile}
        wallets={wallets}
        months={months}
        incomes={incomes}
        savings={savings}
        fixed={fixed}
        variable={variable}
        subscriptions={subscriptions}
        dailyExpenses={dailyExpenses}
        allocations={allocations}
        theme={currentTheme}
        onUpdateSyncCode={newCode => setProfile({ ...profile, syncCode: newCode })}
        onImportFullData={handleImportFullData}
      />

      {/* Settings Modal with Pastel Themes & Profile */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        wallets={wallets}
        onUpdateProfile={setProfile}
        onLogout={handleLogout}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
      />

      {/* Add New Budget Month Modal */}
      {isAddMonthModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-800 text-base">Tambah Bulan Anggaran</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddMonthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddNewMonth(newMonthForm.monthName, Number(newMonthForm.year), newMonthForm.notes);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Nama Bulan:</label>
                <select
                  value={newMonthForm.monthName}
                  onChange={e => setNewMonthForm({ ...newMonthForm, monthName: e.target.value })}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
                >
                  {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tahun:</label>
                <input
                  type="number"
                  required
                  min="2020"
                  max="2040"
                  value={newMonthForm.year}
                  onChange={e => setNewMonthForm({ ...newMonthForm, year: Number(e.target.value) })}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Catatan / Target (Opsional):</label>
                <input
                  type="text"
                  placeholder="Misal: Target hemat & bonus tahun baru"
                  value={newMonthForm.notes}
                  onChange={e => setNewMonthForm({ ...newMonthForm, notes: e.target.value })}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMonthModalOpen(false)}
                  className="min-h-[44px] flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold cursor-pointer hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] flex-1 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer hover:opacity-95"
                  style={{ backgroundColor: currentTheme.primary }}
                >
                  Simpan Bulan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Funds / Pindah Saldo Antar Kas Modal */}
      <TransferFundsModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        wallets={wallets}
        theme={currentTheme}
        onTransfer={handleTransferFunds}
      />

    </div>
  );
}

export default App;
