import { 
  WalletItem, 
  IncomeItem, 
  SavingItem, 
  FixedExpenseItem, 
  VariableExpenseItem, 
  SubscriptionItem, 
  DailyExpenseItem, 
  BudgetPlanAllocation, 
  FinancialOverview, 
  AllocationCalculationResult,
  UserProfile
} from '../types';

export interface WalletComputedData extends WalletItem {
  inflowTotal: number;
  dailyExpenseTotal: number;
  fixedExpenseTotal: number;
  variableExpenseTotal: number;
  savingExpenseTotal: number;
  subExpenseTotal: number;
  totalExpenseOnly: number;
  totalOutflow: number; // Expense + Saving
  computedBalance: number;
  remainingPercent: number;
  isNegative: boolean;
  transactionsCount: number;
  recentTransactions: Array<{
    id: string;
    type: 'INCOME' | 'DAILY' | 'FIXED' | 'VARIABLE' | 'SAVING' | 'SUBSCRIPTION';
    title: string;
    amount: number;
    date: string;
  }>;
}

// Normalizer for matching wallet names safely with 100% deterministic accuracy
export function matchWallet(itemWalletName: string | undefined, wallet: WalletItem, allWallets: WalletItem[]): boolean {
  if (!itemWalletName) {
    return !!wallet.isDefault || allWallets[0]?.id === wallet.id;
  }

  // 1. Direct ID match
  if (itemWalletName === wallet.id) {
    return true;
  }

  const cleanItem = itemWalletName.trim().toLowerCase();
  const cleanWallet = wallet.name.trim().toLowerCase();
  
  // 2. Exact name match
  if (cleanItem === cleanWallet) {
    return true;
  }

  // If another wallet has an exact name or ID match, don't let this one steal it
  const hasExactMatchElsewhere = allWallets.some(w => 
    w.id !== wallet.id && (w.name.trim().toLowerCase() === cleanItem || w.id === itemWalletName)
  );
  if (hasExactMatchElsewhere) {
    return false;
  }

  // 3. Normalized alias matching
  if (cleanWallet.includes('bca') && (cleanItem.includes('bca') || cleanItem.includes('bank bca'))) return true;
  if (cleanWallet.includes('dana') && cleanItem.includes('dana')) return true;
  if (cleanWallet.includes('gopay') && (cleanItem.includes('gopay') || cleanItem.includes('go-pay'))) return true;
  if (cleanWallet.includes('shopee') && (cleanItem.includes('shopee') || cleanItem.includes('shopeepay'))) return true;
  if ((cleanWallet.includes('cash') || cleanWallet.includes('tunai')) && (cleanItem.includes('cash') || cleanItem.includes('tunai'))) return true;
  if (cleanWallet.includes('mandiri') && cleanItem.includes('mandiri')) return true;
  if (cleanWallet.includes('bri') && cleanItem.includes('bri')) return true;
  if (cleanWallet.includes('jago') && cleanItem.includes('jago')) return true;
  if (cleanWallet.includes('ovo') && cleanItem.includes('ovo')) return true;

  // 4. Fallback to default or first wallet if no match exists anywhere
  const anyMatchExists = allWallets.some(w => {
    const cw = w.name.trim().toLowerCase();
    return cw === cleanItem || (cw.includes('bca') && cleanItem.includes('bca')) || (cw.includes('dana') && cleanItem.includes('dana'));
  });

  const isFallbackWallet = wallet.isDefault || (!allWallets.some(w => w.isDefault) && allWallets[0]?.id === wallet.id);
  if (!anyMatchExists && isFallbackWallet) {
    return true;
  }

  return false;
}

/**
 * Calculates deterministic, 100% synchronized wallet metrics
 */
