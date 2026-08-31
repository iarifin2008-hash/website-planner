import React from 'react';
import { 
  FinancialOverview, 
  WalletItem, 
  AllocationCalculationResult,
  CategoryRank
} from '../types';
import { 
  PieChart as PieChartIcon, 
  BarChart3, 
  TrendingUp, 
  Award, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Wallet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';

interface MonthlyReportSectionProps {
  overview: FinancialOverview;
  wallets: WalletItem[];
  results: AllocationCalculationResult[];
  theme: any;
  isIphone?: boolean;
}

export const MonthlyReportSection: React.FC<MonthlyReportSectionProps> = ({
  overview,
  wallets,
  results,
  theme,
  isIphone = false
}) => {
  const formatRupiah = (num: number) => {
    return 'Rp ' + Math.round(num || 0).toLocaleString('id-ID');
  };

  // Pie chart data: Wallet Balances
  const walletPieData = wallets.map(w => ({
    name: w.name,
    value: Math.max(0, w.balance),
    color: w.colorHex || theme.primary
  }));

  // Bar chart data: Plan vs Actual per Allocation
  const allocationBarData = results.map(r => ({
    name: r.allocation.title.split(' ')[0],
    Rencana: r.maxAllowanceAmount,
    Realisasi: r.actualSpentAmount
  }));

  // Financial Health Score calculation
  const savingsRate = overview.savingsRatePercent;
  let healthGrade = 'Sangat Sehat (A+)';
  let healthDesc = 'Alokasi tabungan dan pengelolaan kas Anda berjalan sangat prima!';
  let healthColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';

  if (savingsRate < 10) {
    healthGrade = 'Perlu Perhatian (C)';
    healthDesc = 'Tingkatkan rasio tabungan minimal 15-20% dari pemasukan bulanan.';
    healthColor = 'text-amber-600 bg-amber-50 border-amber-200';
  } else if (savingsRate < 20) {
    healthGrade = 'Cukup Baik (B)';
    healthDesc = 'Tabungan sudah terbentuk, pertahankan agar tidak overbudget di kebutuhan variabel.';
    healthColor = 'text-sky-600 bg-sky-50 border-sky-200';
  }

  return (
    <div className="space-y-6">
      
      {/* Scorecard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Savings Rate */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Tingkat Tabungan (Savings Rate)</span>
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
              Target: 20%
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {overview.savingsRatePercent}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total tersisihkan: <strong className="text-slate-700">{formatRupiah(overview.totalSavingActual)}</strong>
          </p>
        </div>

        {/* Card 2: Health Grade */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Status Finansial</span>
            </span>
          </div>
          <div className={`text-sm font-extrabold px-2.5 py-1 rounded-xl border inline-block w-fit ${healthColor}`}>
            {healthGrade}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {healthDesc}
          </p>
        </div>

        {/* Card 3: Total Sisa Kas Bersih */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-sky-600" />
              <span>Sisa Kas Bersih Aktif</span>
            </span>
          </div>
          <div className="text-2xl font-black text-sky-700">
            {formatRupiah(overview.totalCurrentBalance)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Dari total modal awal {formatRupiah(overview.totalInitialBalance)}
          </p>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Komposisi Saldo Dompet */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-sky-600" />
            <span>Komposisi Saldo Kas Saat Ini</span>
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Distribusi sisa uang di rekening, dompet digital, dan tunai
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={walletPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {walletPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [formatRupiah(Number(val)), 'Saldo Sisa']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Perbandingan Rencana vs Realisasi Anggaran */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-sky-600" />
            <span>Perbandingan Kuota vs Realisasi Pengeluaran</span>
          </h4>
          <p className="text-xs text-slate-400 mb-4">
            Mengevaluasi pos yang sesuai target dan pos yang mendekati batas maksimal
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationBarData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis 
                  tickFormatter={val => `${val / 1000}k`}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  formatter={(val: any) => [formatRupiah(Number(val)), 'Nominal']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Bar dataKey="Rencana" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realisasi" fill={theme.primary || '#6599B8'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
