import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  RefreshCw, 
  Calculator, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import confetti from 'canvas-confetti';
import { AdsensePassSection } from './components/AdsensePassSection';

interface FxRates {
  USD: number;
  KRW: number;
  JPY: number;
  EUR: number;
  CNY: number;
}

interface CryptoPrices {
  bitcoin: { usd: number; krw: number; usd_24h_change: number };
  ethereum: { usd: number; krw: number; usd_24h_change: number };
  solana: { usd: number; krw: number; usd_24h_change: number };
  ripple: { usd: number; krw: number; usd_24h_change: number };
}

// Sparkline Trend Item
interface TrendItem {
  name: string;
  KRW: number;
  BTC: number;
  ETH: number;
}

// Flicker states for columns
interface FlickerState {
  [key: string]: 'up' | 'down' | null;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [trendHistory, setTrendHistory] = useState<TrendItem[]>([]);
  
  const MOCK_RATES = { USD: 1, KRW: 1350, JPY: 154, EUR: 0.92, CNY: 7.24 };
  const MOCK_CRYPTO = {
    bitcoin: { usd: 89450, krw: 120757500, usd_24h_change: 3.42 },
    ethereum: { usd: 3450, krw: 4657500, usd_24h_change: -1.24 },
    solana: { usd: 184, krw: 248400, usd_24h_change: 8.92 },
    ripple: { usd: 1.12, krw: 1512, usd_24h_change: -0.45 },
  };

  // Financial Data States initialized with Mock values to prevent runtime null access
  const [rates, setRates] = useState<FxRates>(MOCK_RATES);
  const [crypto, setCrypto] = useState<CryptoPrices>(MOCK_CRYPTO);
  
  // Previous Data references for Flicker Detection
  const prevRatesRef = useRef<FxRates>(MOCK_RATES);
  const prevCryptoRef = useRef<CryptoPrices>(MOCK_CRYPTO);
  
  // Animation/Flicker States
  const [flickers, setFlickers] = useState<FlickerState>({});

  // Calculator States
  const [calcAmount, setCalcAmount] = useState<number>(1);
  const [calcCurrency, setCalcCurrency] = useState<string>('USD');

  // Coingecko Schema Validator to prevent type errors on API rate limiting
  const validateCryptoData = (data: any): data is CryptoPrices => {
    if (!data || typeof data !== 'object') return false;
    const requiredKeys = ['bitcoin', 'ethereum', 'solana', 'ripple'];
    for (const key of requiredKeys) {
      if (!data[key] || typeof data[key].usd !== 'number' || typeof data[key].usd_24h_change !== 'number') {
        return false;
      }
    }
    return true;
  };

