import React, { useState } from 'react';
import { UserProfile, WalletItem } from '../types';
import { THEME_PRESETS } from '../defaultData';
import { 
  Settings, 
  Palette, 
  Lock, 
  LogOut, 
  X, 
  Check, 
  Key, 
  Smartphone, 
  Sparkles, 
  ShieldCheck,
  User,
  Monitor,
  Tablet,
  Phone,
  Wallet,
  Layers,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  wallets?: WalletItem[];
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
  onOpenSyncModal?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  wallets = [],
  onUpdateProfile,
  onLogout,
  onOpenSyncModal
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.name);
  const [pin, setPin] = useState(profile.pin);
  const [isPinEnabled, setIsPinEnabled] = useState(profile.isPinEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedDeviceMode = profile.deviceViewMode || 'WINDOWS';

  const handleSelectDeviceMode = (mode: 'WINDOWS' | 'ANDROID_TABLET' | 'IPHONE') => {
    onUpdateProfile({
      ...profile,
      deviceViewMode: mode
    });
  };

  const handleSelectTheme = (themeKey: string) => {
    onUpdateProfile({
      ...profile,
      themePreset: themeKey
    });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: name.trim() || 'Sobat Cuan',
      pin: pin.trim() || '1234',
      isPinEnabled
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const currentTheme = THEME_PRESETS[profile.themePreset] || THEME_PRESETS.SHARK_BLUE;

  // Calculate total initial capital for the info section
  const totalModalAwal = wallets.reduce((acc, w) => acc + (w.initialBalance || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: currentTheme.primary }}
            >
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Pengaturan Tampilan & Akun
              </h3>
              <p className="text-xs text-slate-500">
                Kustomisasi antarmuka perangkat, tema pastel, dan sinkronisasi
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Section 1: Mode Tampilan Antarmuka (3 Pilihan) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-sky-600" />
                <span>Pilihan Mode Tampilan Antarmuka</span>
              </label>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                3 Pilihan Perangkat
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Web Windows */}
              <button
                type="button"
                onClick={() => handleSelectDeviceMode('WINDOWS')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedDeviceMode === 'WINDOWS'
                    ? 'border-sky-500 bg-white ring-2 ring-sky-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <Monitor className="w-4 h-4" />
                  </div>
                  {selectedDeviceMode === 'WINDOWS' && (
                    <Check className="w-4 h-4 text-sky-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Web Windows</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Desktop Luas & Rinci</div>
                </div>
              </button>

              {/* Option 2: Web Tablet Android */}
              <button
                type="button"
                onClick={() => handleSelectDeviceMode('ANDROID_TABLET')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedDeviceMode === 'ANDROID_TABLET'
                    ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Tablet className="w-4 h-4" />
                  </div>
                  {selectedDeviceMode === 'ANDROID_TABLET' && (
                    <Check className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Web Tablet Android</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Grid Tablet Proporsional</div>
                </div>
              </button>

              {/* Option 3: Web iPhone */}
              <button
                type="button"
                onClick={() => handleSelectDeviceMode('IPHONE')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedDeviceMode === 'IPHONE'
                    ? 'border-violet-500 bg-white ring-2 ring-violet-500/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  {selectedDeviceMode === 'IPHONE' && (
                    <Check className="w-4 h-4 text-violet-600" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">Web iPhone</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Mobile Frame & Dock</div>
                </div>
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500 mt-2.5">
              💡 Anda dapat mengubah tampilan kapan saja untuk menyesuaikan kenyamanan saat membuka aplikasi di laptop Windows, tablet Android, maupun smartphone iPhone.
            </p>
          </div>

          {/* Section 2: Tema Warna Pastel (Pusat Pengaturan Tema) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-sky-600" />
                <span>Pusat Tema Warna Pastel (8 Pilihan)</span>
              </label>
              <span className="text-[11px] font-medium text-slate-500">
                Tema aktif: <strong className="text-slate-800">{currentTheme.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(THEME_PRESETS).map(([key, t]) => {
                const isSelected = profile.themePreset === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectTheme(key)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-slate-800 ring-2 ring-slate-800/10 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    style={{ backgroundColor: t.surface }}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span 
                        className="w-4 h-4 rounded-full border border-white/80 shadow-xs"
                        style={{ backgroundColor: t.primary }}
                      />
                      {isSelected && <Check className="w-3.5 h-3.5 text-slate-800" />}
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800 truncate">
                      {t.name.replace('Pastel ', '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Informasi Modal Awal Kas & Sinkronisasi */}
          <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-sky-700" />
                <span className="text-xs font-bold text-slate-800">
                  Sinkronisasi Modal Awal Kas
                </span>
              </div>
              {onOpenSyncModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSyncModal();
                  }}
                  className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Buka Menu Sync</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Modal awal kas tersimpan di dalam masing-masing rekening/dompet dan otomatis ikut disinkronkan saat Anda melakukan ekspor atau menghubungkan kode akun.
            </p>

            <div className="bg-white/90 p-2.5 rounded-xl border border-sky-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 block">Total Akumulasi Modal Awal Kas Terdaftar</span>
                <span className="text-xs font-bold text-slate-800">
                  Rp {totalModalAwal.toLocaleString('id-ID')}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full border border-emerald-200">
                {wallets.length} Dompet Aktif
              </span>
            </div>
          </div>

          {/* Section 4: Profil & Identitas Akun */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Identitas & Kode Sinkronisasi</span>
              </span>
              <span className="text-[11px] text-sky-700 font-mono font-bold bg-sky-100 px-2 py-0.5 rounded-lg border border-sky-200">
                {profile.syncCode}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Nama Panggilan
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                placeholder="Masukkan nama Anda"
              />
            </div>

            {profile.email && (
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">
                  Email Terhubung
                </label>
                <div className="text-xs font-medium text-slate-700 bg-white p-2 rounded-xl border border-slate-200">
                  {profile.email}
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Keamanan PIN */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Kunci Aplikasi dengan PIN</span>
              </span>
              <input
                type="checkbox"
                checked={isPinEnabled}
                onChange={e => setIsPinEnabled(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500 cursor-pointer"
              />
            </div>

            {isPinEnabled && (
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  PIN Keamanan (4 Digit)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono tracking-widest focus:outline-none focus:border-sky-500"
                  placeholder="1234"
                />
              </div>
            )}
          </div>

          {/* Actions: Save & Logout */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
              style={{ backgroundColor: currentTheme.primary }}
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Akun / Ganti Kode</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
