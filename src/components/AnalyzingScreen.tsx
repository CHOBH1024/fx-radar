import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { themeMap } from '../theme';
import { playSwooshSound } from '../utils/audioEngine';

interface AnalyzingScreenProps {
  color: string;
  onComplete: () => void;
}

export const AnalyzingScreen = ({ color, onComplete }: AnalyzingScreenProps) => {
  const [step, setStep] = useState(0);
  const [glitchText, setGlitchText] = useState("");
  const t = themeMap[color] || themeMap['blue'];

  const messages = [
    "동공 지진 패턴 스캔 중...",
    "숨겨진 무의식 도파민 추출 중...",
    "팩트 폭행 데이터베이스 대조...",
    "당신의 진짜 흑염룡 소환 중...",
    "인스타 업로드용 카드 굽는 중..."
  ];

  const randomHashtags = ["#팩트폭행", "#MBTI과몰입", "#뼈때림", "#소름", "#내얘기", "#도파민", "#성향테스트", "#갓생", "#망생"];

  useEffect(() => {
    playSwooshSound();

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < messages.length) {
        setStep(currentStep);
      }
    }, 1000);

    // Glitch effect loop
    const glitchInterval = setInterval(() => {
      setGlitchText(randomHashtags[Math.floor(Math.random() * randomHashtags.length)]);
    }, 150);

    const totalTime = messages.length * 1000 + 500;
    const timeout = setTimeout(() => {
      onComplete();
    }, totalTime);

    return () => {
      clearInterval(interval);
      clearInterval(glitchInterval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-950 text-white relative overflow-hidden insta-gradient animate-gradient-xy">
      {/* Intense Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] max-w-[800px] max-h-[800px] ${t.bgBg} rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse`}></div>
      
      {/* Scanning Laser Line */}
      <motion.div 
        className="absolute left-0 w-full h-[2px] bg-white shadow-[0_0_20px_rgba(255,255,255,1)] z-0 mix-blend-overlay"
        animate={{ top: ['-10%', '110%'] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
      />

      <div className="z-10 w-full max-w-sm text-center bg-black/40 p-8 rounded-[3rem] backdrop-blur-2xl border border-white/20 shadow-2xl relative overflow-hidden">
        
        {/* Rapid Glitch Text Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none overflow-hidden">
          <span className="text-[120px] font-black leading-none break-all">{glitchText.repeat(10)}</span>
        </div>

        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ rotate: { repeat: Infinity, duration: 3, ease: "linear" }, scale: { repeat: Infinity, duration: 0.8 } }}
          className={`w-24 h-24 border-y-4 border-l-4 border-transparent border-t-white border-l-white rounded-full mx-auto mb-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]`}
        >
          <div className={`w-full h-full rounded-full border-r-4 border-b-4 border-transparent border-r-${color}-400 border-b-${color}-400 animate-spin-reverse`}></div>
        </motion.div>
        
        <h2 className="text-4xl font-black mb-8 tracking-widest text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/0 drop-shadow-lg">
          ANALYZING
        </h2>
        
        <div className="h-16 relative flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
              className="text-white text-xl font-bold absolute text-center w-full break-keep drop-shadow-md"
            >
              {messages[step]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Dynamic Progress Indicator */}
        <div className="w-full h-2 bg-white/10 rounded-full mt-8 overflow-hidden shadow-inner relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / messages.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "anticipate" }}
            className={`h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] relative`}
          >
            <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/50 blur-[2px] animate-pulse"></div>
          </motion.div>
        </div>

        {/* Glitchy Hashtag Feed */}
        <div className="mt-6 h-6 overflow-hidden flex justify-center items-center">
          <span className="text-white/50 font-black tracking-widest text-sm uppercase">{glitchText}</span>
        </div>
      </div>
    </div>
  );
};
