import React, { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';

const TIMER_OPTIONS = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const SESSIONS_STORAGE_KEY = 'pomodoro_sessions_completed';
const THEME_STORAGE_KEY = 'pomodoro_theme';
const TASKS_STORAGE_KEY = 'pomodoro_tasks';
const ACTIVE_TASK_STORAGE_KEY = 'pomodoro_active_task';
const SESSION_HISTORY_STORAGE_KEY = 'pomodoro_session_history';
const CIRCLE_RADIUS = 120;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const MODE_CONFIG = {
  work: {
    label: 'Focus Time',
    button: 'Focus',
    background: 'linear-gradient(135deg, #ffd3b8 0%, #ffc2cc 50%, #ffb6a3 100%)',
    accent: '#c84f39',
  },
  shortBreak: {
    label: 'Short Break',
    button: 'Short Break',
    background: 'linear-gradient(135deg, #c4e7ff 0%, #d2f3ff 50%, #bde7f9 100%)',
    accent: '#2e6f97',
  },
  longBreak: {
    label: 'Long Break',
    button: 'Long Break',
    background: 'linear-gradient(135deg, #b9d9ff 0%, #d7e7ff 50%, #c5d8ff 100%)',
    accent: '#325e9b',
  },
};

const MODE_KEYS = ['work', 'shortBreak', 'longBreak'];

const parseTasksFromStorage = (storedValue) => {
  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter((task) => typeof task?.id === 'string' && typeof task?.text === 'string')
      .map((task) => ({
        id: task.id,
        text: task.text,
        completed: Boolean(task.completed),
      }));
  } catch {
    return [];
  }
};

const parseSessionHistoryFromStorage = (storedValue) => {
  if (!storedValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(storedValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter((entry) => typeof entry === 'string' && !Number.isNaN(new Date(entry).getTime()));
  } catch {
    return [];
  }
};

const getLocalDateKey = (dateValue) => {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const localDateKeyToMs = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day).getTime();
};

