import { createClient } from '@supabase/supabase-js';
import { 
  WalletItem, 
  IncomeItem, 
  DailyExpenseItem, 
  BudgetPlanAllocation, 
  FixedExpenseItem, 
  VariableExpenseItem, 
  SavingItem, 
  SubscriptionItem 
} from '../types';

// Get Supabase credentials from Vite environment variables or localStorage override
export const getSupabaseConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('mp_supabase_url') || '' : '';
  const localAnonKey = typeof window !== 'undefined' ? localStorage.getItem('mp_supabase_anon_key') || '' : '';

  const url = (envUrl || localUrl).trim();
  const anonKey = (envAnonKey || localAnonKey).trim();

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey && url.startsWith('http'))
  };
};

const config = getSupabaseConfig();

// Create Supabase Client instance (with fallback placeholder to avoid runtime crash before configuration)
const dummyUrl = 'https://placeholder.supabase.co';
const dummyAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const supabase = createClient(
  config.isConfigured ? config.url : dummyUrl,
  config.isConfigured ? config.anonKey : dummyAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Helper for generating standard UUID v4
export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Helper to test if a string is a valid UUID
export function isValidUuid(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

export interface SupabaseTransaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  wallet_name: string;
  date: string;
  notes?: string;
  created_at?: string;
}

// 1. Send Email OTP verification code
export async function requestEmailOtp(email: string) {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) {
    return { 
      data: null, 
      error: null, 
      isSimulated: true, 
      message: 'Mode Simulasi (Masukkan kunci Supabase di .env atau Pengaturan untuk email riil)' 
    };
  }

  const result = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
    }
  });

  return { ...result, isSimulated: false };
}

// 2. Verify Email OTP token
export async function verifyEmailOtp(email: string, token: string) {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) {
    return {
      data: {
        user: {
          id: 'demo-user-' + email.replace(/[^a-zA-Z0-9]/g, ''),
          email: email,
          user_metadata: { name: email.split('@')[0] }
        },
        session: { access_token: 'demo-token' }
      },
      error: null,
      isSimulated: true
    };
  }

  const result = await supabase.auth.verifyOtp({
    email,
    token: token.trim(),
    type: 'email'
  });

  return { ...result, isSimulated: false };
}

// Helper to resolve effective user ID from arguments or Supabase Auth session
export async function resolveEffectiveUserId(param1?: string, param2?: string): Promise<string | null> {
  if (param2 && isValidUuid(param2)) return param2;
  if (param1 && isValidUuid(param1)) return param1;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id && isValidUuid(session.user.id)) return session.user.id;
  } catch (e) {}
  return null;
}

// ==============================================================================
// 3. TABEL: WALLETS (DOMPET & SALDO)
// ==============================================================================
export async function fetchWalletsFromSupabase(param1?: string, param2?: string): Promise<WalletItem[]> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) {
    return [];
  }

  const userId = await resolveEffectiveUserId(param1, param2);

  try {
    let query = supabase.from('wallets').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) {
      console.warn('Supabase fetch wallets error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: String(row.id),
      name: row.name || 'Dompet',
      type: row.type || 'BANK',
      initialBalance: Number(row.initial_balance ?? row.initialBalance ?? row.current_balance ?? row.balance ?? 0),
      balance: Number(row.current_balance ?? row.balance ?? row.initial_balance ?? 0),
      colorHex: row.color_hex ?? row.colorHex ?? '#0284c7',
      iconName: row.icon_name ?? row.iconName ?? 'Landmark',
      isDefault: Boolean(row.is_default ?? row.isDefault)
    }));
  } catch (err) {
    console.error('Error fetching wallets from Supabase:', err);
    return [];
  }
}

