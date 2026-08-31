export interface WalletItem {
  id: string;
  name: string;
  type: 'CASH' | 'E_WALLET' | 'BANK' | 'OTHER';
  initialBalance: number; // Saldo awal / modal awal
  balance: number; // Sisa saldo aktif saat ini
  colorHex: string;
  iconName: string;
  isDefault?: boolean;
}

export interface UserProfile {
  name: string;
  email?: string;
  pin: string;
  isPinEnabled: boolean;
  isLoggedIn: boolean;
  themePreset: string;
  fontColorPreset: string;
  fontSizeScale: number;
  useManualBalance: boolean;
  manualBalance: number;
  syncCode: string;
  lastSyncedAt?: string;
  deviceViewMode?: 'WINDOWS' | 'ANDROID_TABLET' | 'IPHONE';
  supabaseUserId?: string;
  supabaseEmail?: string;
}

export interface BudgetMonth {
  monthId: string; // e.g. "2026-01"
  monthName: string; // e.g. "Januari"
  year: number;
  notes: string;
  isClosed: boolean;
}

export interface IncomeItem {
  id: string;
  monthId: string;
  source: string;
  type: 'Utama' | 'Sampingan' | 'Bonus' | 'Passive';
  amount: number;
  date: string;
  walletName: string;
}

export interface SavingItem {
  id: string;
  monthId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  plannedAmount: number;
  actualAmount: number;
  targetTotal?: number;
  date: string;
  walletName: string;
}

export interface FixedExpenseItem {
  id: string;
  monthId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  plannedAmount: number;
  actualAmount: number;
  date: string;
  walletName: string;
}

export interface VariableExpenseItem {
  id: string;
  monthId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  plannedAmount: number;
  actualAmount: number;
  date: string;
  walletName: string;
}

export interface SubscriptionItem {
  id: string;
  monthId: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  plannedAmount: number;
  actualAmount: number;
  date: string;
  walletName: string;
}

export interface DailyExpenseItem {
  id: string;
  monthId: string;
  date: string;
  title: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  notes?: string;
  walletName: string;
}

export interface BudgetPlanAllocation {
  id: string;
  monthId: string;
  categoryKey: 'FIXED' | 'VARIABLE' | 'SAVINGS' | 'SUBSCRIPTION';
  title: string;
  targetPercent: number;
  colorHex: string;
}

export interface AllocationCalculationResult {
  allocation: BudgetPlanAllocation;
  totalIncome: number;
  maxAllowanceAmount: number;
  actualSpentAmount: number;
  remainingAmount: number;
  usagePercentOfPlan: number;
  isNearMax: boolean;
  isExceeded: boolean;
  excessAmount: number;
}

export interface CategoryRank {
  categoryName: string;
  totalAmount: number;
  percentageOfExpense: number;
  transactionCount: number;
}

export interface FinancialOverview {
  totalInitialBalance: number; // Akumulasi total saldo modal/uang awal dompet bawaan
  totalRealCapital: number; // Akumulasi total uang awal riil = totalInitialBalance + totalIncome
  totalCurrentBalance: number; // Sisa total saldo kas saat ini
  totalIncome: number;
  totalSavingPlanned: number;
  totalSavingActual: number;
  totalFixedPlanned: number;
  totalFixedActual: number;
  totalVariablePlanned: number;
  totalVariableActual: number;
  totalSubPlanned: number;
  totalSubActual: number;
  totalDailyExpense: number;
  totalActualExpense: number;
  totalOutflow: number; // totalActualExpense + totalSavingActual
  remainingBalance: number;
  remainingBudgetPercent: number;
  savingsRatePercent: number;
  useManualBalance: boolean;
  effectiveBalance: number;
}
