export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Player {
  id: string;
  player_name: string;
  player_color: PlayerColor;
  position: number;
  is_active: boolean;
  room_id: string;
  joined_at: string;
}

export interface GameRoom {
  id: string;
  room_code: string;
  created_by: string;
  max_players: number;
  current_players: number;
  status: 'waiting' | 'playing' | 'finished';
  created_at: string;
  updated_at: string;
}

export interface GameState {
  id: string;
  room_id: string;
  current_turn: number;
  dice_value?: number;
  board_state: Record<string, any>;
  player_colors: Record<string, PlayerColor>;
  winner?: string;
  created_at: string;
  updated_at: string;
}

export interface GameToken {
  id: string;
  playerId: string;
  color: PlayerColor;
  position: number; // 0 = home, 1-52 = board positions, 53-58 = final path, 59 = finished
  isHome: boolean;
  isFinished: boolean;
  tokenNumber: number; // 1-4 for each player
}

export interface LudoGame {
  room: GameRoom;
  gameState: GameState;
  tokens: GameToken[];
}

// Ludo game constants
export const LUDO_CONSTANTS = {
  TOKENS_PER_PLAYER: 4,
  BOARD_POSITIONS: 52,
  HOME_POSITIONS: {
    red: { start: 1, safe: [1, 9, 14, 22, 27, 35, 40, 48] },
    blue: { start: 14, safe: [14, 22, 27, 35, 40, 48, 1, 9] },
    yellow: { start: 27, safe: [27, 35, 40, 48, 1, 9, 14, 22] },
    green: { start: 40, safe: [40, 48, 1, 9, 14, 22, 27, 35] }
  },
  FINAL_PATH_START: 52,
  WINNING_POSITION: 59
};