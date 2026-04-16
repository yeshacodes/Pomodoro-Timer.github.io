import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Moon, Sun, Check, Trash2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BreathingCircle } from './BreathingCircle';

type Mode = 'focus' | 'shortBreak' | 'longBreak';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface PomodoroTimerProps {
  isDark: boolean;
  setIsDark: (value: boolean) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const TIMER_DURATIONS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const MODE_COLORS = {
  focus: {
    light: {
      button: 'bg-gradient-to-r from-pink-400 to-rose-500 text-white shadow-lg hover:shadow-rose-400/50',
      buttonInactive: 'bg-white/50 text-rose-600 hover:bg-white/80',
      accent: 'text-rose-600',
      accentLight: 'text-rose-500',
      ring: 'focus:ring-rose-400',
      gradientStart: '#ec4899',
      gradientEnd: '#f43f5e',
    },
    dark: {
      button: 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg hover:shadow-rose-500/50',
      buttonInactive: 'bg-slate-700/50 text-rose-200 hover:bg-slate-700',
      accent: 'text-rose-200',
      accentLight: 'text-rose-300',
      ring: 'focus:ring-rose-500',
      gradientStart: '#ec4899',
      gradientEnd: '#f43f5e',
    },
  },
  shortBreak: {
    light: {
      button: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg hover:shadow-cyan-400/50',
      buttonInactive: 'bg-white/50 text-cyan-600 hover:bg-white/80',
      accent: 'text-cyan-600',
      accentLight: 'text-cyan-500',
      ring: 'focus:ring-cyan-400',
      gradientStart: '#3b82f6',
      gradientEnd: '#06b6d4',
    },
    dark: {
      button: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-cyan-500/50',
      buttonInactive: 'bg-slate-700/50 text-cyan-200 hover:bg-slate-700',
      accent: 'text-cyan-200',
      accentLight: 'text-cyan-300',
      ring: 'focus:ring-cyan-500',
      gradientStart: '#3b82f6',
      gradientEnd: '#06b6d4',
    },
  },
  longBreak: {
    light: {
      button: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg hover:shadow-emerald-400/50',
      buttonInactive: 'bg-white/50 text-emerald-600 hover:bg-white/80',
      accent: 'text-emerald-600',
      accentLight: 'text-emerald-500',
      ring: 'focus:ring-emerald-400',
      gradientStart: '#10b981',
      gradientEnd: '#34d399',
    },
    dark: {
      button: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-emerald-500/50',
      buttonInactive: 'bg-slate-700/50 text-emerald-200 hover:bg-slate-700',
      accent: 'text-emerald-200',
      accentLight: 'text-emerald-300',
      ring: 'focus:ring-emerald-500',
      gradientStart: '#10b981',
      gradientEnd: '#34d399',
    },
  },
};

export function PomodoroTimer({ isDark, setIsDark, mode, setMode }: PomodoroTimerProps) {
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const intervalRef = useRef<number | null>(null);

  const colors = isDark ? MODE_COLORS[mode].dark : MODE_COLORS[mode].light;

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Auto-switch modes when timer completes
      if (mode === 'focus') {
        setMode('shortBreak');
        setTimeLeft(TIMER_DURATIONS.shortBreak);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, mode, setMode]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setTimeLeft(TIMER_DURATIONS[newMode]);
    setIsRunning(false);
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_DURATIONS[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const progress = ((TIMER_DURATIONS[mode] - timeLeft) / TIMER_DURATIONS[mode]) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">
        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-3 rounded-full transition-all duration-300 ${
              isDark
                ? 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/30'
                : 'bg-white/50 text-purple-600 hover:bg-white/70 shadow-md'
            }`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Main Timer Card */}
        <div
          className={`rounded-3xl p-8 md:p-12 mb-6 transition-all duration-300 ${
            isDark
              ? 'bg-slate-800/50 backdrop-blur-lg shadow-2xl border border-purple-500/20'
              : 'bg-white/70 backdrop-blur-lg shadow-2xl'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className={`text-3xl md:text-4xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}
            >
              🍅 Pomodoro Timer
            </h1>
            <p className={`text-sm ${colors.accent} transition-colors duration-700`}>
              Stay focused and productive!
            </p>
          </div>

          {/* Mode Buttons */}
          <div className="flex gap-3 mb-8 justify-center flex-wrap">
            <button
              onClick={() => handleModeChange('focus')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                mode === 'focus'
                  ? isDark
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                    : 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg scale-105'
                  : isDark
                  ? 'bg-slate-700/50 text-purple-200 hover:bg-slate-700'
                  : 'bg-white/50 text-purple-600 hover:bg-white/80'
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => handleModeChange('shortBreak')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                mode === 'shortBreak'
                  ? isDark
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                    : 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white shadow-lg scale-105'
                  : isDark
                  ? 'bg-slate-700/50 text-purple-200 hover:bg-slate-700'
                  : 'bg-white/50 text-purple-600 hover:bg-white/80'
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => handleModeChange('longBreak')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                mode === 'longBreak'
                  ? isDark
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                    : 'bg-gradient-to-r from-green-400 to-emerald-400 text-white shadow-lg scale-105'
                  : isDark
                  ? 'bg-slate-700/50 text-purple-200 hover:bg-slate-700'
                  : 'bg-white/50 text-purple-600 hover:bg-white/80'
              }`}
            >
              Long Break
            </button>
          </div>

          {/* Timer Display */}
          <div className="relative mb-8">
            <BreathingCircle mode={mode} isDark={isDark} isActive={isRunning} />
            
            {/* Progress Ring */}
            <motion.svg 
              key={mode}
              className="w-full max-w-sm mx-auto" 
              viewBox="0 0 200 200"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(255, 255, 255, 0.5)'}
                strokeWidth="8"
              />
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={
                  mode === 'focus'
                    ? isDark
                      ? 'url(#gradient-focus-dark)'
                      : 'url(#gradient-focus)'
                    : mode === 'shortBreak'
                    ? isDark
                      ? 'url(#gradient-short-dark)'
                      : 'url(#gradient-short)'
                    : isDark
                    ? 'url(#gradient-long-dark)'
                    : 'url(#gradient-long)'
                }
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 90}`}
                strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                transform="rotate(-90 100 100)"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient-focus" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="gradient-focus-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="gradient-short" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="gradient-short-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="gradient-long" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
                <linearGradient id="gradient-long-dark" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
            </motion.svg>

            {/* Time Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div
                  className={`text-5xl md:text-6xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {formatTime(timeLeft)}
                </div>
                <div
                  className={`text-sm mt-2 ${isDark ? 'text-purple-200' : 'text-purple-600'}`}
                >
                  {mode === 'focus' ? '🎯 Focus Time' : mode === 'shortBreak' ? '☕ Short Break' : '🌴 Long Break'}
                </div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handlePlayPause}
              className={`p-4 rounded-full transition-all duration-700 hover:scale-110 ${colors.button}`}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
            <button
              onClick={handleReset}
              className={`p-4 rounded-full transition-all duration-300 hover:scale-110 ${
                isDark
                  ? 'bg-slate-700 text-purple-200 hover:bg-slate-600'
                  : 'bg-white text-purple-600 hover:bg-purple-50 shadow-md'
              }`}
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tasks Card */}
        <div
          className={`rounded-3xl p-8 transition-all duration-300 ${
            isDark
              ? 'bg-slate-800/50 backdrop-blur-lg shadow-2xl border border-purple-500/20'
              : 'bg-white/70 backdrop-blur-lg shadow-2xl'
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-6 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}
          >
            ✨ Tasks
          </h2>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="What needs to get done?"
                className={`flex-1 px-4 py-3 rounded-full outline-none transition-all duration-700 ${
                  isDark
                    ? `bg-slate-700 text-white placeholder-slate-400 ${colors.ring}`
                    : `bg-white text-gray-800 placeholder-gray-400 ${colors.ring}`
                }`}
              />
              <button
                type="submit"
                className={`p-3 rounded-full transition-all duration-700 hover:scale-110 ${colors.button}`}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Task List */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {tasks.length === 0 ? (
              <p className={`text-center py-8 transition-colors duration-700 ${colors.accentLight}`}>
                No tasks yet. Add one to get started! 🚀
              </p>
            ) : (
              <AnimatePresence mode="popLayout">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -100, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 ${
                      isDark
                        ? 'bg-slate-700/50 hover:bg-slate-700'
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                  >
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleTask(task.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-700 ${
                        task.completed
                          ? mode === 'focus'
                            ? isDark
                              ? 'bg-rose-500 border-rose-500'
                              : 'bg-rose-400 border-rose-400'
                            : mode === 'shortBreak'
                            ? isDark
                              ? 'bg-cyan-500 border-cyan-500'
                              : 'bg-cyan-400 border-cyan-400'
                            : isDark
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-emerald-400 border-emerald-400'
                          : mode === 'focus'
                          ? isDark
                            ? 'border-rose-400 hover:border-rose-300'
                            : 'border-rose-300 hover:border-rose-400'
                          : mode === 'shortBreak'
                          ? isDark
                            ? 'border-cyan-400 hover:border-cyan-300'
                            : 'border-cyan-300 hover:border-cyan-400'
                          : isDark
                          ? 'border-emerald-400 hover:border-emerald-300'
                          : 'border-emerald-300 hover:border-emerald-400'
                      }`}
                    >
                      {task.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                    <span
                      className={`flex-1 transition-colors duration-300 ${
                        task.completed
                          ? colors.accentLight + ' line-through'
                          : isDark
                          ? 'text-white'
                          : 'text-gray-800'
                      }`}
                    >
                      {task.text}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteTask(task.id)}
                      className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${
                        isDark
                          ? 'text-purple-300 hover:bg-slate-600 hover:text-pink-400'
                          : 'text-purple-400 hover:bg-purple-100 hover:text-pink-500'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}