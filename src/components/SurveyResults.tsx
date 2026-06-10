import React, { useState, useEffect, useRef } from 'react';
import { SurveyConfig, AnswerData } from '../types';

import { SnsExportButton } from './SnsExportButton';
import { ArrowLeft, Link as LinkIcon, ChevronLeft, ChevronRight, RotateCcw, Settings, X, Share2, Sparkles } from 'lucide-react';
import { themeMap } from '../theme';
import { calculateScores } from '../utils/scoringEngine';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { useSwipeable } from 'react-swipeable';
import confetti from 'canvas-confetti';

// ============================================================
// 데이터 상수 (21 기능용)
// ============================================================
const CARD_THEMES = [
  { name: '인스타', from: '#f09433', via: '#dc2743', to: '#bc1888' },
  { name: '오션', from: '#0ea5e9', via: '#6366f1', to: '#8b5cf6' },
  { name: '포레스트', from: '#10b981', via: '#0ea5e9', to: '#3b82f6' },
  { name: '선셋', from: '#f59e0b', via: '#f43f5e', to: '#7c3aed' },
  { name: '퍼플', from: '#a855f7', via: '#ec4899', to: '#f43f5e' },
  { name: '민트', from: '#14b8a6', via: '#06b6d4', to: '#84cc16' },
  { name: '차콜', from: '#334155', via: '#1e293b', to: '#0f172a' },
  { name: '골드', from: '#f59e0b', via: '#fbbf24', to: '#d97706' },
  { name: '네온', from: '#a855f7', via: '#06b6d4', to: '#10b981' },
  { name: '로즈', from: '#fb7185', via: '#f43f5e', to: '#e11d48' },
];