export async function saveAllWalletsToSupabase(wallets: WalletItem[], param1?: string, param2?: string): Promise<boolean> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) {
    return false;
  }

  const userId = await resolveEffectiveUserId(param1, param2);

  try {
    const buildPayload = (balanceCol: 'current_balance' | 'balance') => wallets.map(w => {
      const row: any = {
        id: isValidUuid(w.id) ? w.id : generateUuid(),
        user_id: userId || null,
        name: w.name,
        type: w.type,
        updated_at: new Date().toISOString()
      };
      if (balanceCol === 'current_balance') {
        row.current_balance = Number(w.balance) || 0;
      } else {
        row.balance = Number(w.balance) || 0;
      }
      if (w.initialBalance !== undefined) row.initial_balance = Number(w.initialBalance) || 0;
      if (w.colorHex) row.color_hex = w.colorHex;
      if (w.iconName) row.icon_name = w.iconName;
      if (w.isDefault !== undefined) row.is_default = Boolean(w.isDefault);
      return row;
    });

    // Coba simpan dengan kolom current_balance (sesuai schema database)
    let { error } = await supabase.from('wallets').upsert(buildPayload('current_balance'));
    
    // Jika kolom current_balance tidak ada di tabel, coba fallback ke 'balance'
    if (error && (error.message.includes('current_balance') || error.code === 'PGRST204' || error.message.includes('column'))) {
      const retryResult = await supabase.from('wallets').upsert(buildPayload('balance'));
      error = retryResult.error;
    }

    if (error) {
      console.warn('Supabase save wallets error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving wallets to Supabase:', err);
    return false;
  }
}

// ==============================================================================
// 4. TABEL: INCOMES (PEMASUKAN)
// ==============================================================================
export async function fetchIncomesFromSupabase(param1?: string, param2?: string, monthId?: string): Promise<IncomeItem[]> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) {
    return [];
  }

  const userId = await resolveEffectiveUserId(param1, param2);

  try {
    let query = supabase.from('incomes').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (monthId) {
      query = query.eq('month_id', monthId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetch incomes error:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: String(row.id),
      monthId: row.month_id ?? row.monthId ?? '2026-01',
      source: row.source || row.title || 'Pemasukan',
      type: (row.type as any) || 'Utama',
      amount: Number(row.amount) || 0,
      date: row.date || new Date().toLocaleDateString('id-ID'),
      walletName: row.wallet_name ?? row.walletName ?? 'Bank BCA'
    }));
  } catch (err) {
    console.error('Error fetching incomes from Supabase:', err);
    return [];
  }
}

export async function insertIncomeToSupabase(
  income: Omit<IncomeItem, 'id'> & { id?: string },
  param1?: string,
  param2?: string
): Promise<IncomeItem | null> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) {
    return null;
  }

  const userId = await resolveEffectiveUserId(param1, param2);

  try {
    const validId = isValidUuid(income.id) ? income.id : generateUuid();
    const payload = {
      id: validId,
      user_id: userId || null,
      month_id: income.monthId || '2026-01',
      source: income.source,
      type: income.type,
      amount: Number(income.amount) || 0,
      date: income.date || new Date().toLocaleDateString('id-ID'),
      wallet_name: income.walletName || 'Bank BCA'
    };

    const { data, error } = await supabase.from('incomes').insert([payload]).select().single();
    if (error) {
      console.warn('Supabase insert income error:', error.message);
      return null;
    }

    return {
      id: String(data.id),
      monthId: data.month_id,
      source: data.source,
      type: data.type,
      amount: Number(data.amount) || 0,
      date: data.date,
      walletName: data.wallet_name
    };
  } catch (err) {
    console.error('Error inserting income to Supabase:', err);
    return null;
  }
}

export async function deleteIncomeFromSupabase(id: string, param1?: string, param2?: string): Promise<boolean> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) return false;

  try {
    let query = supabase.from('incomes').delete().eq('id', id);
    const userId = await resolveEffectiveUserId(param1, param2);
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) {
      console.warn('Supabase delete income error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error deleting income from Supabase:', err);
    return false;
  }
}

// ==============================================================================
// 5. TABEL: TRANSACTIONS (PENGELUARAN / JAJAN HARIAN)
// ==============================================================================
export async function fetchTransactionsFromSupabase(param1?: string, param2?: string, monthId?: string): Promise<DailyExpenseItem[]> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) {
    return [];
  }

  const userId = await resolveEffectiveUserId(param1, param2);

  try {
    let query = supabase.from('transactions').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (monthId) {
      query = query.eq('month_id', monthId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase fetch transactions error:', error.message);
      return [];
    }

    return (data || [])
      .filter((row: any) => row.type === 'EXPENSE' || !row.type)
      .map((row: any) => ({
        id: String(row.id),
        monthId: row.month_id ?? row.monthId ?? '2026-01',
        date: row.date || new Date().toLocaleDateString('id-ID'),
        title: row.title || 'Pengeluaran',
        category: row.category || 'Jajan',
        quantity: Number(row.quantity || 1),
        unitPrice: Number(row.unit_price || row.unitPrice || row.amount || 0),
        totalAmount: Number(row.amount || 0),
        notes: row.notes || '',
        walletName: row.wallet_name ?? row.walletName ?? 'Uang Cash'
      }));
  } catch (err) {
    console.error('Error fetching transactions from Supabase:', err);
    return [];
  }
}

