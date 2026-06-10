import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Instagram, Loader2, Download } from 'lucide-react';
import { themeMap } from '../theme';

interface SnsExportButtonProps {
  surveyName: string;
  surveyColor: string;
  resultData: any;
  compact?: boolean; // Feature 6: compact mode for grid layout
}

export const SnsExportButton = ({ surveyName, surveyColor, resultData, compact = false }: SnsExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const hiddenCardRef = useRef<HTMLDivElement>(null);
  const t = themeMap[surveyColor] || themeMap['blue'];

  const handleExport = async () => {
    // Try to capture the visible photocard first
    const photocardEl = document.getElementById('insta-photocard');
    const target = photocardEl || hiddenCardRef.current;
    if (!target) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(target, {
        scale: 3, // High resolution for mobile screens (Feature 6)
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Blob generation failed');
        
        const file = new File([blob], `MZRadar_${surveyName}.png`, { type: 'image/png' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: '나의 MZ 레이더 결과',
              text: `나는 "${resultData.persona}" 유형! 당신도 해봐요 👉 fx-radar1024.vercel.app`,
              files: [file]
            });
          } catch (shareError) {
            // User cancelled, fallback to download
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Failed to export SNS image', error);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  // Compact mode for grid layout
  if (compact) {
    return (
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-gradient-to-br from-pink-600/40 to-purple-600/40 border border-pink-500/30 text-pink-300 hover:from-pink-600/60 hover:to-purple-600/60 transition-all active:scale-95 disabled:opacity-50"
      >
        {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Instagram size={20} />}
        <span className="text-[9px] font-bold">{isExporting ? '굽는중...' : '인스타'}</span>
      </button>
    );
  }

  return (
    <>
      <button 
        onClick={handleExport} 
        disabled={isExporting}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 text-white rounded-full text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-500/30 hover:scale-105"
      >
        {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Instagram size={18} />}
        {isExporting ? '이미지 굽는 중...' : '인스타 공유하기'}
      </button>

      {/* Hidden 9:16 Canvas Target */}
      <div className="overflow-hidden h-0 w-0 absolute opacity-0 pointer-events-none">
        <div 
          ref={hiddenCardRef} 
          className="bg-slate-900 text-white flex flex-col items-center justify-center relative"
          style={{ width: '1080px', height: '1920px', padding: '120px 80px' }}
        >
          <div className={`absolute top-0 left-0 w-full h-8 ${t.bg}`}></div>
          <div className={`absolute -top-[20%] -left-[20%] w-[80%] h-[50%] ${t.bgBg} rounded-full blur-[200px] opacity-30`}></div>
          
          <div className="z-10 w-full flex flex-col items-center h-full justify-between">
            <div className="text-center w-full">
              <span className={`px-6 py-2 rounded-full ${t.bgBg} ${t.text} text-2xl font-bold tracking-widest uppercase mb-12 inline-block border ${t.border}`}>
                MZ RADAR : {surveyName}
              </span>
            </div>
            <div className="text-center mb-16">
              <div style={{ fontSize: '200px', lineHeight: 1 }}>{resultData.emoji}</div>
              <h1 className="text-[100px] font-black text-white mb-6 leading-tight">{resultData.persona}</h1>
              <p className="text-4xl text-slate-300 font-bold">{resultData.headline}</p>
            </div>
            <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[3rem] mb-12 shadow-2xl">
              <h3 className={`text-3xl font-black mb-6 ${t.text}`}>🔥 핵심 강점</h3>
              <ul className="space-y-4">
                {resultData.strengths.slice(0, 3).map((s: string, i: number) => (
                  <li key={i} className="text-3xl text-slate-100 flex gap-4"><span>✔</span> {s}</li>
                ))}
              </ul>
            </div>
            <div className="w-full flex justify-between items-center px-4">
              <div className="text-slate-400 text-2xl font-bold">@FXRadar</div>
              <div className="text-slate-400 text-2xl">fx-radar1024.vercel.app</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