  // Fetch Financial Data
  const fetchData = async (isSilent = false) => {
    // 쿨타임 가드 (수동 갱신이며 쿨타임이 남은 경우 실행 취소)
    if (!isSilent && cooldown > 0) return;

    try {
      if (!isSilent) setLoading(true);

      // Fetch Fiat FX Rates (Base USD)
      const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (!fxRes.ok) throw new Error('FX rates fetch failed');
      const fxData = await fxRes.json();
      const currentRates: FxRates = {
        USD: 1,
        KRW: fxData.rates.KRW,
        JPY: fxData.rates.JPY,
        EUR: fxData.rates.EUR,
        CNY: fxData.rates.CNY,
      };

      // Fetch Crypto Prices (BTC, ETH, SOL, XRP)
      const cryptoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple&vs_currencies=usd,krw&include_24hr_change=true';
      const cryptoRes = await fetch(cryptoUrl);
      if (!cryptoRes.ok) throw new Error('Crypto fetch failed');
      const cryptoData = await cryptoRes.json();

      if (!validateCryptoData(cryptoData)) {
        throw new Error('Invalid crypto data schema from Coingecko API (possibly rate-limited)');
      }

      // Detect changes and trigger flicker animation
      const nextFlickers: FlickerState = {};
      
      if (prevRatesRef.current && prevCryptoRef.current) {
        // Check KRW rate change
        if (currentRates.KRW > prevRatesRef.current.KRW) nextFlickers['KRW'] = 'up';
        else if (currentRates.KRW < prevRatesRef.current.KRW) nextFlickers['KRW'] = 'down';

        // Check Crypto price changes
        const assets: (keyof CryptoPrices)[] = ['bitcoin', 'ethereum', 'solana', 'ripple'];
        assets.forEach(asset => {
          if (cryptoData[asset].usd > prevCryptoRef.current[asset].usd) nextFlickers[asset] = 'up';
          else if (cryptoData[asset].usd < prevCryptoRef.current[asset].usd) nextFlickers[asset] = 'down';
        });

        setFlickers(nextFlickers);
        
        // Clear flickers after 600ms
        setTimeout(() => {
          setFlickers({});
        }, 600);
      }

      // Save refs for next compare
      prevRatesRef.current = currentRates;
      prevCryptoRef.current = cryptoData;

      setRates(currentRates);
      setCrypto(cryptoData);
      setIsFallback(false); // API 통신 성공 시 폴백 해제

      // Record trend history
      const timeStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newTrend: TrendItem = {
        name: timeStr,
        KRW: currentRates.KRW,
        BTC: cryptoData.bitcoin.usd,
        ETH: cryptoData.ethereum.usd
      };
      setTrendHistory(prev => {
        const next = [...prev, newTrend];
        if (next.length > 5) return next.slice(-5);
        return next;
      });

      // 수동 갱신 시 5초 쿨타임 지정
      if (!isSilent) {
        setCooldown(5);
      }
    } catch (err) {
      console.error('금융 API 로딩 실패 - 임시 목데이터 활성화', err);
      setRates(MOCK_RATES);
      setCrypto(MOCK_CRYPTO);
      setIsFallback(true); // API 통신 실패 시 폴백 활성화

      // Fallback trend history record
      const timeStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTrendHistory(prev => {
        const next = [...prev, { name: timeStr, KRW: MOCK_RATES.KRW, BTC: MOCK_CRYPTO.bitcoin.usd, ETH: MOCK_CRYPTO.ethereum.usd }];
        if (next.length > 5) return next.slice(-5);
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    fetchData();

    // Auto-update every 12 seconds for realtime HTS experience
    const interval = setInterval(() => {
      fetchData(true);
    }, 12000);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Multi-Currency Mixer Calculations
  const mixedResults = useMemo(() => {
    if (!rates || !crypto) return [];

    // Base value normalized to USD
    let valueInUsd = 0;
    if (calcCurrency === 'USD') valueInUsd = calcAmount;
    else if (calcCurrency === 'KRW') valueInUsd = calcAmount / rates.KRW;
    else if (calcCurrency === 'JPY') valueInUsd = calcAmount / rates.JPY;
    else if (calcCurrency === 'EUR') valueInUsd = calcAmount / rates.EUR;
    else if (calcCurrency === 'BTC') valueInUsd = calcAmount * crypto.bitcoin.usd;
    else if (calcCurrency === 'ETH') valueInUsd = calcAmount * crypto.ethereum.usd;
    else if (calcCurrency === 'SOL') valueInUsd = calcAmount * crypto.solana.usd;

    const formatter = (val: number, type: 'fiat' | 'crypto') => {
      if (type === 'fiat') {
        return val >= 100 ? val.toLocaleString(undefined, { maximumFractionDigits: 0 }) : val.toFixed(2);
      }
      return val >= 1 ? val.toFixed(4) : val.toFixed(6);
    };

    return [
      { code: 'KRW', name: '대한민국 원', value: formatter(valueInUsd * rates.KRW, 'fiat'), symbol: '₩' },
      { code: 'USD', name: '미국 달러', value: formatter(valueInUsd, 'fiat'), symbol: '$' },
      { code: 'JPY', name: '일본 엔', value: formatter(valueInUsd * rates.JPY, 'fiat'), symbol: '¥' },
      { code: 'EUR', name: '유럽 유로', value: formatter(valueInUsd * rates.EUR, 'fiat'), symbol: '€' },
      { code: 'BTC', name: '비트코인', value: formatter(valueInUsd / crypto.bitcoin.usd, 'crypto'), symbol: '₿' },
      { code: 'ETH', name: '이더리움', value: formatter(valueInUsd / crypto.ethereum.usd, 'crypto'), symbol: 'Ξ' },
      { code: 'SOL', name: '솔라나', value: formatter(valueInUsd / crypto.solana.usd, 'crypto'), symbol: '◎' },
    ];
  }, [rates, crypto, calcAmount, calcCurrency]);

  // Risk Radar Data Calculations (자산 변동성 및 리스크 레이더 매핑)
  const radarData = useMemo(() => {
    if (!rates || !crypto) return [];

    // 리스크 점수 산출 공식 (변동폭, 규제 수준, 중앙화도, 인플레이션 등)
    return [
      { subject: '원화 (KRW)', '안정성': 80, '변동성': 15, '수익성': 5, '리스크': 10 },
      { subject: '달러 (USD)', '안정성': 95, '변동성': 8, '수익성': 8, '리스크': 5 },
      { subject: '유로 (EUR)', '안정성': 90, '변동성': 10, '수익성': 6, '리스크': 7 },
      { subject: '비트코인', '안정성': 35, '변동성': 75, '수익성': 85, '리스크': 45 },
      { subject: '이더리움', '안정성': 30, '변동성': 80, '수익성': 90, '리스크': 50 },
      { subject: '솔라나', '안정성': 15, '변동성': 95, '수익성': 98, '리스크': 75 },
    ];
  }, [rates, crypto]);

  const handleConfetti = () => {
    confetti({
      particleCount: 70,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#10b981', '#06b6d4', '#a855f7']
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05070a] text-slate-400 font-semibold tracking-wider animate-pulse">
        <Activity size={32} className="animate-spin text-emerald-500 mb-4" />
        실시간 환율 및 글로벌 암호화폐 데이터 수신 중...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#05070a] py-12 px-4 md:px-8 overflow-hidden text-slate-100">
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Fallback Warning Banner */}
        {isFallback && (
          <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>실시간 API 호출 한도가 초과되었거나 네트워크가 원활하지 않아 폴백(캐시된) 시세가 표시되고 있습니다. 서비스는 안전하게 유지됩니다.</span>
          </div>
        )}
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 border-b border-white/5 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-wider uppercase mb-3">
              <Activity size={12} /> Realtime HTS Engine Linked
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Harness <span className="text-gradient-blue">FX-Crypto Radar</span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              실시간 외환 환율과 가상자산 시세를 융합한 스마트 핀테크 대시보드
            </p>
          </div>
          
          <button 
            onClick={() => { if (cooldown === 0) { handleConfetti(); fetchData(); } }}
            disabled={cooldown > 0}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-black/40 ${cooldown > 0 ? 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10 border-white/10'}`}
          >
            <RefreshCw size={14} className={`text-emerald-400 ${cooldown > 0 ? 'animate-spin opacity-50' : ''}`} /> 
            {cooldown > 0 ? `갱신 대기 (${cooldown}초)` : '수동 시세 갱신'}
          </button>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-8">
          
          {/* Realtime Prices Panel */}
          <div className="lg:col-span-7 glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Coins size={16} className="text-emerald-400" /> 실시간 마켓 시세 (12s refresh)
                </h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse flex items-center gap-1">
                  ● Realtime Live
                </span>
              </div>

              <div className="space-y-4">
                
                {/* Dollar Rates */}
                <div className={`p-4 rounded-2xl border border-white/5 bg-white/5 flex justify-between items-center transition-colors duration-500 ${flickers['KRW'] === 'up' ? 'flicker-up' : flickers['KRW'] === 'down' ? 'flicker-down' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400">
                      ₩
                    </div>
                    <div>
                      <span className="text-white text-xs font-black">원/달러 환율 (KRW)</span>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">USD exchange rate</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-black text-base">₩{rates?.KRW.toFixed(2)}</span>
                  </div>
                </div>

                {/* Crypto Prices */}
                {crypto && Object.entries(crypto).map(([key, data]) => {
                  const change = data.usd_24h_change;
                  const isUp = change >= 0;
                  const flicker = flickers[key];
                  
                  return (
                    <div 
                      key={key} 
                      className={`p-4 rounded-2xl border border-white/5 bg-white/5 flex justify-between items-center transition-colors duration-500 ${flicker === 'up' ? 'flicker-up' : flicker === 'down' ? 'flicker-down' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-black text-purple-400 text-lg uppercase">
                          {key[0]}
                        </div>
                        <div>
                          <span className="text-white text-xs font-black capitalize">{key}</span>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">{key} / USD</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white font-black text-sm">${data.usd.toLocaleString()}</div>
                        <div className={`text-[10px] font-bold flex items-center gap-0.5 justify-end ${isUp ? 'neon-green' : 'neon-rose'}`}>
                          {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {change.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-slate-500 font-bold">
              <AlertTriangle size={12} className="text-yellow-500/70" />
              본 시세 정보는 Public API를 사용한 참고용이며 상업적 투자용으로 활용될 수 없습니다.
            </div>
          </div>

          {/* Calculator Mixer Panel */}
          <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-1.5 mb-6">
                <Calculator size={16} className="text-cyan-400" /> 다중 통화 자산 믹서 (Mixer)
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">기준 자산 종류</label>
                  <select 
                    value={calcCurrency} 
                    onChange={(e) => setCalcCurrency(e.target.value)}
                    className="fin-select w-full"
                  >
                    <option value="USD">USD - 미국 달러 ($)</option>
                    <option value="KRW">KRW - 대한민국 원 (₩)</option>
                    <option value="JPY">JPY - 일본 엔 (¥)</option>
                    <option value="EUR">EUR - 유럽 유로 (€)</option>
                    <option value="BTC">BTC - 비트코인 (₿)</option>
                    <option value="ETH">ETH - 이더리움 (Ξ)</option>
                    <option value="SOL">SOL - 솔라나 (◎)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">수량 입력 (Amount)</label>
                  <input 
                    type="number" 
                    value={calcAmount} 
                    onChange={(e) => setCalcAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="fin-input"
                    placeholder="수량을 입력하세요"
                  />
                </div>
              </div>

              {/* Conversion Result List */}
              <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block mb-2">가치 동시 변환 결과 (Conversion Results)</span>
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {mixedResults.map(item => (
                    <div key={item.code} className="flex justify-between items-center p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-slate-400 w-8">{item.code}</span>
                        <span className="text-[10px] font-bold text-slate-500">{item.name}</span>
                      </div>
                      <div className="font-black text-white text-xs">
                        <span className="text-slate-400 mr-1">{item.symbol}</span>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Realtime Trend Mini Chart */}
              {trendHistory.length > 0 && (
                <div className="mt-6 border-t border-white/5 pt-4">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                    <Activity size={12} className="text-purple-400 animate-pulse" /> 실시간 시세 변동 추이 (최근 5회)
                  </span>
                  <div className="w-full h-[110px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 7 }} stroke="rgba(255,255,255,0.05)" />
                        <YAxis domain={['auto', 'auto']} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 7 }} stroke="rgba(255,255,255,0.05)" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#090d16', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          labelStyle={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}
                          itemStyle={{ color: '#fff', fontSize: '9px' }}
                        />
                        <Area type="monotone" dataKey="BTC" name="BTC/USD" stroke="#a855f7" fillOpacity={1} fill="url(#colorBtc)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Radar Chart Panel */}
        <div className="glass-card p-6 flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h3 className="text-white font-black text-sm uppercase tracking-wider flex items-center gap-1.5 mb-4">
              <Activity size={16} className="text-purple-400" /> 자산 리스크/수익 상관분석 (Risk Radar)
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed word-keep mb-6">
              각 금융 자산의 안정성, 변동성, 수익성 및 종합 리스크 지수를 4차원 레이더 시스템으로 비교 분석합니다. 법정화폐(USD/KRW)는 높은 안정성을 보이는 반면 가상자산은 높은 변동성과 잠재 수익 지수를 나타냅니다.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block mr-1.5"></span>
                <span className="text-white font-black text-xs">수익성 극대화</span>
                <p className="text-[10px] text-slate-500 mt-1">솔라나 (SOL) & 비트코인 (BTC)</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <span className="w-2 h-2 rounded-full bg-[#06b6d4] inline-block mr-1.5"></span>
                <span className="text-white font-black text-xs">안정성 최고 지표</span>
                <p className="text-[10px] text-slate-500 mt-1">미국 달러 (USD) 시세</p>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 w-full h-[320px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "65%" : "80%"} data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: isMobile ? 8 : 10, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
                <Radar name="수익성" dataKey="수익성" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Radar name="안정성" dataKey="안정성" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                <Radar name="리스크" dataKey="리스크" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Adsense Pass Column Section */}
        <AdsensePassSection />

        {/* Footer */}
        <footer className="text-center mt-12 text-slate-600 text-[10px] uppercase tracking-widest">
          &copy; 2026 Harness Systems. All Rights Reserved.
        </footer>

      </div>
    </div>
  );
}