export async function insertTransactionToSupabase(
  tx: Omit<DailyExpenseItem, 'id'> & { id?: string },
  param1?: string,
  param2?: string
): Promise<DailyExpenseItem | null> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) {
    return null;
  }

  const userId = await resolveEffectiveUserId(param1, param2);

  try {
    const validId = isValidUuid(tx.id) ? tx.id : generateUuid();
    const payload = {
      id: validId,
      user_id: userId || null,
      month_id: tx.monthId || '2026-01',
      title: tx.title,
      amount: Number(tx.totalAmount) || 0,
      type: 'EXPENSE',
      category: tx.category || 'Jajan',
      wallet_name: tx.walletName || 'Uang Cash',
      quantity: Number(tx.quantity) || 1,
      unit_price: Number(tx.unitPrice) || Number(tx.totalAmount) || 0,
      date: tx.date || new Date().toLocaleDateString('id-ID'),
      notes: tx.notes || ''
    };

    const { data, error } = await supabase.from('transactions').insert([payload]).select().single();
    if (error) {
      console.warn('Supabase insert transaction error:', error.message);
      return null;
    }

    return {
      id: String(data.id),
      monthId: data.month_id,
      date: data.date,
      title: data.title,
      category: data.category,
      quantity: Number(data.quantity || 1),
      unitPrice: Number(data.unit_price || data.amount),
      totalAmount: Number(data.amount),
      notes: data.notes,
      walletName: data.wallet_name
    };
  } catch (err) {
    console.error('Error inserting transaction to Supabase:', err);
    return null;
  }
}

export async function deleteTransactionFromSupabase(id: string, param1?: string, param2?: string): Promise<boolean> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) return false;

  try {
    let query = supabase.from('transactions').delete().eq('id', id);
    const userId = await resolveEffectiveUserId(param1, param2);
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) {
      console.warn('Supabase delete transaction error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error deleting transaction from Supabase:', err);
    return false;
  }
}

// ==============================================================================
// 6. TABEL: BUDGETS (ANGGARAN POS & ALOKASI)
// ==============================================================================
export interface BudgetsFetchResult {
  allocations: BudgetPlanAllocation[];
  fixed: FixedExpenseItem[];
  variable: VariableExpenseItem[];
  savings: SavingItem[];
  subscriptions: SubscriptionItem[];
}