export function computeAllWallets(
  wallets: WalletItem[],
  incomes: IncomeItem[],
  dailyExpenses: DailyExpenseItem[],
  fixed: FixedExpenseItem[],
  variable: VariableExpenseItem[],
  savings: SavingItem[],
  subscriptions: SubscriptionItem[],
  currentMonthId: string
): WalletComputedData[] {
  // Filter transactions for current active month (or all if not specified)
  const monthIncomes = incomes.filter(i => !currentMonthId || i.monthId === currentMonthId);
  const monthDaily = dailyExpenses.filter(d => !currentMonthId || d.monthId === currentMonthId);
  const monthFixed = fixed.filter(f => !currentMonthId || f.monthId === currentMonthId);
  const monthVar = variable.filter(v => !currentMonthId || v.monthId === currentMonthId);
  const monthSav = savings.filter(s => !currentMonthId || s.monthId === currentMonthId);
  const monthSub = subscriptions.filter(s => !currentMonthId || s.monthId === currentMonthId);

  return wallets.map(wallet => {
    // 1. Incomes for this wallet
    const matchedIncomes = monthIncomes.filter(i => matchWallet(i.walletName, wallet, wallets));
    const inflowTotal = matchedIncomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // 2. Daily Expenses
    const matchedDaily = monthDaily.filter(d => matchWallet(d.walletName, wallet, wallets));
    const dailyExpenseTotal = matchedDaily.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

    // 3. Fixed Expenses
    const matchedFixed = monthFixed.filter(f => matchWallet(f.walletName, wallet, wallets));
    const fixedExpenseTotal = matchedFixed.reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);

    // 4. Variable Expenses
    const matchedVar = monthVar.filter(v => matchWallet(v.walletName, wallet, wallets));
    const variableExpenseTotal = matchedVar.reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);

    // 5. Savings (disisihkan dari dompet kas)
    const matchedSav = monthSav.filter(s => matchWallet(s.walletName, wallet, wallets));
    const savingExpenseTotal = matchedSav.reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);

    // 6. Subscriptions
    const matchedSub = monthSub.filter(s => matchWallet(s.walletName, wallet, wallets));
    const subExpenseTotal = matchedSub.reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);

    // Sum outflows
    const totalExpenseOnly = dailyExpenseTotal + fixedExpenseTotal + variableExpenseTotal + subExpenseTotal;
    const totalOutflow = totalExpenseOnly + savingExpenseTotal;

    // Mathematical formula for remaining active balance
    const initBal = Number(wallet.initialBalance) || 0;
    const computedBalance = initBal + inflowTotal - totalOutflow;

    const baseForRatio = initBal + inflowTotal;
    const remainingPercent = baseForRatio > 0 
      ? Math.max(0, Math.min(100, Math.round((computedBalance / baseForRatio) * 100))) 
      : 0;

    // Collect recent transactions for details
    const recentTransactions: WalletComputedData['recentTransactions'] = [
      ...matchedIncomes.map(i => ({ id: i.id, type: 'INCOME' as const, title: i.source, amount: i.amount, date: i.date })),
      ...matchedDaily.map(d => ({ id: d.id, type: 'DAILY' as const, title: `${d.title} (x${d.quantity})`, amount: -d.totalAmount, date: d.date })),
      ...matchedFixed.map(f => ({ id: f.id, type: 'FIXED' as const, title: f.title, amount: -f.actualAmount, date: f.date })),
      ...matchedVar.map(v => ({ id: v.id, type: 'VARIABLE' as const, title: v.title, amount: -v.actualAmount, date: v.date })),
      ...matchedSav.map(s => ({ id: s.id, type: 'SAVING' as const, title: `Tabungan: ${s.title}`, amount: -s.actualAmount, date: s.date })),
      ...matchedSub.map(sb => ({ id: sb.id, type: 'SUBSCRIPTION' as const, title: `Langganan: ${sb.title}`, amount: -sb.actualAmount, date: sb.date }))
    ].sort((a, b) => b.id.localeCompare(a.id));

    return {
      ...wallet,
      balance: computedBalance, // Always synchronized
      inflowTotal,
      dailyExpenseTotal,
      fixedExpenseTotal,
      variableExpenseTotal,
      savingExpenseTotal,
      subExpenseTotal,
      totalExpenseOnly,
      totalOutflow,
      computedBalance,
      remainingPercent,
      isNegative: computedBalance < 0,
      transactionsCount: recentTransactions.length,
      recentTransactions
    };
  });
}

