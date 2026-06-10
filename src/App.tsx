import { useState, Suspense, lazy } from 'react';
import { SurveyIntro } from './components/SurveyIntro';
import { SurveyEngine } from './components/SurveyEngine';
import { AnalyzingScreen } from './components/AnalyzingScreen';
import { SurveyConfig, AnswerData } from './types';
import { surveys } from './data/surveys';

const SurveyResults = lazy(() => import('./components/SurveyResults').then(m => ({ default: m.SurveyResults })));

type AppState = 'intro' | 'engine' | 'analyzing' | 'results';

export default function App() {
  const survey: SurveyConfig = surveys[0];
  const [appState, setAppState] = useState<AppState>('intro');
  const [modeLimit, setModeLimit] = useState<number>(30);
  const [answers, setAnswers] = useState<Record<number, AnswerData>>({});

  const handleStart = (limit: number) => { setModeLimit(limit); setAppState('engine'); };
  const handleComplete = (a: Record<number, AnswerData>) => { setAnswers(a); setAppState('analyzing'); };
  const handleRestart = () => { setAnswers({}); setAppState('intro'); };
  const handleHome = () => { setAnswers({}); setAppState('intro'); };

  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-slate-500 font-semibold tracking-widest animate-pulse">LOADING...</div>}>
        {appState === 'intro' && (
          <SurveyIntro survey={survey} onBack={handleHome} onStart={handleStart} />
        )}
        {appState === 'engine' && (
          <SurveyEngine survey={survey} modeLimit={modeLimit} onComplete={handleComplete} />
        )}
        {appState === 'analyzing' && (
          <AnalyzingScreen color={survey.color} onComplete={() => setAppState('results')} />
        )}
        {appState === 'results' && (
          <SurveyResults survey={survey} answers={answers} onRestart={handleRestart} onHome={handleHome} />
        )}
      </Suspense>
    </div>
  );
}
