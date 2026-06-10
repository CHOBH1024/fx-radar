import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSwipeable } from 'react-swipeable';
import { SurveyConfig, AnswerData } from '../types';
import { themeMap } from '../theme';
import { playPopSound } from '../utils/audioEngine';
import { ArrowLeft } from 'lucide-react';

interface SurveyEngineProps {
  survey: SurveyConfig;
  modeLimit: number;
  onComplete: (answers: Record<number, AnswerData>) => void;
}

export const SurveyEngine = ({ survey, modeLimit, onComplete }: SurveyEngineProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerData>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  
  const t = themeMap[survey.color] || themeMap['blue'];

  const actualLimit = Math.min(modeLimit, survey.questions.length);
  
  const activeQuestions = useMemo(() => {
    return survey.questions.slice(0, Math.max(actualLimit, 1));
  }, [survey.questions, actualLimit]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIdx]);

  // 키보드 단축키: 숫자 1-5 = 답변, 스페이스바 = 뒤로가기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (currentIdx > 0) { setDirection(-1); setCurrentIdx(prev => prev - 1); }
        return;
      }
      const num = parseInt(e.key);
      if (isNaN(num) || num < 1 || num > 5) return;
      const q = activeQuestions[currentIdx];
      if (!q) return;
      const latencyMs = Date.now() - questionStartTime;
      playPopSound();
      const val = q.t === 'V' ? (num === 1 ? 1 : 5) : num;
      if (q.t === 'V' && num > 2) return;
      const newAnswers = { ...answers, [currentIdx]: { value: val, latencyMs } };
      setAnswers(newAnswers);
      setTimeout(() => {
        if (currentIdx < activeQuestions.length - 1) {
          setDirection(1); setCurrentIdx(currentIdx + 1);
        } else { onComplete(newAnswers); }
      }, 250);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, activeQuestions, answers, questionStartTime, onComplete]);

  if (activeQuestions.length === 0 || !activeQuestions[0]) {
    return <div className="text-center py-24 text-slate-400">Loading...</div>;
  }

  const question = activeQuestions[currentIdx];
  const isDilemma = question.t === 'V';
  
  const triggerHaptic = (pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const goToNext = () => {
    if (currentIdx < activeQuestions.length - 1) {
      setDirection(1);
      setCurrentIdx(prev => prev + 1);
      triggerHaptic(10);
    }
  };

  const goToPrev = () => {
    if (currentIdx > 0) {
      setDirection(-1);
      setCurrentIdx(prev => prev - 1);
      triggerHaptic([10, 30, 10]);
    }
  };
  
  const submitAnswer = (val: number) => {
    playPopSound();
    triggerHaptic([20]); // Crisp tap vibration
    const latencyMs = Date.now() - questionStartTime;
    const newAnswers = { ...answers, [currentIdx]: { value: val, latencyMs } };
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (currentIdx < activeQuestions.length - 1) {
        setDirection(1);
        setCurrentIdx(currentIdx + 1);
      } else {
        triggerHaptic([30, 50, 30, 50, 50]); // Success vibration
        onComplete(newAnswers);
      }
    }, 250); // Fast snappy transition
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrev,
    trackMouse: true,
  });

  // Animation variants for Apple-like fluid spring
  const variants: any = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)',
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: { type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
      filter: 'blur(10px)',
      transition: { type: 'spring', stiffness: 300, damping: 25, mass: 0.8 }
    })
  };

  return (
    <div 
      {...swipeHandlers}
      className="relative min-h-[100dvh] flex flex-col overflow-hidden bg-black touch-none select-none"
    >
      {/* Dynamic Background Blur (Apple Glassmorphism + Material You Tint) */}
      <div className={`absolute inset-0 ${t.bg} opacity-20`} />
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent mix-blend-overlay"
        animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
        transition={{ repeat: Infinity, duration: 10, repeatType: "reverse" }}
      />

      {/* 📸 Instagram Story-like Segmented Progress Bar */}
      <div className="absolute top-0 left-0 right-0 px-3 pt-5 flex gap-1 z-50">
        {activeQuestions.map((_, idx) => {
          let state = 'unseen';
          if (idx < currentIdx) state = 'seen';
          if (idx === currentIdx) state = 'active';

          return (
            <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
              {state === 'seen' && <div className="w-full h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-full" />}
              {state === 'active' && (
                <motion.div 
                  className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] rounded-full origin-left" 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: answers[idx] ? 1 : 0.2 }} // 0.2 represents thinking state
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Header Info */}
      <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          {currentIdx > 0 ? (
            <button 
              onClick={goToPrev}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <div className={`w-10 h-10 rounded-full ${t.bgBg} border border-white/30 flex items-center justify-center text-xs shadow-[0_0_15px_rgba(255,255,255,0.3)]`}>
              {survey.name[0]}
            </div>
          )}
          <span className="text-white font-bold text-sm drop-shadow-md ml-1">{survey.name}</span>
        </div>
        <span className="text-white/50 text-xs font-semibold">{currentIdx + 1} / {activeQuestions.length}</span>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex flex-col relative z-10 pt-20 pb-12 px-5" style={{ perspective: 1200 }}>
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div 
            key={currentIdx}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="flex-1 flex flex-col justify-center w-full h-full"
          >
            {/* The Glass Card */}
            <div className="w-full flex-1 max-h-[70vh] rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10">
              
              {/* Inner Glow */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[50%] ${t.bgBg} opacity-20 blur-[80px] rounded-full pointer-events-none`} />

              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`inline-block mb-8 text-[11px] font-black tracking-[0.2em] uppercase py-1.5 px-4 rounded-full border border-white/10 text-white/80 bg-black/20`}
              >
                Question {currentIdx + 1}
              </motion.span>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-3xl md:text-4xl font-black text-white leading-snug mb-12 word-keep drop-shadow-lg"
              >
                {question.q}
              </motion.h2>
              
              {isDilemma ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-full flex flex-col gap-4"
                >
                  <button onClick={() => submitAnswer(1)} className="group relative w-full p-6 rounded-[2rem] bg-white/5 hover:bg-white/15 border border-white/10 backdrop-blur-lg transition-all text-center flex flex-col items-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="block text-white font-black text-xl mb-1">{question.left}</span>
                    <span className="text-white/60 text-xs font-bold">{question.descL}</span>
                  </button>
                  <button onClick={() => submitAnswer(5)} className="group relative w-full p-6 rounded-[2rem] bg-white/5 hover:bg-white/15 border border-white/10 backdrop-blur-lg transition-all text-center flex flex-col items-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span className="block text-white font-black text-xl mb-1">{question.right}</span>
                    <span className="text-white/60 text-xs font-bold">{question.descR}</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="w-full mt-auto"
                >
                  <div className="flex justify-between text-sm font-black text-white/60 px-2 mb-4">
                    <span>전혀 아니다</span>
                    <span>매우 그렇다</span>
                  </div>
                  <div className="flex gap-2 md:gap-3">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <motion.button 
                        key={val} 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => submitAnswer(val)} 
                        className={`flex-1 h-14 md:h-16 flex items-center justify-center bg-white/5 hover:bg-white/90 border border-white/10 rounded-2xl font-black text-xl md:text-2xl text-white hover:text-black transition-all shadow-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] relative overflow-hidden`}
                      >
                        {/* Material You Ripple Effect Placeholder */}
                        <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity" />
                        {val}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Invisible Tap zones for Instagram Story feel */}
      <div className="absolute inset-y-0 left-0 w-1/4 z-20 cursor-pointer" onClick={goToPrev} />
      {/* We don't put one on the right to force them to answer, but they can swipe right to skip if implemented. */}
    </div>
  );
};
