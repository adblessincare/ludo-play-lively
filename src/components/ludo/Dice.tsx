import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface DiceProps {
  value?: number;
  onRoll?: () => void;
  isRolling?: boolean;
  disabled?: boolean;
}

export const Dice = ({ value = 1, onRoll, isRolling = false, disabled = false }: DiceProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleRoll = async () => {
    if (disabled || isRolling) return;
    
    setIsAnimating(true);
    onRoll?.();
    
    // Animation duration
    setTimeout(() => setIsAnimating(false), 800);
  };
  
  const getDiceFace = (num: number) => {
    const dotPositions = {
      1: ["center"],
      2: ["top-left", "bottom-right"],
      3: ["top-left", "center", "bottom-right"],
      4: ["top-left", "top-right", "bottom-left", "bottom-right"],
      5: ["top-left", "top-right", "center", "bottom-left", "bottom-right"],
      6: ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"]
    };
    
    return dotPositions[num as keyof typeof dotPositions] || dotPositions[1];
  };
  
  const dotClasses = {
    "top-left": "top-1 left-1",
    "top-right": "top-1 right-1",
    "middle-left": "top-1/2 left-1 -translate-y-1/2",
    "middle-right": "top-1/2 right-1 -translate-y-1/2",
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "bottom-left": "bottom-1 left-1",
    "bottom-right": "bottom-1 right-1"
  };
  
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
      >
        <motion.div
          className="w-16 h-16 bg-card border-2 border-board-border rounded-2xl shadow-game cursor-pointer relative"
          onClick={handleRoll}
          animate={isAnimating ? {
            rotateX: [0, 180, 360, 540, 720],
            rotateY: [0, 180, 360, 540, 720],
          } : {}}
          transition={{
            duration: 0.8,
            ease: "easeInOut"
          }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Dice dots */}
          {getDiceFace(value).map((position, index) => (
            <motion.div
              key={`${value}-${position}-${index}`}
              className={`absolute w-2 h-2 bg-foreground rounded-full ${dotClasses[position as keyof typeof dotClasses]}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.8 }}
            />
          ))}
        </motion.div>
      </motion.div>
      
      <Button 
        onClick={handleRoll}
        disabled={disabled || isRolling}
        className="bg-gradient-primary text-white font-semibold px-6 py-2 rounded-xl shadow-soft hover:shadow-game transition-all duration-200"
        size="sm"
      >
        {isRolling ? "Rolling..." : "Roll Dice"}
      </Button>
      
      {value && !isAnimating && (
        <motion.p 
          className="text-lg font-bold text-foreground"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 500 }}
        >
          You rolled: {value}
        </motion.p>
      )}
    </div>
  );
};