export async function fetchBudgetsFromSupabase(param1?: string, param2?: string, monthId?: string): Promise<BudgetsFetchResult> {
  const currentConfig = getSupabaseConfig();
  const emptyResult: BudgetsFetchResult = {
    allocations: [],
    fixed: [],
    variable: [],
    savings: [],
    subscriptions: []
  };

  if (!currentConfig.isConfigured) {
    return emptyResult;
  }

  const userId = await resolveEffectiveUserId(param1, param2);

  try {
    let query = supabase.from('budgets').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (monthId) {
      query = query.eq('month_id', monthId);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) {
      console.warn('Supabase fetch budgets error:', error.message);
      return emptyResult;
    }

    const allocations: BudgetPlanAllocation[] = [];
    const fixed: FixedExpenseItem[] = [];
    const variable: VariableExpenseItem[] = [];
    const savings: SavingItem[] = [];
    const subscriptions: SubscriptionItem[] = [];

    (data || []).forEach((row: any) => {
      const cat = (row.category_key || '').toUpperCase();
      const mId = row.month_id || '2026-01';

      if (cat === 'ALLOCATION') {
        allocations.push({
          id: String(row.id),
          monthId: mId,
          categoryKey: row.priority as any || 'FIXED',
          title: row.title || 'Pos Anggaran',
          targetPercent: Number(row.target_percent || 0),
          colorHex: row.color_hex || '#0284c7'
        });
      } else if (cat === 'FIXED') {
        fixed.push({
          id: String(row.id),
          monthId: mId,
          title: row.title || 'Biaya Tetap',
          priority: row.priority || 'High',
          plannedAmount: Number(row.planned_amount || 0),
          actualAmount: Number(row.actual_amount || 0),
          date: row.date || new Date().toLocaleDateString('id-ID'),
          walletName: row.wallet_name || 'Bank BCA'
        });
      } else if (cat === 'VARIABLE') {
        variable.push({
          id: String(row.id),
          monthId: mId,
          title: row.title || 'Biaya Variabel',
          priority: row.priority || 'Medium',
          plannedAmount: Number(row.planned_amount || 0),
          actualAmount: Number(row.actual_amount || 0),
          date: row.date || new Date().toLocaleDateString('id-ID'),
          walletName: row.wallet_name || 'Bank BCA'
        });
      } else if (cat === 'SAVINGS') {
        savings.push({
          id: String(row.id),
          monthId: mId,
          title: row.title || 'Tabungan',
          priority: row.priority || 'High',
          plannedAmount: Number(row.planned_amount || 0),
          actualAmount: Number(row.actual_amount || 0),
          targetTotal: Number(row.target_percent || 0), // fallback target
          date: row.date || new Date().toLocaleDateString('id-ID'),
          walletName: row.wallet_name || 'Tabungan'
        });
      } else if (cat === 'SUBSCRIPTION') {
        subscriptions.push({
          id: String(row.id),
          monthId: mId,
          title: row.title || 'Langganan',
          priority: row.priority || 'Medium',
          plannedAmount: Number(row.planned_amount || 0),
          actualAmount: Number(row.actual_amount || 0),
          date: row.date || new Date().toLocaleDateString('id-ID'),
          walletName: row.wallet_name || 'Bank BCA'
        });
      }
    });

    return { allocations, fixed, variable, savings, subscriptions };
  } catch (err) {
    console.error('Error fetching budgets from Supabase:', err);
    return emptyResult;
  }
}

export async function saveBudgetItemToSupabase(
  item: any,
  categoryKey: 'ALLOCATION' | 'FIXED' | 'VARIABLE' | 'SAVINGS' | 'SUBSCRIPTION',
  param1?: string,
  param2?: string
): Promise<boolean> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) return false;

  const userId = await resolveEffectiveUserId(param1, param2);

  try {
    const validId = isValidUuid(item.id) ? item.id : generateUuid();
    const payload = {
      id: validId,
      user_id: userId || null,
      month_id: item.monthId || '2026-01',
      category_key: categoryKey,
      title: item.title || 'Pos Anggaran',
      target_percent: categoryKey === 'ALLOCATION' ? Number(item.targetPercent || 0) : (Number(item.targetTotal) || 0),
      planned_amount: Number(item.plannedAmount || 0),
      actual_amount: Number(item.actualAmount || 0),
      priority: categoryKey === 'ALLOCATION' ? item.categoryKey : (item.priority || 'Medium'),
      wallet_name: item.walletName || null,
      date: item.date || new Date().toLocaleDateString('id-ID'),
      color_hex: item.colorHex || null
    };

    const { error } = await supabase.from('budgets').upsert([payload]);
    if (error) {
      console.warn('Supabase save budget error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error saving budget item to Supabase:', err);
    return false;
  }
}

export async function deleteBudgetItemFromSupabase(id: string, param1?: string, param2?: string): Promise<boolean> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured) return false;

  try {
    let query = supabase.from('budgets').delete().eq('id', id);
    const userId = await resolveEffectiveUserId(param1, param2);
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) {
      console.warn('Supabase delete budget error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error deleting budget item from Supabase:', err);
    return false;
  }
}

// Legacy fallback methods to maintain backward compatibility
export async function fetchUserTransactions(userId: string): Promise<SupabaseTransaction[]> {
  return [];
}
export async function insertUserTransaction(tx: any): Promise<any> {
  return null;
}
export async function deleteUserTransaction(id: string, userId: string): Promise<boolean> {
  return false;
}
