import { SurveyConfig } from '../types';
import { ArrowLeft, Clock, BookOpen, Tag, ChevronRight } from 'lucide-react';
import { themeMap } from '../theme';
import { blogPosts } from '../data/blogPosts';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

interface SurveyIntroProps {
  survey: SurveyConfig;
  onBack: () => void;
  onStart: (mode: number) => void;
}

export const SurveyIntro = ({ survey, onBack, onStart }: SurveyIntroProps) => {
  const t = themeMap[survey.color] || themeMap['blue'];
  const post = blogPosts[survey.id];
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const headerY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const triggerHaptic = (pattern: number | number[]) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const handleStart = (mode: number) => {
    triggerHaptic([20, 40]);
    onStart(mode);
  };

  return (
    <article ref={containerRef} className="min-h-[100dvh] bg-brand-bg flex flex-col relative">
      {/* ── Apple-style Parallax Hero Header ── */}
      <motion.header 
        style={{ y: headerY, opacity: headerOpacity }}
        className="relative overflow-hidden pt-16 pb-12 px-6 bg-brand-card rounded-b-[3rem] border-b border-white/5 z-10"
      >
        <div className={`absolute inset-0 ${t.bgBg} opacity-10`} />
        
        <button
          onClick={() => { triggerHaptic(10); onBack(); }}
          className="relative z-10 flex items-center gap-1.5 text-brand-text-muted hover:text-brand-text mb-8 text-xs font-bold uppercase tracking-wider transition-colors active:scale-95"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-5 ${t.bgBg} ${t.text} border ${t.border}`}
          >
            {survey.name}
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-brand-text mb-4 leading-tight word-keep tracking-tight"
          >
            {survey.title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-brand-text-muted text-lg leading-relaxed word-keep font-medium"
          >
            {survey.subtitle}
          </motion.p>
        </div>
      </motion.header>

      {/* ── Google Material You Smart Buttons ── */}
      <div className="px-5 -mt-6 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
          className="bg-brand-card/80 backdrop-blur-2xl border border-white/5 rounded-[2rem] p-3 shadow-2xl"
        >
          <div className="space-y-2">
            {[
              { m: 30, t: '30 문항', d: '핵심 성향 파악 · 약 3분' },
              { m: 70, t: '70 문항', d: '심층 가치관 분석 · 약 7분' }
            ].map(b => (
              <motion.button
                key={b.m} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => handleStart(b.m)}
                className="w-full flex items-center justify-between px-5 py-4 rounded-[1.5rem] bg-brand-bg hover:bg-brand-bg/80 transition-colors border border-white/5"
              >
                <div className="text-left">
                  <p className="text-brand-text font-black text-sm">{b.t}</p>
                  <p className="text-brand-text-muted text-[11px] font-bold mt-0.5">{b.d}</p>
                </div>
                <ChevronRight size={16} className="text-brand-text-muted/40" />
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => handleStart(120)}
              className="w-full relative overflow-hidden flex items-center justify-between px-5 py-4 rounded-[1.5rem] bg-brand-primary transition-colors border border-white/5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="text-left relative z-10">
                <p className="text-white font-black text-sm flex items-center gap-1.5">120 문항 <span className="text-[10px] bg-brand-accent text-brand-bg px-2 py-0.5 rounded-full">PRO</span></p>
                <p className="text-white/60 text-[11px] font-bold mt-0.5">최고 해상도 정밀 진단 · 약 12분</p>
              </div>
              <ChevronRight size={16} className="text-white/40 relative z-10" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ── Magazine Style Blog Content (SEO / AdSense) ── */}
      {post && (
        <div className="flex-1 px-6 py-12 relative z-0">
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-brand-text-muted font-bold mb-10 pb-5 border-b border-white/5">
            <span className="flex items-center gap-1.5"><Clock size={12} /> {post.readTime}</span>
            <span className="flex items-center gap-1.5"><BookOpen size={12} /> {survey.id === 'burnout' ? '번아웃 칼럼' : 'MZ 직무 칼럼'}</span>
          </div>

          <div className="space-y-16">
            {post.sections.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, rotateX: 25, y: 40 }}
                whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, type: 'spring', bounce: 0.2 }}
                style={{ transformOrigin: 'top center' }}
              >
                <h2 className="text-2xl font-black text-brand-text mb-5 leading-snug word-keep flex flex-col gap-3">
                  <span className="text-4xl">{section.emoji}</span>
                  {section.heading}
                </h2>
                <p className="text-brand-text-muted text-[15px] leading-[1.8] word-keep font-medium">
                  {section.body}
                </p>
                {section.highlight && (
                  <motion.blockquote 
                    whileHover={{ scale: 1.02, x: 10 }}
                    className={`mt-6 p-5 rounded-2xl bg-brand-card border-l-4 ${t.border} shadow-sm`}
                  >
                    <p className={`font-black text-[15px] italic leading-relaxed word-keep ${t.text}`}>
                      "{section.highlight}"
                    </p>
                  </motion.blockquote>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mt-16 pt-10 border-t border-white/5">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-text-muted mb-6">
              <Tag size={12} /> 발견할 수 있는 페르소나
            </div>
            <div className="flex flex-wrap gap-2">
              {post.relatedPersonas.map((persona, idx) => (
                <span key={idx} className="px-4 py-2 bg-brand-card border border-white/5 rounded-full text-xs font-bold text-brand-text shadow-sm">
                  {persona}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