const CARD_PATTERNS = [
  { name: '그라데이션', style: {} },
  { name: '도트', style: { backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' } },
  { name: '그리드', style: { backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px' } },
  { name: '다이아', style: { backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' } },
];

const VIRAL_PHRASES = [
  (p: string) => `나 오늘 FX 레이더 해봤는데 "${p}" 나왔어 ㅋㅋ 너무 소름 🤯 너도 해봐`,
  (p: string) => `"${p}" 판정받고 팩폭 실화냐... 완전 내 얘기잖아 😭 fx-radar1024.vercel.app`,
  (p: string) => `친구야 나 "${p}" 유형이래 ㅋㅋㅋ 너는 뭐 나오는지 해봐 → fx-radar1024.vercel.app`,
  (p: string) => `MBTI는 이제 구식 🙅 FX 레이더에서 "${p}" 받음 완전 신기 해봐요`,
];

const CELEB_ARCHETYPES = [
  { name: '유재석형 리더', emoji: '🎙️', desc: '모두를 웃기며 조율하는 완벽한 사회적 리더', keyword: ['사교', '관계', '리더'] },
  { name: 'BTS RM형 사색가', emoji: '🎤', desc: '지성과 감성을 겸비한 철학적 크리에이터', keyword: ['창의', '지적', '예술'] },
  { name: '손흥민형 집념가', emoji: '⚽', desc: '목표를 향해 묵묵히 달려가는 실력파', keyword: ['성취', '집중', '실행'] },
  { name: '김연아형 완벽주의', emoji: '⛸️', desc: '디테일 하나 놓치지 않는 프로페셔널', keyword: ['완벽', '분석', '원칙'] },
  { name: '아이유형 감성파', emoji: '🎵', desc: '깊은 공감능력으로 모두의 마음을 여는 예술가', keyword: ['공감', '감성', '소통'] },
];

const COMPAT_DESC: Record<string, string> = {
  same: '같은 유형끼리! 공감력 폭발이지만 단점도 겹쳐요 😅',
  adjacent: '비슷한 성향으로 편안하고 자연스러운 케미 ✨',
  opposite: '정반대라 처음엔 충돌하지만 서로 성장하게 해요 💪',
};

// ============================================================
// 메인 컴포넌트
// ============================================================
interface SurveyResultsProps {
  survey: SurveyConfig;
  answers: Record<number, AnswerData>;
  onRestart: () => void;
  onHome: () => void;
}

export const SurveyResults = ({ survey, answers, onRestart, onHome }: SurveyResultsProps) => {
  const scores = calculateScores(survey, answers);
  const resultData = survey.getResultContent(scores.averageScore, scores.categoryScores, answers);
  const t = themeMap[survey.color] || themeMap['blue'];
  const radarData = survey.categories.map((catName, index) => ({
    subject: catName,
    A: Math.round(scores.categoryScores[index] || 0),
    fullMark: 100,
  }));

  const [revealPhase, setRevealPhase] = useState<0 | 1 | 2>(0);
  const [revealFakeType, setRevealFakeType] = useState('???');

  // UI States
  const [themeIdx, setThemeIdx] = useState(0);
  const [patternIdx, setPatternIdx] = useState(0);
  const [cardDark, setCardDark] = useState(true);
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [cardFormat, setCardFormat] = useState<'9:16' | '1:1'>('9:16');
  const [showQR, setShowQR] = useState(false);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [swipeIdx, setSwipeIdx] = useState(0);
  const [friendType, setFriendType] = useState<string | null>(null);
  const [newsOrder, setNewsOrder] = useState<'bad' | 'good' | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showFactAttack, setShowFactAttack] = useState(false);

  // Apple & Google God-Tier UX States
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const cardTheme = CARD_THEMES[themeIdx];
  const cardPattern = CARD_PATTERNS[patternIdx];

  const triggerHaptic = (pattern: number | number[]) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    triggerHaptic(20);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fireConfetti = () => {
    triggerHaptic([50, 100, 150]);
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: [cardTheme.from, cardTheme.via || '#ffffff', cardTheme.to]
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: [cardTheme.from, cardTheme.via || '#ffffff', cardTheme.to]
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Reveal Animation
  useEffect(() => {
    const fakeTypes = ['실용주의자', '감성가', '전략가', '직관가', '원칙론자', '관계주의자', '창조가', '분석가', '탐험가', '수호자'];
    let i = 0;
    let delay = 60;

    const cycle = () => {
      setRevealFakeType(fakeTypes[i % fakeTypes.length]);
      i++;
      delay = delay * 1.15;
      triggerHaptic(5);
      if (delay < 500) {
        setTimeout(cycle, delay);
      } else {
        setRevealFakeType(resultData.persona);
        setTimeout(() => {
          setRevealPhase(1);
          triggerHaptic(50);
        }, 600);
        setTimeout(() => {
          setRevealPhase(2);
          fireConfetti();
        }, 2000);
      }
    };
    setTimeout(cycle, 300);
  }, []);

  const latencies = Object.values(answers).map(a => a.latencyMs || 0);
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
  const mean = scores.categoryScores.reduce((a, b) => a + b, 0) / scores.categoryScores.length;
  const stdDev = Math.sqrt(scores.categoryScores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.categoryScores.length);
  
  // Scientific Consistency Score based on Latency (베이지안 기반 응답 신뢰도 시뮬레이션)
  const consistencyScore = Math.round(Math.min(99, Math.max(75, 100 - (avgLatency / 150))));

  const badges = [];
  if (scores.reliabilityScore >= 95) badges.push({ icon: '🛡️', text: '강철 솔직함', desc: '95%+ 신뢰도 — 거짓 없이 완벽한 응답' });
  if (avgLatency > 0 && avgLatency < 1200) badges.push({ icon: '⚡', text: '빛의 직관', desc: '1.2초 미만의 번개 같은 반응속도' });
  if (stdDev < 10) badges.push({ icon: '⚖️', text: '극강 밸런스', desc: '모든 영역이 고르게 발달한 전천후 인재' });
  if (scores.reliabilityScore < 50) badges.push({ icon: '🎭', text: '내면 복잡계', desc: '스스로도 모르는 다층적 내면세계 보유' });
  if (avgLatency > 5000) badges.push({ icon: '🧘', text: '철학자 모드', desc: '매 질문을 깊이 사색하는 진정한 사색가' });

  const getPercentile = (score: number) => Math.max(1, Math.min(99, Math.round(score)));

  const heatmapData = Object.entries(answers).slice(0, 24).map(([idx, ans]) => ({
    q: parseInt(idx) + 1,
    latency: Math.min(ans.latencyMs || 0, 8000),
  }));

  const swipeCards = [
    ...resultData.strengths.map(s => ({ type: 'strength' as const, text: s })),
    ...resultData.weaknesses.map(w => ({ type: 'weakness' as const, text: w })),
  ];
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => { setSwipeIdx(i => Math.min(swipeCards.length - 1, i + 1)); triggerHaptic(10); },
    onSwipedRight: () => { setSwipeIdx(i => Math.max(0, i - 1)); triggerHaptic(10); },
    trackMouse: true,
  });

  const matchedCelebs = CELEB_ARCHETYPES.slice(0, 3);

  const handleCopyLink = () => {
    const mockHash = Math.random().toString(36).substring(2, 8).toUpperCase();
    const url = `https://fx-radar1024.vercel.app/result/${mockHash}`;
    navigator.clipboard.writeText(url);
    showToast('✨ 링크가 복사되었습니다!');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`나는 "${resultData.persona}" 유형!\n"${resultData.headline}"\n\n당신은 어떤 유형인지 알아보세요 👇`);
    const tags = encodeURIComponent('에니어그램,MZ직장인,직장생존DNA,MZ레이더,성향테스트');
    window.open(`https://twitter.com/intent/tweet?text=${text}&hashtags=${tags}&url=${encodeURIComponent('https://fx-radar1024.vercel.app')}`, '_blank');
  };

  const handleKakaoShare = () => {
    const phrase = VIRAL_PHRASES[phraseIdx](resultData.persona);
    if (navigator.share) {
      navigator.share({ title: `FX 레이더: ${resultData.persona}`, text: phrase, url: 'https://fx-radar1024.vercel.app' });
    } else {
      navigator.clipboard.writeText(phrase + '\nhttps://fx-radar1024.vercel.app');
      showToast('💬 카카오톡 공유 문구가 복사되었습니다!');
    }
  };

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(VIRAL_PHRASES[phraseIdx](resultData.persona));
    showToast('📝 바이럴 문구가 복사되었습니다!');
  };

  const resultUrl = `https://fx-radar1024.vercel.app/result/${resultData.persona.replace(/\s/g, '_')}`;

  const cardBg = cardDark
    ? `linear-gradient(145deg, rgba(0,0,0,0.75), rgba(0,0,0,0.6)), linear-gradient(135deg, ${cardTheme.from}18, ${cardTheme.to}18)`
    : `linear-gradient(145deg, rgba(255,255,255,0.92), rgba(255,255,255,0.85)), linear-gradient(135deg, ${cardTheme.from}12, ${cardTheme.to}12)`;

  // ========= PHASE 0/1: Reveal Screen (Apple Fluid + Pulse) =========
  if (revealPhase < 2) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-black relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${cardTheme.from}33, ${cardTheme.to}33)` }} />
        <motion.div className="absolute inset-0 bg-black/50" animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} />
        <motion.div className="absolute left-0 w-full h-[2px] z-0" style={{ boxShadow: `0 0 20px 2px ${cardTheme.from}`, background: `linear-gradient(90deg, transparent, ${cardTheme.from}, white, ${cardTheme.to}, transparent)` }} animate={{ top: ['-5%', '105%'] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} />
        
        <div className="z-10 text-center px-8 relative">
          <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="text-white/70 text-xs font-black uppercase tracking-[0.4em] mb-8">
            당신의 유형을 분석 중...
          </motion.p>
          <AnimatePresence mode="wait">
            <motion.div key={revealFakeType} initial={{ opacity: 0, scale: 0.4, filter: 'blur(20px)', y: 20 }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }} exit={{ opacity: 0, scale: 1.6, filter: 'blur(20px)', y: -20 }} transition={{ duration: 0.08 }} className="mb-4">
              <span className={`text-5xl sm:text-6xl font-black block mb-2 ${revealPhase === 1 ? 'text-white' : 'text-white/60'}`} style={revealPhase === 1 ? { textShadow: `0 0 40px ${cardTheme.from}, 0 0 80px ${cardTheme.to}` } : {}}>
                {revealFakeType}
              </span>
            </motion.div>
          </AnimatePresence>
          {revealPhase === 1 && (
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 8, stiffness: 120 }} className="text-8xl select-none" style={{ filter: `drop-shadow(0 0 30px ${cardTheme.from})` }}>
              {resultData.emoji}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ========= PHASE 2: God-Tier UX Results =========
  return (
    <div className="flex flex-col min-h-[100dvh] overflow-hidden bg-slate-950 relative transition-colors duration-1000"
      style={{ background: `linear-gradient(160deg, #050505 0%, ${cardTheme.from}15 50%, #050505 100%)` }}
    >
      {/* 🍎 Dynamic Island Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.8 }}
            animate={{ y: 20, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex items-center gap-2"
          >
            <Sparkles size={14} className="text-amber-300" />
            <span className="text-white text-xs font-bold tracking-wide">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sticky Top Nav ── */}
      <div className="absolute top-0 w-full z-40 flex justify-between items-center px-6 py-5 bg-gradient-to-b from-black/60 to-transparent">
        <button onClick={() => { triggerHaptic(10); onHome(); }} className="p-2.5 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-90">
          <ArrowLeft size={16} />
        </button>
        <span className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">결과 리포트</span>
        <button onClick={() => { triggerHaptic(10); setIsSettingsOpen(true); }} className="p-2.5 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-90">
          <Settings size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-24 space-y-6 relative z-10 hide-scrollbar">
        
        {/* 📸 Main Photo Card */}
        <motion.div
          id="insta-photocard"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          className="w-full relative overflow-hidden rounded-[3rem] border-[1px] border-white/20 flex flex-col items-center justify-between p-8"
          style={{
            aspectRatio: cardFormat === '9:16' ? '9/16' : '1/1',
            background: cardBg,
            ...cardPattern.style,
            boxShadow: `0 30px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1)`,
          }}
        >
          {/* Card Top Glow */}
          <div className="absolute top-0 left-0 w-full h-[4px] rounded-t-[3rem]" style={{ background: `linear-gradient(90deg, ${cardTheme.from}, ${cardTheme.to})`, boxShadow: `0 0 20px ${cardTheme.from}` }} />
          <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] opacity-40 pointer-events-none" style={{ background: cardTheme.from }} />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-[80px] opacity-40 pointer-events-none" style={{ background: cardTheme.to }} />

          <div className="relative z-10 w-full text-center mt-2">
            <motion.span animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }} className="inline-block text-[9px] font-black tracking-[0.25em] uppercase py-1.5 px-4 rounded-full mb-6" style={{ background: `linear-gradient(90deg, ${cardTheme.from}40, ${cardTheme.to}40)`, color: 'white', border: `1px solid ${cardTheme.from}50` }}>
              {survey.name} {lang === 'ko' ? '진단 결과' : 'Result'}
            </motion.span>

            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 12, stiffness: 100, delay: 0.2 }} className="text-7xl sm:text-8xl mb-4 select-none" style={{ filter: `drop-shadow(0 20px 30px rgba(0,0,0,0.3))` }}>
              {resultData.emoji}
            </motion.div>

            <h1 className={`text-4xl sm:text-5xl font-black mb-3 leading-tight word-keep ${cardDark ? 'text-white' : 'text-slate-900'}`} style={cardDark ? { textShadow: `0 0 30px ${cardTheme.from}80` } : {}}>
              {resultData.persona}
            </h1>
            <p className={`text-xs font-bold mb-5 px-4 py-2 rounded-2xl inline-block word-keep backdrop-blur-md ${cardDark ? 'text-white/90 bg-white/10 border border-white/10' : 'text-slate-800 bg-black/5'}`}>
              {resultData.headline}
            </p>

            <div className="flex justify-center gap-2 flex-wrap mb-2">
              {resultData.hashtags?.slice(0, 3).map((tag: string, i: number) => (
                <span key={i} className={`text-[10px] font-black px-3 py-1.5 rounded-full border ${cardDark ? 'border-white/15 text-white/90 bg-white/5' : 'border-black/10 text-slate-700 bg-black/5'}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="relative z-10 w-full my-4">
            <div className="w-full rounded-[2rem] bg-black/20 backdrop-blur-xl border border-white/10 p-5 shadow-[inset_0_0_40px_rgba(0,0,0,0.3)]">
              <p className="text-white/50 text-[11px] font-black uppercase tracking-[0.2em] mb-4">📈 9가지 투자 편향 분석</p>
              <div className="space-y-2.5">
                {[...radarData].sort((a, b) => b.A - a.A).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className={`text-[11px] font-black shrink-0 w-24 text-right leading-tight ${idx === 0 ? 'text-cyan-400' : 'text-white/50'}`}>{item.subject}</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${idx === 0 ? 'bg-cyan-400' : idx < 3 ? 'bg-blue-400/70' : 'bg-white/25'}`} style={{ width: `${item.A}%` }} />
                    </div>
                    <span className={`text-[11px] font-black w-7 text-right ${idx === 0 ? 'text-cyan-400' : 'text-white/40'}`}>{item.A}</span>
                    {idx === 0 && <span className="text-[9px] font-black text-cyan-400/80 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded-full shrink-0">지배 편향</span>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="relative z-10 w-full flex flex-col items-center">
            <div className={`w-full rounded-3xl p-5 mb-4 border ${cardDark ? 'bg-black/40 border-rose-500/20' : 'bg-rose-50/60 border-rose-200'} backdrop-blur-md`}>
              <p className="text-rose-400 text-[10px] font-black mb-2 uppercase tracking-wider">🔥 팩트 폭행</p>
              <p className={`text-xs font-bold leading-relaxed word-keep ${cardDark ? 'text-white/90' : 'text-slate-800'}`}>
                {resultData.strengths[0]}
              </p>
            </div>

            {showQR && (
              <div className="bg-white p-3 rounded-2xl shadow-xl mb-4">
                <QRCodeSVG value={resultUrl} size={64} bgColor="#ffffff" fgColor="#0f172a" level="M" />
              </div>
            )}
            <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${cardDark ? 'text-white/30' : 'text-black/30'}`}>MZ RADAR</p>
          </motion.div>
        </motion.div>

        {/* ── Swipeable Strengths/Weaknesses ── */}
        <section className="rounded-[2.5rem] border border-white/10 p-6 bg-white/5 backdrop-blur-3xl shadow-xl">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-white font-black text-sm">💡 강점 & 약점 분석</h2>
            <span className="text-white/40 text-[10px] font-bold bg-white/10 px-3 py-1 rounded-full">{swipeIdx + 1} / {swipeCards.length}</span>
          </div>

          <div className="flex gap-2 mb-4">
            {swipeCards.map((_, i) => (
              <div key={i} className="h-1.5 rounded-full transition-all duration-500 flex-1" style={{ background: i === swipeIdx ? `linear-gradient(90deg, ${cardTheme.from}, ${cardTheme.to})` : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>

          <div {...swipeHandlers} className="cursor-grab active:cursor-grabbing">
            <AnimatePresence mode="wait">
              <motion.div key={swipeIdx} initial={{ opacity: 0, x: 20, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -20, scale: 0.95 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="rounded-3xl p-6 border flex items-start gap-4 min-h-[120px]" style={{ background: swipeCards[swipeIdx]?.type === 'strength' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', borderColor: swipeCards[swipeIdx]?.type === 'strength' ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)' }}>
                <span className="text-3xl drop-shadow-md">{swipeCards[swipeIdx]?.type === 'strength' ? '✨' : '⚠️'}</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider mb-2 block" style={{ color: swipeCards[swipeIdx]?.type === 'strength' ? '#34d399' : '#fb7185' }}>
                    {swipeCards[swipeIdx]?.type === 'strength' ? '핵심 강점' : '치명적 약점'}
                  </span>
                  <p className="text-white/90 font-bold text-sm leading-relaxed word-keep">{swipeCards[swipeIdx]?.text}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ── 동료 케미 분석 ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 찰떡 동료 */}
          {resultData.bestMatch && (
            <div className="rounded-[2.5rem] border border-emerald-500/20 p-6 bg-emerald-500/5 backdrop-blur-3xl shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-emerald-400 tracking-wider uppercase mb-3 block">찰떡 동료 케미 ✨</span>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{resultData.bestMatch.emoji || '🤝'}</span>
                  <h3 className="text-white font-black text-lg">{resultData.bestMatch.type}</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed word-keep font-medium">{resultData.bestMatch.description}</p>
              </div>
            </div>
          )}
          
          {/* 최악의 동료 */}
          {resultData.worstMatch && (
            <div className="rounded-[2.5rem] border border-rose-500/20 p-6 bg-rose-500/5 backdrop-blur-3xl shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-rose-400 tracking-wider uppercase mb-3 block">최악의 동료 경보 ⚠️</span>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">💀</span>
                  <h3 className="text-white font-black text-lg">{resultData.worstMatch.type}</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed word-keep font-medium mb-4">{resultData.worstMatch.description}</p>
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4">
                  <p className="text-rose-300 text-xs font-bold mb-1">💡 대처 매뉴얼</p>
                  <p className="text-white/80 text-xs leading-relaxed font-medium">{resultData.worstMatch.handling}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ── 나만의 MZ 직장 생존 매뉴얼 ── */}
        {resultData.workManual && resultData.workManual.length > 0 && (
          <section className="rounded-[2.5rem] border border-white/10 p-6 bg-white/5 backdrop-blur-3xl shadow-xl">
            <h2 className="text-white font-black text-sm mb-5 flex items-center gap-2">
              📖 나만의 MZ 직장 생존 매뉴얼
            </h2>
            <div className="space-y-3">
              {resultData.workManual.map((manual, idx) => (
                <div key={idx} className="flex gap-4 items-center bg-black/20 border border-white/5 rounded-3xl p-4">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-black text-purple-300 shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-white/90 font-bold text-sm leading-relaxed word-keep">{manual}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 편향 교정 처방전 (FX 전용) ── */}
        {(resultData as any).biasCorrection && (
          <section className="rounded-[2.5rem] border border-cyan-500/20 p-6 bg-cyan-500/5 backdrop-blur-3xl shadow-xl">
            <h2 className="text-white font-black text-sm mb-5 flex items-center gap-2">
              💊 편향 교정 3단계 처방전
            </h2>
            <div className="space-y-3">
              {[
                { label: '단기 (1~4주)', value: (resultData as any).biasCorrection.short, color: 'text-green-300', bg: 'bg-green-500/10 border-green-500/20' },
                { label: '중기 (1~3개월)', value: (resultData as any).biasCorrection.mid, color: 'text-yellow-300', bg: 'bg-yellow-500/10 border-yellow-500/20' },
                { label: '장기 (6개월+)', value: (resultData as any).biasCorrection.long, color: 'text-cyan-300', bg: 'bg-cyan-500/10 border-cyan-500/20' },
              ].map((step, idx) => (
                <div key={idx} className={`flex gap-4 items-start border rounded-3xl p-4 ${step.bg}`}>
                  <span className={`text-[10px] font-black uppercase tracking-wider shrink-0 mt-0.5 ${step.color}`}>{step.label}</span>
                  <p className="text-white/90 font-bold text-sm leading-relaxed word-keep">{step.value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 핵심 강점 전체 ── */}
        {resultData.strengths && resultData.strengths.length > 0 && (
          <section className="rounded-[2.5rem] border border-white/10 p-6 bg-white/5 backdrop-blur-3xl shadow-xl">
            <h2 className="text-white font-black text-sm mb-5 flex items-center gap-2">
              💪 이 편향 유형의 강점
            </h2>
            <div className="space-y-3">
              {resultData.strengths.map((s, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-4">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-300 shrink-0 mt-0.5">{idx + 1}</span>
                  <p className="text-white/90 font-bold text-sm leading-relaxed word-keep">{s}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 주의해야 할 패턴 ── */}
        {resultData.weaknesses && resultData.weaknesses.length > 0 && (
          <section className="rounded-[2.5rem] border border-white/10 p-6 bg-white/5 backdrop-blur-3xl shadow-xl">
            <h2 className="text-white font-black text-sm mb-5 flex items-center gap-2">
              ⚠️ 이 편향이 만드는 손실 패턴
            </h2>
            <div className="space-y-3">
              {resultData.weaknesses.map((w, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-red-500/10 border border-red-500/20 rounded-3xl p-4">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[10px] font-black text-red-300 shrink-0 mt-0.5">!</span>
                  <p className="text-white/90 font-bold text-sm leading-relaxed word-keep">{w}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 전문가 처방 ── */}
        {resultData.advice && (
          <section className="rounded-[2.5rem] border border-amber-500/20 p-6 bg-amber-500/5 backdrop-blur-3xl shadow-xl">
            <h2 className="text-white font-black text-sm mb-4 flex items-center gap-2">
              🎯 편향 교정 처방
            </h2>
            <p className="text-white/90 font-bold text-sm leading-relaxed word-keep">{resultData.advice}</p>
          </section>
        )}

        {/* ── Celeb Match ── */}
        <section className="rounded-[2.5rem] border border-white/10 p-6 bg-white/5 backdrop-blur-3xl shadow-xl">
          <h2 className="text-white font-black text-sm mb-5">⭐ 당신이 셀럽이라면?</h2>
          <div className="space-y-3">
            {matchedCelebs.map((c, i) => (
              <motion.div key={i} whileHover={{ scale: 1.02 }} className="flex items-center gap-4 rounded-3xl p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-4xl drop-shadow-md">{c.emoji}</span>
                <div className="flex-1">
                  <p className="text-white font-black text-sm mb-1">{c.name}</p>
                  <p className="text-white/50 text-xs word-keep">{c.desc}</p>
                </div>
                <div className="text-right pl-2 border-l border-white/10">
                  <div className="font-black text-xl" style={{ color: cardTheme.from }}>{97 - i * 14}%</div>
                  <p className="text-white/30 text-[9px] uppercase tracking-wider mt-0.5">Match</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── 학술적 응답 신뢰도 지수 (Response Consistency) ── */}
        <section className="rounded-[2.5rem] border border-white/10 p-6 bg-white/5 backdrop-blur-3xl shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-white font-black text-sm mb-2 flex items-center gap-2">
            🔬 Response Consistency
          </h2>
          <p className="text-white/50 text-[10px] mb-5 font-bold">응답 반응 속도(Latency) 기반 일관성 추론 결과</p>
          
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="none" stroke={cardTheme.from} strokeWidth="6" strokeDasharray={`${consistencyScore * 1.75} 175`} strokeLinecap="round" />
              </svg>
              <div className="text-white font-black text-lg">{consistencyScore}<span className="text-[10px] text-white/50">%</span></div>
            </div>
            
            <div>
              <p className="text-white/90 text-xs leading-relaxed word-keep font-bold">
                {consistencyScore >= 90 ? '당신의 응답 패턴은 매우 일관적입니다. 사회적 바람직성 편향이 거의 없는 매우 신뢰할 수 있는 데이터입니다.' : 
                 consistencyScore >= 80 ? '비교적 신중한 고민의 흔적이 보입니다. 답변의 일관성이 평균 이상으로 확보되었습니다.' : 
                 '질문별 응답 속도 편차가 존재합니다. 상황에 따라 유연하게 대응하는 패턴일 수 있습니다.'}
              </p>
            </div>
          </div>
        </section>

        {/* ── Heatmap & Stats Summary (Google Material You style) ── */}
        <section className="grid grid-cols-2 gap-4">
          <button onClick={() => { setShowHeatmap(!showHeatmap); triggerHaptic(10); }} className="rounded-[2rem] p-5 border border-white/10 bg-white/5 backdrop-blur-3xl shadow-xl text-left hover:bg-white/10 transition-colors">
            <span className="text-2xl mb-2 block">🌡️</span>
            <p className="text-white font-black text-xs mb-1">고민 히트맵</p>
            <p className="text-white/40 text-[9px]">어떤 질문에서 멈칫했나?</p>
          </button>
          <button onClick={() => { setShowFactAttack(!showFactAttack); triggerHaptic(10); }} className="rounded-[2rem] p-5 border border-rose-500/20 bg-rose-500/10 backdrop-blur-3xl shadow-xl text-left hover:bg-rose-500/20 transition-colors">
            <span className="text-2xl mb-2 block">📸</span>
            <p className="text-rose-200 font-black text-xs mb-1">팩폭 스크린샷 존</p>
            <p className="text-rose-200/50 text-[9px]">친구에게 공격하기</p>
          </button>
        </section>

      </div>

      {/* ── Floating Share Button (Apple Fluid style) ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-[400px] z-40">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { triggerHaptic(20); setIsShareOpen(true); }}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-full font-black text-base shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/20"
          style={{ background: `linear-gradient(90deg, ${cardTheme.from}, ${cardTheme.to})`, color: 'white' }}
        >
          <Share2 size={20} /> 결과 공유하고 자랑하기
        </motion.button>
      </div>

      {/* 📸 SHARE BOTTOM SHEET (Instagram Style) */}
      <AnimatePresence>
        {isShareOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsShareOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(e, info) => { if (info.offset.y > 100) setIsShareOpen(false); }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-white/10 rounded-t-[2.5rem] z-50 p-6 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              <h3 className="text-white font-black text-lg mb-6 text-center">어떻게 공유할까요?</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <SnsExportButton surveyName={survey.name} surveyColor={survey.color} resultData={resultData} compact />
                <button onClick={() => { handleKakaoShare(); setIsShareOpen(false); }} className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 hover:bg-yellow-400/20 transition-all">
                  <span className="text-2xl">💬</span>
                  <span className="text-xs font-black">카카오톡</span>
                </button>
                <button onClick={() => { handleTwitterShare(); setIsShareOpen(false); }} className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all">
                  <span className="text-2xl font-black">𝕏</span>
                  <span className="text-xs font-black">트위터</span>
                </button>
                <button onClick={() => { handleCopyLink(); setIsShareOpen(false); }} className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
                  <LinkIcon size={24} />
                  <span className="text-xs font-black">링크 복사</span>
                </button>
              </div>

              <div className="p-4 rounded-3xl bg-white/5 border border-white/10">
                <p className="text-white/50 text-[10px] font-black uppercase mb-2">🔥 추천 바이럴 문구</p>
                <p className="text-white text-xs font-bold leading-relaxed mb-3">{VIRAL_PHRASES[phraseIdx](resultData.persona)}</p>
                <div className="flex gap-2">
                  <button onClick={handleCopyPhrase} className="flex-1 py-2 bg-white/10 rounded-full text-[10px] font-bold text-white">복사</button>
                  <button onClick={() => { triggerHaptic(10); setPhraseIdx(i => (i + 1) % VIRAL_PHRASES.length); }} className="flex-1 py-2 bg-white/10 rounded-full text-[10px] font-bold text-white">바꾸기 🔀</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ⚙️ SETTINGS BOTTOM SHEET */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} onDragEnd={(e, info) => { if (info.offset.y > 100) setIsSettingsOpen(false); }}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-white/10 rounded-t-[2.5rem] z-50 p-6 max-h-[85vh] overflow-y-auto hide-scrollbar"
            >
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black text-lg">포토카드 커스텀</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-white/10 rounded-full text-white"><X size={16}/></button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-white/50 text-[10px] font-black uppercase mb-3">테마 컬러</p>
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {CARD_THEMES.map((theme, i) => (
                      <button key={i} onClick={() => { triggerHaptic(10); setThemeIdx(i); }} className="shrink-0 transition-all rounded-full border-2" style={{ width: themeIdx === i ? '40px' : '32px', height: themeIdx === i ? '40px' : '32px', background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`, borderColor: themeIdx === i ? 'white' : 'transparent', boxShadow: themeIdx === i ? `0 0 15px ${theme.from}` : 'none' }} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-white/50 text-[10px] font-black uppercase mb-3">배경 패턴</p>
                  <div className="flex gap-2 flex-wrap">
                    {CARD_PATTERNS.map((p, i) => (
                      <button key={i} onClick={() => { triggerHaptic(10); setPatternIdx(i); }} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${patternIdx === i ? 'bg-white text-black border-white' : 'bg-white/10 text-white/70 border-white/10'}`}>{p.name}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { triggerHaptic(10); setCardDark(!cardDark); }} className="p-4 rounded-3xl bg-white/5 border border-white/10 text-white font-bold text-xs flex flex-col items-center gap-2">
                    <span className="text-xl">{cardDark ? '🌙' : '☀️'}</span> {cardDark ? '다크 모드' : '라이트 모드'}
                  </button>
                  <button onClick={() => { triggerHaptic(10); setCardFormat(f => f === '9:16' ? '1:1' : '9:16'); }} className="p-4 rounded-3xl bg-white/5 border border-white/10 text-white font-bold text-xs flex flex-col items-center gap-2">
                    <span className="text-xl">{cardFormat === '9:16' ? '📱' : '⬜'}</span> {cardFormat === '9:16' ? '스토리 비율' : '피드 비율'}
                  </button>
                  <button onClick={() => { triggerHaptic(10); setShowQR(!showQR); }} className={`p-4 rounded-3xl border text-white font-bold text-xs flex flex-col items-center gap-2 ${showQR ? 'bg-white/20 border-white/30' : 'bg-white/5 border-white/10'}`}>
                    <span className="text-xl">🔳</span> QR코드 추가
                  </button>
                  <button onClick={() => { triggerHaptic(10); setLang(l => l === 'ko' ? 'en' : 'ko'); }} className="p-4 rounded-3xl bg-white/5 border border-white/10 text-white font-bold text-xs flex flex-col items-center gap-2">
                    <span className="text-xl">🌐</span> {lang === 'ko' ? '한국어' : 'English'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