function PomodoroTimer() {
  const [timerType, setTimerType] = useState('work');
  const [timeLeft, setTimeLeft] = useState(TIMER_OPTIONS.work);
  const [remainingMs, setRemainingMs] = useState(TIMER_OPTIONS.work * 1000);
  const [isActive, setIsActive] = useState(false);
  const [theme, setTheme] = useState(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === 'light' ? 'light' : 'dark';
  });
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState(() =>
    parseTasksFromStorage(localStorage.getItem(TASKS_STORAGE_KEY)),
  );
  const [activeTaskId, setActiveTaskId] = useState(() => localStorage.getItem(ACTIVE_TASK_STORAGE_KEY) ?? '');
  const [sessionsCompleted, setSessionsCompleted] = useState(() => {
    const storedValue = localStorage.getItem(SESSIONS_STORAGE_KEY);
    const parsedValue = Number.parseInt(storedValue ?? '0', 10);
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  });
  const [sessionHistory, setSessionHistory] = useState(() =>
    parseSessionHistoryFromStorage(localStorage.getItem(SESSION_HISTORY_STORAGE_KEY)),
  );

  const currentMode = MODE_CONFIG[timerType];
  const modeClass = `mode-${timerType}`;
  const themeClass = `theme-${theme}`;
  const isDarkTheme = theme === 'dark';
  const endTimeRef = useRef(null);
  const hasFiredCompletionFeedbackRef = useRef(false);
  const audioContextRef = useRef(null);

  // Keeps the countdown accurate even if timers are throttled while tab is inactive.
  useEffect(() => {
    if (!isActive) {
      endTimeRef.current = null;
      return undefined;
    }

    if (endTimeRef.current === null) {
      endTimeRef.current = Date.now() + remainingMs;
    }

    const interval = setInterval(() => {
      const remainingMs = endTimeRef.current - Date.now();
      const safeRemainingMs = Math.max(0, remainingMs);
      const nextTimeLeft = Math.max(0, Math.ceil(safeRemainingMs / 1000));
      setRemainingMs(safeRemainingMs);
      setTimeLeft(nextTimeLeft);
    }, 250);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (timeLeft > 0) {
      hasFiredCompletionFeedbackRef.current = false;
    }
  }, [timeLeft, timerType]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }

    if (Notification.permission === 'granted' || Notification.permission === 'denied') {
      return Notification.permission;
    }

    try {
      return await Notification.requestPermission();
    } catch {
      return 'default';
    }
  };

  const showCompletionNotification = (completedMode) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const message =
      completedMode === 'work' ? "Time's up! Take a break" : 'Back to work!';

    new Notification(message);
  };

  const playCompletionSound = async () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }

    const context = audioContextRef.current;
    if (context.state === 'suspended') {
      await context.resume();
    }

    // Short, subtle two-tone beep.
    const now = context.currentTime;
    const beep = (start, frequency) => {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.0001, start);
      gainNode.gain.exponentialRampToValueAtTime(0.1, start + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.22);
    };

    beep(now, 880);
    beep(now + 0.26, 660);
  };

  useEffect(() => {
    if (timeLeft === 0) {
      if (timerType === 'work') {
        setSessionsCompleted((currentCount) => currentCount + 1);
        setSessionHistory((previousHistory) => [...previousHistory, new Date().toISOString()]);
      }

      if (!hasFiredCompletionFeedbackRef.current) {
        hasFiredCompletionFeedbackRef.current = true;
        playCompletionSound();
        showCompletionNotification(timerType);
      }

      setIsActive(false);
    }
  }, [timeLeft, timerType]);

  useEffect(() => {
    localStorage.setItem(SESSIONS_STORAGE_KEY, String(sessionsCompleted));
  }, [sessionsCompleted]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_TASK_STORAGE_KEY, activeTaskId);
  }, [activeTaskId]);

  useEffect(() => {
    localStorage.setItem(SESSION_HISTORY_STORAGE_KEY, JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  const buttonLabel = useMemo(() => (isActive ? 'Pause' : 'Start'), [isActive]);
  const isFocusMode = isActive;
  const primaryControlLabel = isFocusMode ? 'Stop' : buttonLabel;
  const activeTask = useMemo(
    () => tasks.find((taskItem) => taskItem.id === activeTaskId) ?? null,
    [tasks, activeTaskId],
  );
  const focusInsights = useMemo(() => {
    if (sessionHistory.length === 0) {
      return {
        totalToday: 0,
        totalThisWeek: 0,
        longestStreak: 0,
      };
    }

    const now = new Date();
    const todayKey = getLocalDateKey(now);
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekMs = startOfWeek.getTime();

    let totalToday = 0;
    let totalThisWeek = 0;

    sessionHistory.forEach((sessionTime) => {
      const sessionDate = new Date(sessionTime);
      if (Number.isNaN(sessionDate.getTime())) {
        return;
      }

      if (getLocalDateKey(sessionDate) === todayKey) {
        totalToday += 1;
      }

      if (sessionDate.getTime() >= startOfWeekMs) {
        totalThisWeek += 1;
      }
    });

    const uniqueDayKeys = [...new Set(sessionHistory.map(getLocalDateKey))].sort();
    let longestStreak = 0;
    let currentStreak = 0;
    let previousDayMs = null;

    uniqueDayKeys.forEach((dayKey) => {
      const currentDayMs = localDateKeyToMs(dayKey);
      if (previousDayMs !== null && currentDayMs - previousDayMs === 24 * 60 * 60 * 1000) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      previousDayMs = currentDayMs;
    });

    return {
      totalToday,
      totalThisWeek,
      longestStreak,
    };
  }, [sessionHistory]);

  const switchTimer = (nextType) => {
    if (isActive || nextType === timerType) {
      return;
    }

    setTimerType(nextType);
    setTimeLeft(TIMER_OPTIONS[nextType]);
    setRemainingMs(TIMER_OPTIONS[nextType] * 1000);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(TIMER_OPTIONS[timerType]);
    setRemainingMs(TIMER_OPTIONS[timerType] * 1000);
  };

  const isResetDisabled = !isActive && timeLeft === TIMER_OPTIONS[timerType];

  const handleToggleTimer = async () => {
    if (!isActive) {
      await requestNotificationPermission();
    }
    setIsActive((previousValue) => !previousValue);
  };

  const handleAddTask = () => {
    const cleanedTask = taskInput.trim();
    if (!cleanedTask) {
      return;
    }

    const newTask = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: cleanedTask,
      completed: false,
    };

    setTasks((previousTasks) => [newTask, ...previousTasks]);
    if (!activeTaskId) {
      setActiveTaskId(newTask.id);
    }
    setTaskInput('');
  };

  const handleToggleTaskComplete = (taskId) => {
    setTasks((previousTasks) =>
      previousTasks.map((taskItem) =>
        taskItem.id === taskId ? { ...taskItem, completed: !taskItem.completed } : taskItem,
      ),
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks((previousTasks) => previousTasks.filter((taskItem) => taskItem.id !== taskId));
    if (activeTaskId === taskId) {
      setActiveTaskId('');
    }
  };

  const handleSetActiveTask = (taskId) => {
    setActiveTaskId(taskId);
  };

  const totalTimeForMode = TIMER_OPTIONS[timerType];
  const progressRatio = Math.max(0, Math.min(1, remainingMs / (totalTimeForMode * 1000)));
  const progressOffset = CIRCLE_CIRCUMFERENCE * (1 - progressRatio);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <>
      <div className={`app-wrapper ${themeClass} ${modeClass} ${isFocusMode ? 'focus-mode' : ''}`}>
        <div className="app-layout">
          <div className="top-controls distraction-ui">
            <button
              className="btn-theme icon-toggle"
              onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
              aria-label={`Switch to ${isDarkTheme ? 'light' : 'dark'} theme`}
            >
              {isDarkTheme ? '☀' : '☾'}
            </button>
          </div>
          <section className="timer-card" key={timerType}>
            <div className="panel-header distraction-ui">
              <h1 className="title">🍅 Pomodoro Timer</h1>
            </div>
            <p className="hero-subtitle distraction-ui">Stay focused and productive.</p>
            {isFocusMode ? (
              <p className="focus-task">
                Current Task: {activeTask ? activeTask.text : 'No active task selected'}
              </p>
            ) : (
              activeTask && <p className="task-display">Current Task: {activeTask.text}</p>
            )}

            <div className="modes-controls distraction-ui">
              {MODE_KEYS.map((modeKey) => (
                <button
                  key={modeKey}
                  className={`btn-mode ${timerType === modeKey ? 'active' : ''}`}
                  onClick={() => switchTimer(modeKey)}
                  disabled={isActive}
                  aria-label={`Switch to ${MODE_CONFIG[modeKey].label}`}
                >
                  {MODE_CONFIG[modeKey].button}
                </button>
              ))}
            </div>

            <div className="progress-ring" key={`${timerType}-ring`}>
              <svg className="ring-svg" viewBox="0 0 280 280" aria-hidden="true">
                <defs>
                  <linearGradient id={`progressGradient-${timerType}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="var(--accent-color-2)" stopOpacity="0.92" />
                  </linearGradient>
                </defs>
                <circle className="ring-track" cx="140" cy="140" r={CIRCLE_RADIUS} />
                <circle
                  className="ring-progress"
                  cx="140"
                  cy="140"
                  r={CIRCLE_RADIUS}
                  stroke={`url(#progressGradient-${timerType})`}
                  strokeDashoffset={progressOffset}
                />
              </svg>
              <div className="ring-center">
                <div className="time-display" key={`${timerType}-time`}>
                  {formatTime()}
                </div>
                <div className="time-subtitle">
                  {timerType === 'work' ? '🎯 Focus Time' : timerType === 'shortBreak' ? '☕ Short Break' : '🌴 Long Break'}
                </div>
              </div>
            </div>

            <div className={`timer-actions ${isFocusMode ? 'focus-controls' : ''}`}>
              <button
                className="btn-primary icon-btn"
                onClick={handleToggleTimer}
                aria-label={primaryControlLabel}
              >
                {isActive ? '❚❚' : '▶'}
              </button>
              <button
                className="btn-secondary icon-btn"
                onClick={handleReset}
                disabled={isResetDisabled}
                aria-label="Reset timer"
              >
                ↺
              </button>
            </div>
          </section>

          <section className="tasks-card distraction-ui">
            <div className="tasks-header">
              <p className="todo-title">✨ Tasks</p>
              <p className="session-count">Sessions Completed: {sessionsCompleted}</p>
            </div>
            <div className="todo-input-row">
              <input
                className="task-input todo-input"
                type="text"
                value={taskInput}
                onChange={(event) => setTaskInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleAddTask();
                  }
                }}
                placeholder="What are you working on?"
                aria-label="Add a task"
                maxLength={120}
              />
              <button className="todo-add-btn icon-btn" onClick={handleAddTask} aria-label="Add task">
                +
              </button>
            </div>

            {tasks.length === 0 ? (
              <p className="todo-empty">No tasks yet. Add one to get started! 🚀</p>
            ) : (
              <ul className="todo-list">
                {tasks.map((taskItem) => {
                  const isActiveTask = taskItem.id === activeTaskId;
                  return (
                    <li
                      key={taskItem.id}
                      className={`todo-item ${isActiveTask ? 'active' : ''} ${taskItem.completed ? 'completed' : ''}`}
                    >
                      <div className="todo-task-main">
                        <input
                          className="todo-check"
                          type="checkbox"
                          checked={taskItem.completed}
                          onChange={() => handleToggleTaskComplete(taskItem.id)}
                          aria-label={`Mark ${taskItem.text} as complete`}
                        />
                        <span className="todo-text">{taskItem.text}</span>
                      </div>
                      <div className="todo-actions">
                        <button
                          className="todo-btn set-active"
                          onClick={() => handleSetActiveTask(taskItem.id)}
                          disabled={isActiveTask}
                          aria-label={`Set ${taskItem.text} as current task`}
                        >
                          {isActiveTask ? 'Active' : 'Set Active'}
                        </button>
                        <button
                          className="todo-btn delete"
                          onClick={() => handleDeleteTask(taskItem.id)}
                          aria-label={`Delete ${taskItem.text}`}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="insights-inline">
              <div className="insight-stat">
                <span className="insight-value">{focusInsights.totalToday}</span>
                <span className="insight-label">Today</span>
              </div>
              <div className="insight-stat">
                <span className="insight-value">{focusInsights.totalThisWeek}</span>
                <span className="insight-label">This Week</span>
              </div>
              <div className="insight-stat">
                <span className="insight-value">{focusInsights.longestStreak}</span>
                <span className="insight-label">Best Streak</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return <PomodoroTimer />;
}



