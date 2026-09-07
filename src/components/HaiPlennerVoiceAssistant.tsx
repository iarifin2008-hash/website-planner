import React, { useState, useEffect, useRef } from 'react';
import { WalletItem } from '../types';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  Bot, 
  CheckCircle2, 
  HelpCircle,
  Volume2,
  X
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  const sampleCommands = [
    "Kopi kenangan 24rb uang cash",
    "Bensin pertamax 35k gopay",
    "Makan siang 28rb dana",
    "Gaji kantor 6jt rekening bca",
    "Cek saldo bca"
  ];

  // Initialize Web Speech API if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'id-ID';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleParseText(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleParseText = (textToParse: string) => {
    if (!textToParse.trim()) return;
    const text = textToParse.toLowerCase().trim();

    // Check for "Cek saldo" question intent
    if (text.includes('cek saldo') || text.includes('berapa saldo') || text.includes('sisa uang') || text.includes('sisa saldo')) {
      let matchedWallet = wallets.find(w => text.includes(w.name.toLowerCase()) || 
        (text.includes('bca') && w.name.toLowerCase().includes('bca')) ||
        (text.includes('dana') && w.name.toLowerCase().includes('dana')) ||
        (text.includes('gopay') && w.name.toLowerCase().includes('gopay')) ||
        (text.includes('cash') && w.name.toLowerCase().includes('cash'))
      );

      if (matchedWallet) {
        const msg = `Saldo ${matchedWallet.name} kamu saat ini sebesar Rp ${(matchedWallet.balance || 0).toLocaleString('id-ID')}.`;
        setAssistantResponse(msg);
        setParsedCard(null);
        speakText(msg);
        return;
      } else {
        const total = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
        const msg = `Total saldo kas aktif dari semua akun dompetmu adalah Rp ${total.toLocaleString('id-ID')}.`;
        setAssistantResponse(msg);
        setParsedCard(null);
        speakText(msg);
        return;
      }
    }

    // Extract Indonesian amount format (e.g. 25rb, 50k, 1.5jt, 5jt, 25000)
    let extractedAmount = 0;

    // Check for "jt" or "juta" (e.g. 1.5jt, 5jt, 2,5 juta)
    const jutaMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/i);
    if (jutaMatch) {
      const numStr = jutaMatch[1].replace(',', '.');
      extractedAmount = Math.round(parseFloat(numStr) * 1000000);
    } 
    // Check for "rb" or "ribu" or "k" (e.g. 25rb, 50k, 100 ribu)
    else {
      const ribuMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|ribu|k)/i);
      if (ribuMatch) {
        const numStr = ribuMatch[1].replace(',', '.');
        extractedAmount = Math.round(parseFloat(numStr) * 1000);
      } else {
        // Plain numbers
        const plainNumberMatch = text.match(/\d[\d.,]*/g);
        if (plainNumberMatch && plainNumberMatch.length > 0) {
          const cleanNum = plainNumberMatch[0].replace(/\./g, '').replace(',', '.');
          extractedAmount = Number(cleanNum) || 0;
        }
      }
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
    const isIncome = text.includes('gaji') || text.includes('masuk') || text.includes('bonus') || text.includes('dapat') || text.includes('pendapatan');
    const isSaving = text.includes('nabung') || text.includes('investasi') || text.includes('darurat') || text.includes('reksadana');
    
    let category = 'Jajan';
    if (text.includes('makan') || text.includes('nasi') || text.includes('resto') || text.includes('ayam') || text.includes('mie') || text.includes('warung')) category = 'Makan';
    else if (text.includes('bensin') || text.includes('gojek') || text.includes('grab') || text.includes('transport') || text.includes('tol') || text.includes('parkir')) category = 'Transport';
    else if (text.includes('kopi') || text.includes('snack') || text.includes('boba') || text.includes('dimsum') || text.includes('jajan')) category = 'Jajan';
    else if (text.includes('belanja') || text.includes('supermarket') || text.includes('indomaret') || text.includes('alfamart') || text.includes('sabun')) category = 'Belanja';
    else if (text.includes('listrik') || text.includes('wifi') || text.includes('kos') || text.includes('air')) category = 'Tagihan';

    // Title cleanup
    let cleanTitle = textToParse
      .replace(/(beli|makan|bayar|isi|catat|pake|pakai|dari|masuk|ke|rp|jt|juta|rb|ribu|k|\d+)/gi, '')
      .replace(/(uang cash|saldo dana|gopay|saldo rekening bca|shopeepay|dana|bca)/gi, '')
      .trim();
      
    if (!cleanTitle || cleanTitle.length < 2) {
      cleanTitle = isIncome ? 'Gaji / Pemasukan' : isSaving ? 'Tabungan' : 'Pengeluaran ' + category;
    }

    if (extractedAmount > 0) {
      const parsed = {
        title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        amount: extractedAmount,
        category,
        walletName: targetWallet,
        type: (isIncome ? 'INCOME' : isSaving ? 'SAVING' : 'EXPENSE') as 'INCOME' | 'SAVING' | 'EXPENSE'
      };
      setParsedCard(parsed);
      const respMsg = `Siap! Transaksi "${parsed.title}" Rp ${parsed.amount.toLocaleString('id-ID')} ke akun ${parsed.walletName}.`;
      setAssistantResponse(respMsg);
    } else {
      setAssistantResponse(`Nominal belum terdeteksi. Contoh: "Kopi 24rb cash" atau "Gaji 5jt bca".`);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          setIsListening(true);
          recognitionRef.current.start();
          return;
        } catch (e) {
          console.warn('Speech recognition start error:', e);
        }
      }
      
      // Simulated voice prompt if mic API is restricted in iframe
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        const randomSample = sampleCommands[Math.floor(Math.random() * sampleCommands.length)];
        setInputText(randomSample);
        handleParseText(randomSample);
      }, 1200);
    }
  };

  const handleConfirmAdd = () => {
    if (!parsedCard) return;
    onAutoAddTransaction(parsedCard);
    const successMsg = `Tersimpan! Transaksi Rp ${parsedCard.amount.toLocaleString('id-ID')} telah dicatat dan kas ${parsedCard.walletName} disinkronkan.`;
    setAssistantResponse(successMsg);
    speakText(successMsg);
    setParsedCard(null);
    setInputText('');
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-xs font-bold text-xs"
            style={{ backgroundColor: theme.primary }}
          >
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>Asisten Keuangan</span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                Suara & Teks
              </span>
            </h3>
          </div>
        </div>

        {isSpeaking && (
          <span className="text-[10px] text-sky-600 font-semibold flex items-center gap-1 animate-pulse">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Berbicara...</span>
          </span>
        )}
      </div>

      {/* Input Box */}
      <div className="space-y-2.5">
        <div className="relative flex items-center">
          <input
            id="input-assistant-query"
            type="text"
            placeholder="Ketik atau ucapkan: 'Kopi 24rb cash', 'Gaji 6jt BCA'..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleParseText(inputText)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3.5 pr-20 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition font-medium"
          />

          <div className="absolute right-1.5 flex items-center gap-1">
            <button
              id="btn-voice-assistant-mic"
              type="button"
              onClick={handleVoiceToggle}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                isListening 
                  ? 'bg-rose-500 text-white animate-pulse' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              }`}
              title="Bicara lewat Suara"
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            <button
              id="btn-assistant-send"
              type="button"
              onClick={() => handleParseText(inputText)}
              className="p-1.5 rounded-lg text-xs font-bold text-white shadow-2xs transition cursor-pointer"
              style={{ backgroundColor: theme.primary }}
              title="Kirim Pesan"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 text-[10px] font-medium">Contoh:</span>
          {sampleCommands.slice(0, 4).map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(sample);
                handleParseText(sample);
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60 transition text-[11px] cursor-pointer"
            >
              "{sample}"
            </button>
          ))}
        </div>

        {/* Assistant Response Box */}
        {assistantResponse && (
          <div className="p-3 bg-sky-50/80 border border-sky-200/80 rounded-xl text-xs text-sky-900 flex items-start gap-2 animate-fadeIn">
            <Bot className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium leading-relaxed">{assistantResponse}</p>
              
              {/* Confirm Parsed Card */}
              {parsedCard && (
                <div className="mt-2.5 p-2.5 bg-white rounded-lg border border-sky-200 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                  <div>
                    <span className="font-bold text-slate-800">{parsedCard.title}</span>
                    <div className="text-[10px] text-slate-500">
                      Kategori: <strong className="text-slate-700">{parsedCard.category}</strong> • Dompet: <strong className="text-sky-600">{parsedCard.walletName}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`font-bold font-mono text-xs ${parsedCard.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {parsedCard.type === 'INCOME' ? '+' : '-'} Rp {parsedCard.amount.toLocaleString('id-ID')}
                    </span>
                    <button
                      id="btn-assistant-confirm"
                      type="button"
                      onClick={handleConfirmAdd}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-2xs flex items-center gap-1 cursor-pointer"
                      style={{ backgroundColor: theme.primary }}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setAssistantResponse(null);
                setParsedCard(null);
              }}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
