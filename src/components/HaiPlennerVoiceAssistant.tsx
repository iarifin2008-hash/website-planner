import React, { useState } from 'react';
import { WalletItem } from '../types';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  Bot, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  Wallet
} from 'lucide-react';

interface HaiPlennerVoiceAssistantProps {
  wallets: WalletItem[];
  userName: string;
  theme: any;
  isIphone?: boolean;
  onAutoAddTransaction: (params: {
    title: string;
    amount: number;
    category: string;
    walletName: string;
    type: 'EXPENSE' | 'INCOME' | 'SAVING';
  }) => void;
}

export const HaiPlennerVoiceAssistant: React.FC<HaiPlennerVoiceAssistantProps> = ({
  wallets,
  userName,
  theme,
  isIphone = false,
  onAutoAddTransaction
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState<string | null>(null);
  const [parsedCard, setParsedCard] = useState<any | null>(null);

  const sampleCommands = [
    "Beli Kopi Kenangan 24000 pake Uang Cash",
    "Beli Bensin Pertamax 35000 pake GoPay",
    "Makan siang Nasi Padang 28000 dari Saldo DANA",
    "Gaji freelance web 1000000 masuk Saldo Rekening BCA"
  ];

  const handleParseText = (textToParse: string) => {
    const text = textToParse.toLowerCase();
    
    // Extract numbers
    const numberMatch = text.match(/\d+[\d\.]*/g);
    let extractedAmount = 0;
    if (numberMatch && numberMatch.length > 0) {
      extractedAmount = Number(numberMatch[0].replace(/\./g, ''));
    }

    // Match wallet accurately
    let targetWallet = wallets[0]?.name || 'Uang Cash';
    if (text.includes('dana')) {
      targetWallet = wallets.find(w => w.name.toLowerCase().includes('dana'))?.name || 'Saldo DANA';
    } else if (text.includes('bca') || text.includes('bank')) {
      targetWallet = wallets.find(w => w.name.toLowerCase().includes('bca') || w.type === 'BANK')?.name || 'Saldo Rekening BCA';
    } else if (text.includes('gopay') || text.includes('go-pay')) {
      targetWallet = wallets.find(w => w.name.toLowerCase().includes('gopay'))?.name || 'GoPay';
    } else if (text.includes('shopee') || text.includes('shopeepay')) {
      targetWallet = wallets.find(w => w.name.toLowerCase().includes('shopee'))?.name || 'ShopeePay';
    } else if (text.includes('cash') || text.includes('tunai')) {
      targetWallet = wallets.find(w => w.type === 'CASH' || w.name.toLowerCase().includes('cash'))?.name || 'Uang Cash';
    }

    // Detect type and category
    const isIncome = text.includes('gaji') || text.includes('masuk') || text.includes('bonus') || text.includes('dapat');
    const isSaving = text.includes('nabung') || text.includes('investasi') || text.includes('darurat');
    
    let category = 'Jajan';
    if (text.includes('makan') || text.includes('nasi') || text.includes('resto') || text.includes('ayam') || text.includes('mie')) category = 'Makan';
    else if (text.includes('bensin') || text.includes('gojek') || text.includes('grab') || text.includes('transport') || text.includes('tol')) category = 'Transport';
    else if (text.includes('kopi') || text.includes('snack') || text.includes('boba') || text.includes('dimsum')) category = 'Jajan';
    else if (text.includes('belanja') || text.includes('supermarket') || text.includes('indomaret') || text.includes('alfamart')) category = 'Belanja';

    // Title cleanup
    let title = textToParse
      .replace(/beli|makan|bayar|isi|pake|dari|masuk|ke|rp|\d+/gi, '')
      .trim();
    if (!title) title = isIncome ? 'Pemasukan Otomatis' : 'Pengeluaran Cepat';

    if (extractedAmount > 0) {
      const parsed = {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        amount: extractedAmount,
        category,
        walletName: targetWallet,
        type: (isIncome ? 'INCOME' : isSaving ? 'SAVING' : 'EXPENSE') as 'INCOME' | 'SAVING' | 'EXPENSE'
      };
      setParsedCard(parsed);
      setAssistantResponse(`Siap ${userName || 'Sobat'}! Terdeteksi transaksi "${parsed.title}" sebesar Rp ${parsed.amount.toLocaleString('id-ID')} memotong kas ${parsed.walletName}.`);
    } else {
      setAssistantResponse(`Nominal belum terbaca jelas, ${userName || 'Sobat'}. Contoh: 'Beli Kopi 25000 pake Saldo DANA'`);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulate listening recognition with voice sample
      setTimeout(() => {
        setIsListening(false);
        const randomSample = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
        setInputText(randomSample);
        handleParseText(randomSample);
      }, 1400);
    }
  };

  const handleConfirmAdd = () => {
    if (!parsedCard) return;
    onAutoAddTransaction(parsedCard);
    setParsedCard(null);
    setAssistantResponse(`Berhasil dicatat! Saldo ${parsedCard.walletName} telah dipotong otomatis.`);
    setInputText('');
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: theme.primary }}
          >
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <span>Asisten Suara "Hai Plenner"</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500">
              Halo <strong className="text-slate-800">{userName || 'Sobat Cuan'}</strong>, ketik atau sebutkan pengeluaran untuk memotong saldo kas otomatis.
            </p>
          </div>
        </div>
      </div>

      {/* Input box */}
      <div className="space-y-3">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Contoh: Beli Kopi Kenangan 24000 pake Uang Cash..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleParseText(inputText)}
            className="w-full bg-slate-50 border border-slate-300 rounded-2xl py-3 pl-4 pr-24 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition font-medium"
          />

          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={`p-2 rounded-xl text-xs transition cursor-pointer ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
              title="Aktifkan Asisten Suara"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => handleParseText(inputText)}
              className="p-2 rounded-xl text-xs font-bold text-white shadow-xs transition cursor-pointer"
              style={{ backgroundColor: theme.primary }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          <span className="font-semibold">Coba cepat:</span>
          {sampleCommands.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(sample);
                handleParseText(sample);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition cursor-pointer"
            >
              "{sample}"
            </button>
          ))}
        </div>

        {/* Assistant Response Box */}
        {assistantResponse && (
          <div className="p-3.5 bg-sky-50/80 border border-sky-200/80 rounded-2xl text-xs text-sky-900 flex items-start gap-2.5 animate-fadeIn">
            <Bot className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium leading-relaxed">{assistantResponse}</p>
              
              {/* Confirm Parsed Card */}
              {parsedCard && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-sky-200 flex flex-wrap items-center justify-between gap-2 shadow-xs">
                  <div>
                    <span className="font-bold text-slate-800">{parsedCard.title}</span>
                    <div className="text-[11px] text-slate-500">
                      Kategori: <strong className="text-slate-700">{parsedCard.category}</strong> • Kas: <strong className="text-sky-600">{parsedCard.walletName}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-rose-600 text-sm">
                      - Rp {parsedCard.amount.toLocaleString('id-ID')}
                    </span>
                    <button
                      type="button"
                      onClick={handleConfirmAdd}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1 cursor-pointer"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Simpan & Potong Kas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
