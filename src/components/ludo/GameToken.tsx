import { motion } from "framer-motion";
import { PlayerColor } from "@/types/ludo";

interface GameTokenProps {
  color: PlayerColor;
  position: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const GameToken = ({ color, position, isActive, onClick, className = "" }: GameTokenProps) => {
  const getTokenBackground = () => {
    switch (color) {
      case 'red': return 'bg-gradient-red';
      case 'blue': return 'bg-gradient-blue';
      case 'green': return 'bg-gradient-green';
      case 'yellow': return 'bg-gradient-yellow';
      default: return 'bg-gray-400';
    }
  };

  return (
    <motion.div
      className={`
        w-6 h-6 rounded-full cursor-pointer relative z-20
        ${getTokenBackground()} shadow-token border-2 border-white
        ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={isActive ? {
        boxShadow: [
          "0 0 0 0 hsl(var(--primary) / 0.4)",
          "0 0 0 8px hsl(var(--primary) / 0)",
          "0 0 0 0 hsl(var(--primary) / 0)"
        ]
      } : {}}
      transition={{
        scale: { duration: 0.15 },
        boxShadow: { duration: 1.2, repeat: Infinity }
      }}
      layout
      layoutId={`token-${color}-${position}`}
    >
      {/* Token shine effect */}
      <div className="absolute inset-1 rounded-full bg-white/40" />
    </motion.div>
  );
};