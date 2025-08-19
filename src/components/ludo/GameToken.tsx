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
  return (
    <motion.div
      className={`
        w-6 h-6 rounded-full cursor-pointer relative z-10
        bg-gradient-${color} shadow-token border-2 border-white
        ${isActive ? 'ring-4 ring-primary/50' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
      animate={isActive ? {
        boxShadow: [
          "0 0 0 0 rgba(var(--primary), 0.4)",
          "0 0 0 10px rgba(var(--primary), 0)",
          "0 0 0 0 rgba(var(--primary), 0)"
        ]
      } : {}}
      transition={{
        scale: { duration: 0.1 },
        boxShadow: { duration: 1.5, repeat: Infinity }
      }}
      layout
      layoutId={`token-${color}-${position}`}
    >
      {/* Token shine effect */}
      <div className="absolute inset-1 rounded-full bg-white/30" />
    </motion.div>
  );
};