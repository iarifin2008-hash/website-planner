import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { THEME_PRESETS } from '../defaultData';
import { 
  requestEmailOtp, 
  verifyEmailOtp, 
  getSupabaseConfig 
} from '../lib/supabase';
import { 
  Wallet, 
  Smartphone, 
  User, 
  Key, 
  ArrowRight, 
  Sparkles, 
  Palette, 
  Check, 
  ShieldCheck, 
  PlayCircle, 
  Mail, 
  Lock, 
  RotateCw, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface AuthGateProps {
  profile: UserProfile;
  onLoginSuccess: (updatedProfile: UserProfile, syncCodeToLoad?: string) => void;
  onDemoLogin: () => void;
  onThemeChange?: (newThemeKey: string) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ 
  profile, 
  onLoginSuccess, 
  onDemoLogin,
  onThemeChange 
}) => {
  // Tabs: EMAIL_OTP (Supabase), SYNC_CODE, EMAIL_REGISTER
  const [authMode, setAuthMode] = useState<'EMAIL_OTP' | 'SYNC_CODE' | 'EMAIL_REGISTER'>('EMAIL_OTP');
  
  // Theme switcher on Auth screen
  const [selectedThemeKey, setSelectedThemeKey] = useState<string>(profile.themePreset || 'SHARK_BLUE');
  const activeTheme = THEME_PRESETS[selectedThemeKey] || THEME_PRESETS.SHARK_BLUE;

  // Supabase OTP States
  const [otpStep, setOtpStep] = useState<'INPUT_EMAIL' | 'INPUT_OTP'>('INPUT_EMAIL');
  const [emailInput, setEmailInput] = useState(profile.email || '');
  const [otpTokenInput, setOtpTokenInput] = useState('');
  const [nameInput, setNameInput] = useState(profile.name || '');
  const [countdown, setCountdown] = useState<number>(0);

  // Sync Code & Other Form states
  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Supabase Config Accordion & Status
  const [showConfigBox, setShowConfigBox] = useState(false);
  const [customSupabaseUrl, setCustomSupabaseUrl] = useState(() => localStorage.getItem('mp_supabase_url') || '');
  const [customSupabaseKey, setCustomSupabaseKey] = useState(() => localStorage.getItem('mp_supabase_anon_key') || '');
  const [supabaseStatus, setSupabaseStatus] = useState(() => getSupabaseConfig());

  // Handle countdown timer for OTP resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSaveCustomSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSupabaseUrl.trim()) {
      localStorage.setItem('mp_supabase_url', customSupabaseUrl.trim());
    } else {
      localStorage.removeItem('mp_supabase_url');
    }
    if (customSupabaseKey.trim()) {
      localStorage.setItem('mp_supabase_anon_key', customSupabaseKey.trim());
    } else {
      localStorage.removeItem('mp_supabase_anon_key');
    }
    setSupabaseStatus(getSupabaseConfig());
    setSuccessMsg('Kredensial Supabase berhasil disimpan.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // 1. Kirim Kode Verifikasi OTP ke Email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setInfoMsg('');

    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setErrorMsg('Harap masukkan alamat email yang valid.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestEmailOtp(email);
      setIsLoading(false);

      if (res.error) {
        setErrorMsg(`Gagal mengirim kode OTP: ${res.error.message}`);
        return;
      }

      setOtpStep('INPUT_OTP');
      setCountdown(60);
      setSuccessMsg(`Kode verifikasi OTP telah dikirim ke ${email}.`);
      if (res.isSimulated) {
        setInfoMsg('Mode Demo / Offline: Anda dapat memasukkan 6 digit angka apa saja (cth: 123456) untuk verifikasi instan.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Terjadi kendala saat mengirim email OTP.');
    }
  };

  // 2. Verifikasi Kode OTP & Masuk
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setInfoMsg('');

    const email = emailInput.trim().toLowerCase();
    const token = otpTokenInput.trim();

    if (!token || token.length < 4) {
      setErrorMsg('Harap masukkan kode OTP verifikasi dengan lengkap (6 angka).');
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyEmailOtp(email, token);
      setIsLoading(false);

      if (res.error) {
        setErrorMsg(`Verifikasi OTP gagal: ${res.error.message}`);
        return;
      }

      const user = res.data?.user;
      const derivedName = nameInput.trim() || user?.user_metadata?.name || email.split('@')[0];
      const derivedSyncCode = profile.syncCode || `CUAN-${Math.floor(1000 + Math.random() * 9000)}`;

      const updated: UserProfile = {
        ...profile,
        name: derivedName,
        email: email,
        isLoggedIn: true,
        themePreset: selectedThemeKey,
        syncCode: derivedSyncCode,
        supabaseUserId: user?.id,
        supabaseEmail: email,
        lastSyncedAt: new Date().toLocaleDateString('id-ID')
      };

      setSuccessMsg(`Verifikasi berhasil! Selamat datang, ${derivedName}.`);
      setTimeout(() => {
        onLoginSuccess(updated, derivedSyncCode);
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err?.message || 'Terjadi kesalahan saat memverifikasi kode OTP.');
    }
  };

  const handleSyncCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const code = syncCodeInput.trim().toUpperCase();
    if (!code) {
      setErrorMsg('Harap masukkan Kode Sinkronisasi dari aplikasi Android / Web Anda.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const updated: UserProfile = {
        ...profile,
        name: nameInput.trim() || profile.name || 'Sobat Cuan',
        syncCode: code,
        themePreset: selectedThemeKey,
        isLoggedIn: true,
        lastSyncedAt: new Date().toLocaleDateString('id-ID')
      };
      setSuccessMsg(`Menghubungkan akun ${code}...`);
      setTimeout(() => {
        onLoginSuccess(updated, code);
      }, 400);
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nameInput.trim()) {
      setErrorMsg('Harap masukkan nama panggilan Anda untuk sambutan personal.');
      return;
    }

    if (!emailInput.trim() || !emailInput.includes('@')) {
      setErrorMsg('Harap masukkan alamat email yang valid.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const generatedSyncCode = `CUAN-${Math.floor(1000 + Math.random() * 9000)}`;
      const updated: UserProfile = {
        ...profile,
        name: nameInput.trim(),
        email: emailInput.trim(),
        pin: pinInput || '1234',
        isPinEnabled: Boolean(pinInput),
        isLoggedIn: true,
        themePreset: selectedThemeKey,
        syncCode: generatedSyncCode,
        lastSyncedAt: new Date().toLocaleDateString('id-ID')
      };

      setSuccessMsg(`Selamat datang, ${updated.name}! Membuka perencana keuangan...`);
      setTimeout(() => {
        onLoginSuccess(updated, generatedSyncCode);
      }, 400);
    }, 400);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-6 transition-colors duration-500 font-sans"
      style={{ backgroundColor: activeTheme.background }}
    >
      {/* Main Authentication Card */}
      <div 
        className="w-full max-w-md sm:max-w-lg bg-white rounded-3xl p-5 sm:p-8 shadow-xl border relative overflow-hidden transition-all duration-300"
        style={{ borderColor: activeTheme.border }}
      >
        {/* Soft decorative background ambient blob */}
        <div 
          className="absolute -top-24 -right-24 w-56 h-56 rounded-full opacity-30 blur-3xl pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: activeTheme.primary }}
        />
        <div 
          className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: activeTheme.accent }}
        />

        {/* Brand Header */}
        <div className="text-center mb-5 relative z-10">
          <div 
            className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl text-white shadow-md mb-2 sm:mb-3 transition-transform hover:scale-105"
            style={{ backgroundColor: activeTheme.primary }}
          >
            <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center justify-center gap-2">
            <span>Money Planner</span>
            <span 
              className="text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1"
              style={{
                backgroundColor: activeTheme.badgeBg,
                borderColor: activeTheme.border,
                color: activeTheme.primaryDark
              }}
            >
              <Database className="w-3 h-3" />
              <span>Supabase Cloud</span>
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {nameInput.trim() ? (
              <span className="font-semibold text-slate-800">
                Halo <span style={{ color: activeTheme.primary }}>{nameInput.trim()}</span>! Senang bertemu denganmu 👋
              </span>
            ) : (
              'Masuk dengan OTP Email & Sinkronkan transaksi otomatis secara real-time.'
            )}
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/90 rounded-2xl mb-5 text-xs font-semibold">
          <button
            id="tab-otp-email"
            type="button"
            onClick={() => { setAuthMode('EMAIL_OTP'); setErrorMsg(''); setInfoMsg(''); }}
            className={`py-2 px-1.5 sm:px-2 rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1 ${
              authMode === 'EMAIL_OTP'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-sky-600" />
            <span className="truncate">OTP Email</span>
          </button>

          <button
            id="tab-sync-code"
            type="button"
            onClick={() => { setAuthMode('SYNC_CODE'); setErrorMsg(''); setInfoMsg(''); }}
            className={`py-2 px-1.5 sm:px-2 rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1 ${
              authMode === 'SYNC_CODE'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span className="truncate">Sync Code</span>
          </button>

          <button
            id="tab-register"
            type="button"
            onClick={() => { setAuthMode('EMAIL_REGISTER'); setErrorMsg(''); setInfoMsg(''); }}
            className={`py-2 px-1.5 sm:px-2 rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1 ${
              authMode === 'EMAIL_REGISTER'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5 text-indigo-600" />
            <span className="truncate">Lokal</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="mb-4 p-3 bg-sky-50 border border-sky-200 text-sky-800 text-xs rounded-xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-sky-600" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* TAB 1: SISTEM LOGIN OTP EMAIL (SUPABASE AUTH) */}
        {authMode === 'EMAIL_OTP' && (
          <div className="space-y-4">
            
            {/* Step 1: Input Email -> Minta Kode Verifikasi */}
            {otpStep === 'INPUT_EMAIL' ? (
              <form onSubmit={handleRequestOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Alamat Email Anda</span>
                    <span className="text-[10px] text-slate-400">Kode OTP akan dikirim ke sini</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-supabase-email"
                      type="email"
                      required
                      placeholder="contoh: nama.anda@gmail.com"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      className="w-full min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama Panggilan (Opsional)
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Misal: Arifin, Budi, Sarah"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      className="w-full min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-sky-500 transition"
                    />
                  </div>
                </div>

                <button
                  id="btn-request-otp"
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[44px] py-3 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-md hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  style={{ backgroundColor: activeTheme.primary }}
                >
                  {isLoading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Mengirim Kode OTP...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Minta Kode Verifikasi</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Step 2: Input Kotak OTP -> Tombol "Verifikasi & Masuk" */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-sky-50/70 border border-sky-200/80 rounded-2xl text-xs text-sky-900 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="block text-[11px] text-slate-500">Email Tujuan:</span>
                    <span className="font-bold truncate block">{emailInput}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setOtpStep('INPUT_EMAIL'); setErrorMsg(''); setInfoMsg(''); }}
                    className="text-[11px] text-sky-700 hover:text-sky-900 font-bold underline shrink-0 cursor-pointer"
                  >
                    Ganti Email
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Masukkan 6 Digit Kode Angka OTP</span>
                    {countdown > 0 ? (
                      <span className="text-[10px] text-slate-400 font-mono">Kirim ulang ({countdown}s)</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        className="text-[11px] text-sky-600 font-bold hover:underline cursor-pointer"
                      >
                        Kirim Ulang Kode
                      </button>
                    )}
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-otp-code"
                      type="text"
                      required
                      maxLength={8}
                      placeholder="123456"
                      value={otpTokenInput}
                      onChange={e => setOtpTokenInput(e.target.value.replace(/\s+/g, ''))}
                      className="w-full min-h-[44px] bg-slate-50 border-2 border-sky-300 rounded-xl py-2.5 pl-10 pr-4 text-center text-base sm:text-lg font-mono tracking-widest font-extrabold text-slate-900 focus:outline-none focus:bg-white focus:border-sky-600 transition"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOtpStep('INPUT_EMAIL')}
                    className="min-h-[44px] py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    id="btn-verify-otp"
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-md hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: activeTheme.primary }}
                  >
                    {isLoading ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verifikasi & Masuk</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Collapsible Supabase Status & Setup Guide */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfigBox(!showConfigBox)}
                className="w-full text-left text-[11px] text-slate-500 hover:text-slate-800 flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer"
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <Database className="w-3.5 h-3.5 text-sky-600" />
                  <span>Status Supabase: {supabaseStatus.isConfigured ? '🟢 Terhubung' : '🟡 Siap Dikonfigurasi'}</span>
                </span>
                <span className="text-[10px] font-bold text-sky-600 underline">
                  {showConfigBox ? 'Tutup' : 'Pengaturan'}
                </span>
              </button>

              {showConfigBox && (
                <form onSubmit={handleSaveCustomSupabaseConfig} className="mt-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                  <p className="text-[11px] text-slate-600">
                    Kunci Supabase dapat dimasukkan di file <code className="bg-white px-1 py-0.5 rounded border font-mono">.env</code> (Vercel) atau disimpan langsung di browser di bawah:
                  </p>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Supabase Project URL:</label>
                    <input
                      type="url"
                      placeholder="https://xxxx.supabase.co"
                      value={customSupabaseUrl}
                      onChange={e => setCustomSupabaseUrl(e.target.value)}
                      className="w-full min-h-[36px] bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Supabase Anon Key:</label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUz..."
                      value={customSupabaseKey}
                      onChange={e => setCustomSupabaseKey(e.target.value)}
                      className="w-full min-h-[36px] bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
                  >
                    Simpan Konfigurasi Supabase
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: Sync Code (Android / Multi-Device) */}
        {authMode === 'SYNC_CODE' && (
          <form onSubmit={handleSyncCodeLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Kode Sinkronisasi Akun</span>
                <span className="text-[11px] font-normal text-slate-400">Contoh: CUAN-7701</span>
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan Kode Sync Akun Anda"
                  value={syncCodeInput}
                  onChange={e => setSyncCodeInput(e.target.value.toUpperCase())}
                  className="w-full min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm font-mono tracking-wider font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-slate-800 transition uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Panggilan Anda (Opsional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Misal: Arifin, Sarah, Budi"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800 transition"
                />
              </div>
            </div>

            <button
              id="btn-submit-sync-login"
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] py-3 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-md hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ backgroundColor: activeTheme.primary }}
            >
              {isLoading ? (
                <span>Menghubungkan Akun...</span>
              ) : (
                <>
                  <span>Sinkronkan & Masuk</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: Register New Profile Lokal */}
        {authMode === 'EMAIL_REGISTER' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap / Panggilan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Nama Anda (contoh: Arifin)"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800 transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="email.anda@gmail.com"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800 transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                PIN Keamanan (Opsional)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Contoh: 1234"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full min-h-[44px] bg-slate-50 border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 focus:outline-none focus:bg-white focus:border-slate-800 transition tracking-widest font-mono font-bold"
                />
              </div>
            </div>

            <button
              id="btn-submit-register"
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[44px] py-3 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-md hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              style={{ backgroundColor: activeTheme.primary }}
            >
              {isLoading ? (
                <span>Membuat Akun...</span>
              ) : (
                <>
                  <span>Buat Akun Lokal & Mulai</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick Demo Mode 1-Click */}
        <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 text-[11px]">Ingin langsung mencoba?</span>
          <button
            id="btn-demo-mode"
            type="button"
            onClick={onDemoLogin}
            className="font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition cursor-pointer min-h-[36px]"
          >
            <PlayCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Mode Demo 1-Klik</span>
          </button>
        </div>

      </div>

      {/* Footer subtle branding */}
      <div className="mt-4 text-center text-xs text-slate-400">
        Money Planner • Supabase Auth & Real-Time Sync
      </div>
    </div>
  );
};