/**
 * Calculates overall financial overview
 */
export function computeFinancialOverview(
  wallets: WalletComputedData[],
  incomes: IncomeItem[],
  fixed: FixedExpenseItem[],
  variable: VariableExpenseItem[],
  savings: SavingItem[],
  subscriptions: SubscriptionItem[],
  dailyExpenses: DailyExpenseItem[],
  profile: UserProfile,
  currentMonthId: string
): FinancialOverview {
  const monthIncomes = incomes.filter(i => !currentMonthId || i.monthId === currentMonthId);
  const monthFixed = fixed.filter(f => !currentMonthId || f.monthId === currentMonthId);
  const monthVar = variable.filter(v => !currentMonthId || v.monthId === currentMonthId);
  const monthSav = savings.filter(s => !currentMonthId || s.monthId === currentMonthId);
  const monthSub = subscriptions.filter(s => !currentMonthId || s.monthId === currentMonthId);
  const monthDaily = dailyExpenses.filter(d => !currentMonthId || d.monthId === currentMonthId);

  const totalIncome = monthIncomes.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  
  const totalSavingPlanned = monthSav.reduce((acc, curr) => acc + (Number(curr.plannedAmount) || 0), 0);
  const totalSavingActual = monthSav.reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);

  const totalFixedPlanned = monthFixed.reduce((acc, curr) => acc + (Number(curr.plannedAmount) || 0), 0);
  const totalFixedActual = monthFixed.reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);

  const totalVariablePlanned = monthVar.reduce((acc, curr) => acc + (Number(curr.plannedAmount) || 0), 0);
  const totalVariableActual = monthVar.reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);

  const totalSubPlanned = monthSub.reduce((acc, curr) => acc + (Number(curr.plannedAmount) || 0), 0);
  const totalSubActual = monthSub.reduce((acc, curr) => acc + (Number(curr.actualAmount) || 0), 0);

  const totalDailyExpense = monthDaily.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

  const totalActualExpense = totalFixedActual + totalVariableActual + totalSubActual + totalDailyExpense;
  const totalOutflow = totalActualExpense + totalSavingActual;

  // Aggregate wallet initial balances and current active balances directly from computed wallets
  const totalInitialBalance = wallets.reduce((acc, curr) => acc + (Number(curr.initialBalance) || 0), 0);
  const totalCurrentBalance = wallets.reduce((acc, curr) => acc + curr.computedBalance, 0);
  const totalRealCapital = totalInitialBalance + totalIncome; // Total Uang Awal Riil Akumulasi

  const remainingBalance = totalIncome - totalOutflow;
  const remainingBudgetPercent = totalIncome > 0 ? Math.max(0, Math.round((remainingBalance / totalIncome) * 100)) : 0;
  const savingsRatePercent = totalIncome > 0 ? Math.round((totalSavingActual / totalIncome) * 100) : 0;

  return {
    totalInitialBalance,
    totalRealCapital,
    totalCurrentBalance,
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
    totalOutflow,
    remainingBalance,
    remainingBudgetPercent,
    savingsRatePercent,
    useManualBalance: profile.useManualBalance,
    effectiveBalance: profile.useManualBalance ? profile.manualBalance : totalCurrentBalance
  };
}

export function getGreeting(name: string): { greeting: string; period: string; icon: string } {
  const hour = new Date().getHours();
  let greeting = 'Selamat Datang';
  let period = 'Pagi';
  let icon = '🌅';

  if (hour >= 4 && hour < 11) {
    greeting = 'Selamat Pagi';
    period = 'Pagi';
    icon = '🌅';
  } else if (hour >= 11 && hour < 15) {
    greeting = 'Selamat Siang';
    period = 'Siang';
    icon = '☀️';
  } else if (hour >= 15 && hour < 18) {
    greeting = 'Selamat Sore';
    period = 'Sore';
    icon = '🌤️';
  } else {
    greeting = 'Selamat Malam';
    period = 'Malam';
    icon = '🌙';
  }

  return {
    greeting: `${greeting}, ${name || 'Sobat Cuan'}!`,
    period,
    icon
  };
}
