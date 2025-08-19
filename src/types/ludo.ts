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
  position: string; // board position key like "1-2"
  isHome: boolean;
  isFinished: boolean;
}

export interface LudoGame {
  room: GameRoom;
  gameState: GameState;
  tokens: GameToken[];
}