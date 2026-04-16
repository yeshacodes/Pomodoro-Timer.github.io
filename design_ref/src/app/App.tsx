import { useState, useEffect } from 'react';
import { PomodoroTimer } from './components/PomodoroTimer';
import { AnimatedBackground } from './components/AnimatedBackground';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [mode, setMode] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const getBackgroundClass = () => {
    if (isDark) {
      switch (mode) {
        case 'focus':
          return 'bg-gradient-to-br from-rose-950 via-purple-950 to-slate-900';
        case 'shortBreak':
          return 'bg-gradient-to-br from-blue-950 via-cyan-950 to-slate-900';
        case 'longBreak':
          return 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900';
      }
    } else {
      switch (mode) {
        case 'focus':
          return 'bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100';
        case 'shortBreak':
          return 'bg-gradient-to-br from-blue-100 via-cyan-100 to-sky-100';
        case 'longBreak':
          return 'bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100';
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 relative overflow-hidden ${getBackgroundClass()}`}>
      <AnimatedBackground mode={mode} isDark={isDark} />
      <PomodoroTimer isDark={isDark} setIsDark={setIsDark} mode={mode} setMode={setMode} />
    </div>
  );
}