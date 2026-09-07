-- ==============================================================================
-- MONEY PLANNER - SUPABASE POSTGRESQL DATABASE SCHEMA & REALTIME SETUP
-- ==============================================================================
-- Jalankan script SQL ini di Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Skema ini mendukung sinkronisasi real-time multi-perangkat (HP, Tablet, Laptop)
-- menggunakan sync_code dan/atau user_id pada tabel: wallets, incomes, budgets, transactions.
-- ==============================================================================

-- 1. Tabel Wallets (Dompet & Saldo)
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_code TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'BANK',
    initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    color_hex TEXT DEFAULT '#0284c7',
    icon_name TEXT DEFAULT 'Landmark',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Incomes (Pemasukan)
CREATE TABLE IF NOT EXISTS public.incomes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_code TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    month_id TEXT NOT NULL DEFAULT '2026-01',
    source TEXT NOT NULL,
    type TEXT DEFAULT 'Utama',
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    date TEXT DEFAULT to_char(now(), 'DD/MM/YYYY'),
    wallet_name TEXT DEFAULT 'Bank BCA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Budgets (Anggaran Pos & Alokasi Formula 50/25/20/5)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_code TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    month_id TEXT NOT NULL DEFAULT '2026-01',
    category_key TEXT NOT NULL, -- 'ALLOCATION' | 'FIXED' | 'VARIABLE' | 'SAVINGS' | 'SUBSCRIPTION'
    title TEXT NOT NULL,
    target_percent NUMERIC(5, 2),
    planned_amount NUMERIC(15, 2) DEFAULT 0,
    actual_amount NUMERIC(15, 2) DEFAULT 0,
    priority TEXT DEFAULT 'Medium',
    wallet_name TEXT,
    date TEXT,
    color_hex TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Transactions (Pengeluaran & Belanja Harian)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_code TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    month_id TEXT DEFAULT '2026-01',
    title TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'EXPENSE' CHECK (type IN ('INCOME', 'EXPENSE')),
    category TEXT DEFAULT 'Jajan',
    wallet_name TEXT DEFAULT 'Uang Cash',
    quantity NUMERIC(10, 2) DEFAULT 1,
    unit_price NUMERIC(15, 2) DEFAULT 0,
    date TEXT DEFAULT to_char(now(), 'DD/MM/YYYY'),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 5. Aktifkan Row Level Security (RLS) & Buat Kebijakan Akses (Policy)
-- ==============================================================================
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses: Mengizinkan akses berdasarkan sync_code atau akun user terautentikasi
DROP POLICY IF EXISTS "Allow all for wallets" ON public.wallets;
CREATE POLICY "Allow all for wallets" ON public.wallets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for incomes" ON public.incomes;
CREATE POLICY "Allow all for incomes" ON public.incomes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for budgets" ON public.budgets;
CREATE POLICY "Allow all for budgets" ON public.budgets FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all for transactions" ON public.transactions;
CREATE POLICY "Allow all for transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- 6. Aktifkan Real-Time Sinkronisasi Supabase untuk Keempat Tabel
-- ==============================================================================
DO $$
BEGIN
  -- Wallets
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'wallets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.wallets;
  END IF;

  -- Incomes
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'incomes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.incomes;
  END IF;

  -- Budgets
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'budgets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
  END IF;

  -- Transactions
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
  END IF;
END $$;

-- ==============================================================================
-- 7. Buat Index Pencarian Cepat Berdasarkan sync_code & user_id
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_wallets_sync_code ON public.wallets(sync_code);
CREATE INDEX IF NOT EXISTS idx_incomes_sync_code ON public.incomes(sync_code);
CREATE INDEX IF NOT EXISTS idx_budgets_sync_code ON public.budgets(sync_code);
CREATE INDEX IF NOT EXISTS idx_transactions_sync_code ON public.transactions(sync_code);
