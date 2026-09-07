import { BudgetMonth, WalletItem, IncomeItem, SavingItem, FixedExpenseItem, VariableExpenseItem, SubscriptionItem, DailyExpenseItem, BudgetPlanAllocation, UserProfile } from './types';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Sobat Cuan',
  email: 'arifin.cuan@planner.id',
  pin: '1234',
  isPinEnabled: false,
  isLoggedIn: false, // Menampilkan halaman pendaftaran/masuk akun terlebih dahulu
  themePreset: 'SHARK_BLUE',
  fontColorPreset: 'DEEP_CHARCOAL',
  fontSizeScale: 1.0,
  useManualBalance: false,
  manualBalance: 0,
  syncCode: 'CUAN-7701',
  lastSyncedAt: new Date().toLocaleDateString('id-ID'),
  deviceViewMode: 'WINDOWS'
};

export const DEFAULT_MONTHS: BudgetMonth[] = [
  { monthId: '2026-01', monthName: 'Januari', year: 2026, notes: 'Anggaran Awal Tahun', isClosed: false },
  { monthId: '2026-02', monthName: 'Februari', year: 2026, notes: 'Anggaran Bulan Kasih Sayang', isClosed: false },
  { monthId: '2026-03', monthName: 'Maret', year: 2026, notes: 'Anggaran Bulan Berkah', isClosed: false },
  { monthId: '2026-04', monthName: 'April', year: 2026, notes: 'Anggaran Bulan Kemenangan', isClosed: false },
  { monthId: '2026-05', monthName: 'Mei', year: 2026, notes: 'Anggaran Pertengahan Tahun', isClosed: false },
  { monthId: '2026-06', monthName: 'Juni', year: 2026, notes: 'Anggaran Liburan & Pertengahan Tahun', isClosed: false },
  { monthId: '2026-07', monthName: 'Juli', year: 2026, notes: 'Anggaran Semester Baru', isClosed: false },
  { monthId: '2026-08', monthName: 'Agustus', year: 2026, notes: 'Anggaran Kemerdekaan', isClosed: false },
  { monthId: '2026-09', monthName: 'September', year: 2026, notes: 'Anggaran Kuartal Tiga', isClosed: false },
  { monthId: '2026-10', monthName: 'Oktober', year: 2026, notes: 'Anggaran Produktivitas', isClosed: false },
  { monthId: '2026-11', monthName: 'November', year: 2026, notes: 'Anggaran Menjelang Akhir Tahun', isClosed: false },
  { monthId: '2026-12', monthName: 'Desember', year: 2026, notes: 'Anggaran Liburan & Evaluasi Tahunan', isClosed: false }
];

export const DEFAULT_WALLETS: WalletItem[] = [
  { id: 'w1', name: 'Saldo Rekening BCA', type: 'BANK', initialBalance: 0, balance: 0, colorHex: '#6599B8', iconName: 'bank', isDefault: true },
  { id: 'w2', name: 'Saldo DANA', type: 'E_WALLET', initialBalance: 0, balance: 0, colorHex: '#118EEA', iconName: 'dana' },
  { id: 'w3', name: 'Uang Cash', type: 'CASH', initialBalance: 0, balance: 0, colorHex: '#74C69D', iconName: 'cash' },
  { id: 'w4', name: 'GoPay', type: 'E_WALLET', initialBalance: 0, balance: 0, colorHex: '#00AED6', iconName: 'wallet' },
  { id: 'w5', name: 'ShopeePay', type: 'E_WALLET', initialBalance: 0, balance: 0, colorHex: '#EE4D2D', iconName: 'card' }
];

export const DEFAULT_INCOMES: IncomeItem[] = [];

export const DEFAULT_ALLOCATIONS: BudgetPlanAllocation[] = [
  { id: 'al1', monthId: '2026-01', categoryKey: 'FIXED', title: 'Kebutuhan Pokok (Fixed Cost)', targetPercent: 50, colorHex: '#6599B8' },
  { id: 'al2', monthId: '2026-01', categoryKey: 'VARIABLE', title: 'Kebutuhan Variabel & Jajan', targetPercent: 25, colorHex: '#F4A261' },
  { id: 'al3', monthId: '2026-01', categoryKey: 'SAVINGS', title: 'Tabungan & Investasi', targetPercent: 20, colorHex: '#74C69D' },
  { id: 'al4', monthId: '2026-01', categoryKey: 'SUBSCRIPTION', title: 'Langganan & Cicilan', targetPercent: 5, colorHex: '#A594F9' }
];

