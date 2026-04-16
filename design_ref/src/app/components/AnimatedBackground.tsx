import { motion } from 'motion/react';

interface AnimatedBackgroundProps {
  mode: 'focus' | 'shortBreak' | 'longBreak';
  isDark: boolean;
}

export function AnimatedBackground({ mode, isDark }: AnimatedBackgroundProps) {
  const particleCount = 20;
  
  const getParticleColor = () => {
    if (isDark) {
      switch (mode) {
        case 'focus':
          return ['rgba(236, 72, 153, 0.3)', 'rgba(244, 63, 94, 0.3)', 'rgba(168, 85, 247, 0.3)'];
        case 'shortBreak':
          return ['rgba(59, 130, 246, 0.3)', 'rgba(6, 182, 212, 0.3)', 'rgba(14, 165, 233, 0.3)'];
        case 'longBreak':
          return ['rgba(16, 185, 129, 0.3)', 'rgba(52, 211, 153, 0.3)', 'rgba(20, 184, 166, 0.3)'];
      }
    } else {
      switch (mode) {
        case 'focus':
          return ['rgba(236, 72, 153, 0.2)', 'rgba(244, 63, 94, 0.2)', 'rgba(251, 207, 232, 0.3)'];
        case 'shortBreak':
          return ['rgba(59, 130, 246, 0.2)', 'rgba(6, 182, 212, 0.2)', 'rgba(186, 230, 253, 0.3)'];
        case 'longBreak':
          return ['rgba(16, 185, 129, 0.2)', 'rgba(52, 211, 153, 0.2)', 'rgba(167, 243, 208, 0.3)'];
      }
    }
  };

  const colors = getParticleColor();

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <motion.div
        key={`orb-1-${mode}`}
        className="absolute w-96 h-96 rounded-full filter blur-3xl opacity-50"
        style={{
          background: `radial-gradient(circle, ${colors[0]}, transparent)`,
        }}
        animate={{
          x: [-100, 100, -100],
          y: [-100, 150, -100],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        initial={{ x: -100, y: -100 }}
      />
      
      <motion.div
        key={`orb-2-${mode}`}
        className="absolute right-0 top-1/4 w-96 h-96 rounded-full filter blur-3xl opacity-40"
        style={{
          background: `radial-gradient(circle, ${colors[1]}, transparent)`,
        }}
        animate={{
          x: [100, -50, 100],
          y: [0, 100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        initial={{ x: 100, y: 0 }}
      />

      <motion.div
        key={`orb-3-${mode}`}
        className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full filter blur-3xl opacity-30"
        style={{
          background: `radial-gradient(circle, ${colors[2]}, transparent)`,
        }}
        animate={{
          x: [0, -100, 0],
          y: [100, -50, 100],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        initial={{ x: 0, y: 100 }}
      />

      {/* Floating particles */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDuration = 15 + Math.random() * 20;
        const randomDelay = Math.random() * 5;
        const randomSize = 3 + Math.random() * 8;
        const colorIndex = Math.floor(Math.random() * colors.length);

        return (
          <motion.div
            key={`particle-${mode}-${i}`}
            className="absolute rounded-full"
            style={{
              width: randomSize,
              height: randomSize,
              background: colors[colorIndex],
              left: `${randomX}%`,
              top: `${randomY}%`,
              boxShadow: `0 0 ${randomSize * 2}px ${colors[colorIndex]}`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: randomDelay,
            }}
          />
        );
      })}
    </div>
  );
}
