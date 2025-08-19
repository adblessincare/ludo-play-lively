import { motion } from "framer-motion";
import { GameToken } from "./GameToken";
import { PlayerColor } from "@/types/ludo";

interface GameBoardProps {
  boardState: Record<string, any>;
  currentPlayer?: PlayerColor;
  onTokenClick?: (tokenId: string) => void;
}

export const GameBoard = ({ boardState, currentPlayer, onTokenClick }: GameBoardProps) => {
  const boardSize = 15; // 15x15 grid for Ludo board
  
  // Create the Ludo board layout
  const createBoardLayout = () => {
        const board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
        
        // Mark different zones
        // Home areas (corners)
        const homeAreas = {
          red: { startRow: 1, startCol: 1, endRow: 5, endCol: 5 },
          green: { startRow: 1, startCol: 9, endRow: 5, endCol: 13 },
          yellow: { startRow: 9, startCol: 9, endRow: 13, endCol: 13 },
          blue: { startRow: 9, startCol: 1, endRow: 13, endCol: 5 }
        };
        
        // Safe zones (colored paths leading to center)
        const safeZones = [
          // Red path (row 6, cols 1-5)
          ...Array.from({ length: 5 }, (_, i) => ({ row: 6, col: i + 1, color: 'red' })),
          // Green path (col 8, rows 1-5)
          ...Array.from({ length: 5 }, (_, i) => ({ row: i + 1, col: 8, color: 'green' })),
          // Yellow path (row 8, cols 9-13)
          ...Array.from({ length: 5 }, (_, i) => ({ row: 8, col: i + 9, color: 'yellow' })),
          // Blue path (col 6, rows 9-13)
          ...Array.from({ length: 5 }, (_, i) => ({ row: i + 9, col: 6, color: 'blue' }))
        ];
        
        return { board, homeAreas, safeZones };
  };
  
  const { homeAreas, safeZones } = createBoardLayout();
  
  const getCellType = (row: number, col: number) => {
    // Check if it's a home area
    for (const [color, area] of Object.entries(homeAreas)) {
      if (row >= area.startRow && row <= area.endRow && 
          col >= area.startCol && col <= area.endCol) {
        return { type: 'home', color };
      }
    }
    
    // Check if it's a safe zone
    const safeZone = safeZones.find(zone => zone.row === row && zone.col === col);
    if (safeZone) {
      return { type: 'safe', color: safeZone.color };
    }
    
    // Check if it's the main path
    if ((row === 0 || row === 6 || row === 8 || row === 14) && 
        (col >= 6 && col <= 8)) {
      return { type: 'path', color: null };
    }
    if ((col === 0 || col === 6 || col === 8 || col === 14) && 
        (row >= 6 && row <= 8)) {
      return { type: 'path', color: null };
    }
    
    // Center area
    if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
      return { type: 'center', color: null };
    }
    
    return { type: 'empty', color: null };
  };
  
  const getCellClass = (type: string, color: string | null) => {
    const baseClass = "w-8 h-8 border border-board-border flex items-center justify-center relative transition-all duration-200";
    
    switch (type) {
      case 'home':
        return `${baseClass} bg-gradient-${color} opacity-20 hover:opacity-30`;
      case 'safe':
        return `${baseClass} bg-gradient-${color} opacity-40 shadow-soft`;
      case 'path':
        return `${baseClass} bg-board-bg hover:bg-board-safe`;
      case 'center':
        return `${baseClass} bg-gradient-game shadow-game`;
      default:
        return `${baseClass} bg-background`;
    }
  };
  
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div 
        className="grid gap-0 bg-card rounded-3xl p-6 shadow-game border border-board-border"
        style={{ 
          gridTemplateColumns: 'repeat(15, 2rem)',
          gridTemplateRows: 'repeat(15, 2rem)'
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {Array.from({ length: boardSize }, (_, row) =>
          Array.from({ length: boardSize }, (_, col) => {
            const cellInfo = getCellType(row, col);
            const cellKey = `${row}-${col}`;
            
            return (
              <motion.div
                key={cellKey}
                className={getCellClass(cellInfo.type, cellInfo.color)}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.1 }}
              >
                {/* Render tokens if any exist at this position */}
                {boardState[cellKey] && (
                  <GameToken
                    color={boardState[cellKey].color}
                    position={cellKey}
                    isActive={currentPlayer === boardState[cellKey].color}
                    onClick={() => onTokenClick?.(boardState[cellKey].id)}
                  />
                )}
                
                {/* Special markers for starting positions */}
                {cellInfo.type === 'home' && (
                  <div className={`w-3 h-3 rounded-full bg-gradient-${cellInfo.color} shadow-token`} />
                )}
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
};