export const DEFAULT_FIXED: FixedExpenseItem[] = [];

export const DEFAULT_VARIABLE: VariableExpenseItem[] = [];

export const DEFAULT_SAVINGS: SavingItem[] = [];

export const DEFAULT_SUBSCRIPTIONS: SubscriptionItem[] = [];

export const DEFAULT_DAILY_EXPENSES: DailyExpenseItem[] = [];

export const THEME_PRESETS: Record<string, {
  id: string;
  name: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  surface: string;
  background: string;
  border: string;
  badgeBg: string;
  accent: string;
}> = {
  SHARK_BLUE: {
    id: 'SHARK_BLUE',
    name: 'Pastel Shark Blue',
    primary: '#6599B8',
    primaryLight: '#D6EAF8',
    primaryDark: '#214761',
    surface: '#F0F7FB',
    background: '#F6FAFD',
    border: '#CBE5F7',
    badgeBg: '#E1F0FA',
    accent: '#3B82F6'
  },
  SWEET_ROSE: {
    id: 'SWEET_ROSE',
    name: 'Pastel Sakura Rose',
    primary: '#E58A9F',
    primaryLight: '#FFE3E8',
    primaryDark: '#6E2338',
    surface: '#FFF2F5',
    background: '#FFF8FA',
    border: '#FFD1DC',
    badgeBg: '#FFE5EC',
    accent: '#EC4899'
  },
  MINT_SAGE: {
    id: 'MINT_SAGE',
    name: 'Pastel Mint Matcha',
    primary: '#4FA87F',
    primaryLight: '#D6F2E2',
    primaryDark: '#194530',
    surface: '#EEF8F3',
    background: '#F5FAF7',
    border: '#C0E9D3',
    badgeBg: '#DCF4E7',
    accent: '#10B981'
  },
  LAVENDER_DREAM: {
    id: 'LAVENDER_DREAM',
    name: 'Pastel Cloud Lilac',
    primary: '#9A86E9',
    primaryLight: '#EBE5FC',
    primaryDark: '#3D2A7A',
    surface: '#F4F0FF',
    background: '#FAF8FF',
    border: '#DDD2FA',
    badgeBg: '#ECE4FE',
    accent: '#8B5CF6'
  },
  SUNSET_PEACH: {
    id: 'SUNSET_PEACH',
    name: 'Pastel Sunset Apricot',
    primary: '#E78C4E',
    primaryLight: '#FFE7D6',
    primaryDark: '#6B3714',
    surface: '#FFF4EB',
    background: '#FFFAF5',
    border: '#FFD7BC',
    badgeBg: '#FFEAD8',
    accent: '#F97316'
  },
  HONEY_BUTTER: {
    id: 'HONEY_BUTTER',
    name: 'Pastel Honey Buttercup',
    primary: '#D4A017',
    primaryLight: '#FFF6D1',
    primaryDark: '#5E4403',
    surface: '#FFFDF0',
    background: '#FFFEF8',
    border: '#FDECB0',
    badgeBg: '#FFF8D9',
    accent: '#EAB308'
  },
  OCEAN_BREEZE: {
    id: 'OCEAN_BREEZE',
    name: 'Pastel Ocean Mist',
    primary: '#43A4B8',
    primaryLight: '#D3F4FA',
    primaryDark: '#124855',
    surface: '#EBF9FC',
    background: '#F4FCFE',
    border: '#BFEBF4',
    badgeBg: '#D8F6FC',
    accent: '#06B6D4'
  },
  DARK_SLATE: {
    id: 'DARK_SLATE',
    name: 'Pastel Midnight Slate',
    primary: '#7E8CE0',
    primaryLight: '#2A3447',
    primaryDark: '#F1F5F9',
    surface: '#1E293B',
    background: '#0F172A',
    border: '#334155',
    badgeBg: '#1E293B',
    accent: '#818CF8'
  }
};
