import { motion } from "framer-motion";
import { GameToken } from "./GameToken";
import { PlayerColor, GameToken as GameTokenType } from "@/types/ludo";

interface GameBoardProps {
  boardState: Record<string, any>;
  currentPlayer?: PlayerColor;
  onTokenClick?: (tokenId: string) => void;
  gameTokens: GameTokenType[];
  diceValue?: number;
}

// Ludo board position mapping (1-52 for main path)
const POSITION_COORDS = {
  // Red starting area positions (1-13 going up)
  1: { row: 8, col: 1 }, 2: { row: 7, col: 1 }, 3: { row: 6, col: 1 }, 4: { row: 5, col: 1 }, 5: { row: 4, col: 1 },
  6: { row: 3, col: 1 }, 7: { row: 2, col: 1 }, 8: { row: 1, col: 1 }, 9: { row: 0, col: 1 }, 10: { row: 0, col: 2 },
  11: { row: 0, col: 3 }, 12: { row: 0, col: 4 }, 13: { row: 0, col: 5 },
  
  // Blue starting area positions (14-26 going right)
  14: { row: 0, col: 6 }, 15: { row: 1, col: 7 }, 16: { row: 2, col: 7 }, 17: { row: 3, col: 7 }, 18: { row: 4, col: 7 },
  19: { row: 5, col: 7 }, 20: { row: 6, col: 7 }, 21: { row: 7, col: 7 }, 22: { row: 8, col: 7 }, 23: { row: 9, col: 7 },
  24: { row: 10, col: 7 }, 25: { row: 11, col: 7 }, 26: { row: 12, col: 7 },
  
  // Yellow positions (27-39 going down)
  27: { row: 13, col: 7 }, 28: { row: 14, col: 7 }, 29: { row: 14, col: 6 }, 30: { row: 14, col: 5 }, 31: { row: 14, col: 4 },
  32: { row: 14, col: 3 }, 33: { row: 14, col: 2 }, 34: { row: 14, col: 1 }, 35: { row: 14, col: 0 }, 36: { row: 13, col: 0 },
  37: { row: 12, col: 0 }, 38: { row: 11, col: 0 }, 39: { row: 10, col: 0 },
  
  // Green positions (40-52 going left)
  40: { row: 9, col: 0 }, 41: { row: 8, col: 0 }, 42: { row: 7, col: 0 }, 43: { row: 6, col: 0 }, 44: { row: 5, col: 0 },
  45: { row: 4, col: 0 }, 46: { row: 3, col: 0 }, 47: { row: 2, col: 0 }, 48: { row: 1, col: 0 }, 49: { row: 0, col: 0 },
  50: { row: 0, col: 1 }, 51: { row: 0, col: 2 }, 52: { row: 0, col: 3 }
};

