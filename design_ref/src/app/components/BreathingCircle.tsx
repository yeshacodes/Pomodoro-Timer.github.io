import { motion } from 'motion/react';

interface BreathingCircleProps {
  mode: 'focus' | 'shortBreak' | 'longBreak';
  isDark: boolean;
  isActive: boolean;
}

export function BreathingCircle({ mode, isDark, isActive }: BreathingCircleProps) {
  const getColors = () => {
    switch (mode) {
      case 'focus':
        return isDark
          ? ['rgba(236, 72, 153, 0.1)', 'rgba(244, 63, 94, 0.1)']
          : ['rgba(236, 72, 153, 0.05)', 'rgba(244, 63, 94, 0.05)'];
      case 'shortBreak':
        return isDark
          ? ['rgba(59, 130, 246, 0.1)', 'rgba(6, 182, 212, 0.1)']
          : ['rgba(59, 130, 246, 0.05)', 'rgba(6, 182, 212, 0.05)'];
      case 'longBreak':
        return isDark
          ? ['rgba(16, 185, 129, 0.1)', 'rgba(52, 211, 153, 0.1)']
          : ['rgba(16, 185, 129, 0.05)', 'rgba(52, 211, 153, 0.05)'];
    }
  };

  const [color1, color2] = getColors();

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Breathing circles */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            borderColor: i % 2 === 0 ? color1 : color2,
          }}
          animate={{
            scale: [1, 2.5, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 2,
          }}
          initial={{ scale: 1, opacity: 0.6, width: 300, height: 300 }}
        />
      ))}
    </div>
  );
}
