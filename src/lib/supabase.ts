import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from Vite / Next.js environment variables or localStorage override
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
    // Return simulated success if offline demo
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
    // Offline simulation mode
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

// 3. Fetch user transactions from Supabase
export async function fetchUserTransactions(userId: string): Promise<SupabaseTransaction[]> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured || !userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch transactions warning:', error.message);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      amount: Number(row.amount) || 0,
      type: row.type as 'INCOME' | 'EXPENSE',
      category: row.category || 'Umum',
      wallet_name: row.wallet_name || 'Uang Cash',
      date: row.date || new Date().toLocaleDateString('id-ID'),
      notes: row.notes,
      created_at: row.created_at
    }));
  } catch (err) {
    console.error('Error fetching Supabase transactions:', err);
    return [];
  }
}

// 4. Insert transaction to Supabase
export async function insertUserTransaction(tx: Omit<SupabaseTransaction, 'id' | 'created_at'>): Promise<SupabaseTransaction | null> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured || !tx.user_id) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: tx.user_id,
          title: tx.title,
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          wallet_name: tx.wallet_name,
          date: tx.date,
          notes: tx.notes
        }
      ])
      .select()
      .single();

    if (error) {
      console.warn('Supabase insert error:', error.message);
      return null;
    }

    return data as SupabaseTransaction;
  } catch (err) {
    console.error('Error inserting transaction:', err);
    return null;
  }
}

// 5. Delete transaction from Supabase
export async function deleteUserTransaction(id: string, userId: string): Promise<boolean> {
  const currentConfig = getSupabaseConfig();
  if (!currentConfig.isConfigured || !userId) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase delete error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error deleting transaction:', err);
    return false;
  }
}