export const GameBoard = ({ boardState, currentPlayer, onTokenClick, gameTokens, diceValue }: GameBoardProps) => {
  const boardSize = 15; // 15x15 grid for Ludo board
  
  // Get tokens at a specific board position
  const getTokensAtPosition = (position: number): GameTokenType[] => {
    return gameTokens.filter(token => token.position === position && !token.isHome);
  };
  
  // Get home tokens for a color
  const getHomeTokens = (color: PlayerColor): GameTokenType[] => {
    return gameTokens.filter(token => token.color === color && token.isHome);
  };
  
  const getCellType = (row: number, col: number) => {
    // Check if it's a home area
    if (row >= 1 && row <= 5 && col >= 1 && col <= 5) return { type: 'home', color: 'red' };
    if (row >= 1 && row <= 5 && col >= 9 && col <= 13) return { type: 'home', color: 'blue' };
    if (row >= 9 && row <= 13 && col >= 9 && col <= 13) return { type: 'home', color: 'yellow' };
    if (row >= 9 && row <= 13 && col >= 1 && col <= 5) return { type: 'home', color: 'green' };
    
    // Check if it's a colored path (final path to center)
    if (row === 7 && col >= 1 && col <= 5) return { type: 'final', color: 'red' };
    if (col === 7 && row >= 1 && row <= 5) return { type: 'final', color: 'blue' };
    if (row === 7 && col >= 9 && col <= 13) return { type: 'final', color: 'yellow' };
    if (col === 7 && row >= 9 && row <= 13) return { type: 'final', color: 'green' };
    
    // Check if it's the main path
    if ((row === 6 || row === 8) && (col <= 5 || col >= 9)) return { type: 'path', color: null };
    if ((col === 6 || col === 8) && (row <= 5 || row >= 9)) return { type: 'path', color: null };
    
    // Center area
    if (row === 7 && col === 7) return { type: 'center', color: null };
    if ((row === 6 || row === 8) && (col === 6 || col === 8)) return { type: 'center', color: null };
    
    return { type: 'empty', color: null };
  };
  
  const getCellClass = (type: string, color: string | null, row: number, col: number) => {
    const baseClass = "w-10 h-10 border border-gray-400 flex items-center justify-center relative transition-all duration-200";
    
    // Check if it's a safe zone (star positions)  
    const isSafeZone = (
      (row === 2 && col === 6) || (row === 6 && col === 2) || (row === 8 && col === 12) ||
      (row === 12 && col === 8) || (row === 6 && col === 6) || (row === 8 && col === 8)
    );
    
    switch (type) {
      case 'home':
        const homeColors = {
          red: 'bg-red-200 border-red-400',
          blue: 'bg-blue-200 border-blue-400', 
          green: 'bg-green-200 border-green-400',
          yellow: 'bg-yellow-200 border-yellow-400'
        };
        return `${baseClass} ${homeColors[color as keyof typeof homeColors] || 'bg-gray-200'}`;
      case 'final':
        const finalColors = {
          red: 'bg-red-300 border-red-500',
          blue: 'bg-blue-300 border-blue-500',
          green: 'bg-green-300 border-green-500', 
          yellow: 'bg-yellow-300 border-yellow-500'
        };
        return `${baseClass} ${finalColors[color as keyof typeof finalColors] || 'bg-gray-300'}`;
      case 'path':
        return `${baseClass} bg-white border-gray-400 hover:bg-gray-50 ${isSafeZone ? 'bg-yellow-100 border-yellow-500' : ''}`;
      case 'center':
        return `${baseClass} bg-gradient-to-br from-red-200 via-blue-200 to-green-200 border-gray-500 shadow-lg`;
      default:
        return `${baseClass} bg-gray-100 border-gray-300`;
    }
  };

  const renderHomeArea = (color: PlayerColor, row: number, col: number) => {
    const homeTokens = getHomeTokens(color);
    const isMainHomeSquare = (
      (color === 'red' && row === 3 && col === 3) ||
      (color === 'blue' && row === 3 && col === 11) ||
      (color === 'yellow' && row === 11 && col === 11) ||
      (color === 'green' && row === 11 && col === 3)
    );
    
    if (!isMainHomeSquare) return null;
    
    const colorClasses = {
      red: 'bg-red-400 border-red-600',
      blue: 'bg-blue-400 border-blue-600',
      green: 'bg-green-400 border-green-600', 
      yellow: 'bg-yellow-400 border-yellow-600'
    };

    return (
      <div className={`absolute inset-1 ${colorClasses[color]} rounded-lg border-2 grid grid-cols-2 gap-1 p-1`}>
        {[0, 1, 2, 3].map((index) => {
          const token = homeTokens[index];
          return (
            <div
              key={index}
              className={`w-full h-full rounded-full border-2 flex items-center justify-center ${
                token 
                  ? `${colorClasses[color]} border-white shadow-md cursor-pointer hover:scale-110 transition-transform` 
                  : 'border-dashed border-gray-500 bg-white/50'
              }`}
              onClick={() => token && onTokenClick?.(token.id)}
            >
              {token && (
                <div className="w-3 h-3 bg-white rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Find position number for coordinates
  const getPositionNumber = (row: number, col: number): number => {
    for (const [pos, coords] of Object.entries(POSITION_COORDS)) {
      if (coords.row === row && coords.col === col) {
        return parseInt(pos);
      }
    }
    return 0;
  };
  
  return (
    <div className="flex items-center justify-center p-4">
      <motion.div 
        className="grid gap-1 bg-white rounded-3xl p-4 shadow-2xl border-4 border-gray-300"
        style={{ 
          gridTemplateColumns: 'repeat(15, 2.5rem)',
          gridTemplateRows: 'repeat(15, 2.5rem)'
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {Array.from({ length: boardSize }, (_, row) =>
          Array.from({ length: boardSize }, (_, col) => {
            const cellInfo = getCellType(row, col);
            const cellKey = `${row}-${col}`;
            const position = getPositionNumber(row, col);
            const tokensAtPosition = getTokensAtPosition(position);
            
            return (
              <motion.div
                key={cellKey}
                className={getCellClass(cellInfo.type, cellInfo.color, row, col)}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.1 }}
                onClick={() => position && onTokenClick?.(position.toString())}
              >
                {/* Render home areas */}
                {cellInfo.type === 'home' && renderHomeArea(cellInfo.color as PlayerColor, row, col)}
                
                {/* Render tokens on path squares */}
                {tokensAtPosition.map((token, index) => (
                  <GameToken
                    key={token.id}
                    color={token.color}
                    position={position.toString()}
                    isActive={currentPlayer === token.color}
                    onClick={() => onTokenClick?.(token.id)}
                    className={`absolute ${index > 0 ? `translate-x-${index} translate-y-${index}` : ''}`}
                  />
                ))}
                
                {/* Center triangle */}
                {row === 7 && col === 7 && (
                  <div className="w-6 h-6 bg-gradient-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
                
                {/* Safe zone stars */}
                {((row === 2 && col === 6) || (row === 6 && col === 2) || (row === 8 && col === 12) || (row === 12 && col === 8)) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full border border-yellow-600" />
                  </div>
                )}
                
                {/* Position numbers for debugging */}
                {position > 0 && (
                  <div className="absolute top-0 left-0 text-xs text-gray-500 leading-none">
                    {position}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
};