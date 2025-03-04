import React, { useState, useEffect } from 'react';
import './App.css'; // Ensure the CSS file is correctly imported

function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // Default to 25 minutes for Pomodoro
  const [timerType, setTimerType] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft > 0 ? timeLeft - 1 : 0);
      }, 1000);
    } else if (!isActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(25 * 60); // Reset to default Pomodoro time
    setTimerType('work'); // Reset to work mode
  };

  const handleShortBreak = () => {
    setIsActive(false);
    setTimerType('shortBreak');
    setTimeLeft(5 * 60);
  };

  const handleLongBreak = () => {
    setIsActive(false);
    setTimerType('longBreak');
    setTimeLeft(15 * 60);
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="pomodoro-container">
      <h1>🍅 Pomodoro Timer 🌺</h1>
      <div className="time-display">{formatTime()}</div>
      <div className="timer-controls">
      <button onClick={toggleTimer}>{isActive ? 'Pause' : 'Start'}</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleShortBreak}>Short Break</button>
        <button onClick={handleLongBreak}>Long Break</button>
      </div>
    </div>
  );
}

export default function App() {
  return <PomodoroTimer />;
}
