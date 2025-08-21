import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GameRoom, Player, GameState, PlayerColor, GameToken, LUDO_CONSTANTS } from "@/types/ludo";

export const useLudoGame = () => {
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameTokens, setGameTokens] = useState<GameToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Initialize game tokens for all players
  const initializeGameTokens = useCallback((playersList: Player[]) => {
    const tokens: GameToken[] = [];
    
    playersList.forEach((player) => {
      for (let i = 1; i <= LUDO_CONSTANTS.TOKENS_PER_PLAYER; i++) {
        tokens.push({
          id: `${player.id}-token-${i}`,
          playerId: player.id,
          color: player.player_color as PlayerColor,
          position: 0, // Start in home
          isHome: true,
          isFinished: false,
          tokenNumber: i
        });
      }
    });
    
    setGameTokens(tokens);
    return tokens;
  }, []);

  // Get valid moves for a token
  const getValidMoves = useCallback((token: GameToken, diceValue: number): number[] => {
    const moves: number[] = [];
    
    // If token is at home, can only move with 6
    if (token.isHome && diceValue === 6) {
      const startPos = LUDO_CONSTANTS.HOME_POSITIONS[token.color].start;
      moves.push(startPos);
    }
    
    // If token is on board
    if (!token.isHome && !token.isFinished) {
      let newPosition = token.position + diceValue;
      
      // Check if moving into final path
      const colorStartPos = LUDO_CONSTANTS.HOME_POSITIONS[token.color].start;
      const completedCircle = newPosition > LUDO_CONSTANTS.BOARD_POSITIONS;
      
      if (completedCircle) {
        const finalPathPos = newPosition - LUDO_CONSTANTS.BOARD_POSITIONS + LUDO_CONSTANTS.FINAL_PATH_START;
        if (finalPathPos <= LUDO_CONSTANTS.WINNING_POSITION) {
          moves.push(finalPathPos);
        }
      } else {
        moves.push(newPosition);
      }
    }
    
    return moves;
  }, []);

  // Move token to new position
  const moveToken = useCallback(async (tokenId: string, newPosition: number) => {
    if (!currentRoom || !gameState) return;

    try {
      const updatedTokens = gameTokens.map(token => {
        if (token.id === tokenId) {
          const isMovingToBoard = token.isHome && newPosition > 0;
          const isFinishing = newPosition === LUDO_CONSTANTS.WINNING_POSITION;
          
          return {
            ...token,
            position: newPosition,
            isHome: newPosition === 0,
            isFinished: isFinishing
          };
        }
        return token;
      });

      // Check for captures
      const movedToken = updatedTokens.find(t => t.id === tokenId);
      if (movedToken && !movedToken.isHome && !movedToken.isFinished) {
        const capturedTokens = updatedTokens.map(token => {
          if (token.id !== tokenId && 
              token.position === movedToken.position && 
              token.color !== movedToken.color &&
              !LUDO_CONSTANTS.HOME_POSITIONS[token.color].safe.includes(token.position)) {
            toast.success(`${movedToken.color} captured ${token.color} token!`);
            return { ...token, position: 0, isHome: true, isFinished: false };
          }
          return token;
        });
        
        setGameTokens(capturedTokens);
      } else {
        setGameTokens(updatedTokens);
      }

      // Update game state in database
      const { error } = await supabase
        .from('game_state')
        .update({ 
          board_state: { tokens: updatedTokens } as any,
          current_turn: gameState.dice_value === 6 ? gameState.current_turn : (gameState.current_turn + 1) % players.length
        })
        .eq('room_id', currentRoom.id);

      if (error) throw error;

      // Check for win condition
      const playerTokens = updatedTokens.filter(t => t.playerId === movedToken?.playerId);
      const finishedTokens = playerTokens.filter(t => t.isFinished);
      
      if (finishedTokens.length === LUDO_CONSTANTS.TOKENS_PER_PLAYER) {
        toast.success(`${movedToken?.color} player wins!`);
        await supabase
          .from('game_state')
          .update({ winner: movedToken?.playerId })
          .eq('room_id', currentRoom.id);
      }

    } catch (error: any) {
      console.error('Error moving token:', error);
      toast.error('Failed to move token');
    }
  }, [currentRoom, gameState, gameTokens, players.length]);

  // Generate a 4-letter room code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  // Create a new game room
  const createRoom = useCallback(async (playerName: string) => {
    setIsLoading(true);
    try {
      const roomCode = generateRoomCode();
      
      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          room_code: roomCode,
          created_by: playerName,
          current_players: 1,
          status: 'waiting'
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Create player
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          player_name: playerName,
          player_color: 'red', // First player gets red
          position: 0
        })
        .select()
        .single();

      if (playerError) throw playerError;

      // Create initial game state with tokens
      const initialTokens = initializeGameTokens([player as Player]);
      const { error: gameStateError } = await supabase
        .from('game_state')
        .insert({
          room_id: room.id,
          current_turn: 0,
          board_state: { tokens: initialTokens } as any,
          player_colors: { [player.id]: 'red' } as any
        });

      if (gameStateError) throw gameStateError;

      setCurrentRoom(room as GameRoom);
      setCurrentPlayer(player as Player);
      
      toast.success(`Room created! Code: ${roomCode}`);
      return roomCode;
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Join an existing room
  const joinRoom = useCallback(async (roomCode: string, playerName: string) => {
    setIsLoading(true);
    try {
      // Find room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (roomError) {
        toast.error('Room not found');
        throw roomError;
      }

      if (room.current_players >= room.max_players) {
        toast.error('Room is full');
        throw new Error('Room is full');
      }

      // Get current players to determine color
      const { data: existingPlayers } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', room.id);

      const usedColors = existingPlayers?.map(p => p.player_color as PlayerColor) || [];
      const availableColors: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];
      const playerColor = availableColors.find(color => !usedColors.includes(color)) || 'red';

      // Create player
      const { data: player, error: playerError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          player_name: playerName,
          player_color: playerColor,
          position: room.current_players
        })
        .select()
        .single();

      if (playerError) throw playerError;

      // Update room player count
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ current_players: room.current_players + 1 })
        .eq('id', room.id);

      if (updateError) throw updateError;

      setCurrentRoom(room as GameRoom);
      setCurrentPlayer(player as Player);
      
      toast.success(`Joined room: ${roomCode}`);
      return room;
    } catch (error: any) {
      console.error('Error joining room:', error);
      toast.error('Failed to join room');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start game
  const startGame = useCallback(async () => {
    if (!currentRoom || players.length < 2) return;

    try {
      // Initialize tokens for all players
      const allTokens = initializeGameTokens(players);
      
      const { error: gameStateError } = await supabase
        .from('game_state')
        .update({ board_state: { tokens: allTokens } as any })
        .eq('room_id', currentRoom.id);

      if (gameStateError) throw gameStateError;

      const { error } = await supabase
        .from('rooms')
        .update({ status: 'playing' })
        .eq('id', currentRoom.id);

      if (error) throw error;

      toast.success('Game started!');
      return true;
    } catch (error: any) {
      console.error('Error starting game:', error);
      toast.error('Failed to start game');
      return false;
    }
  }, [currentRoom, players, initializeGameTokens]);

  // Roll dice
  const rollDice = useCallback(async () => {
    if (!currentRoom || !gameState) return;

    const diceValue = Math.floor(Math.random() * 6) + 1;
    
    try {
      const { error } = await supabase
        .from('game_state')
        .update({ 
          dice_value: diceValue,
          current_turn: (gameState.current_turn + 1) % players.length
        })
        .eq('room_id', currentRoom.id);

      if (error) throw error;

      toast.success(`Rolled ${diceValue}!`);
      return diceValue;
    } catch (error: any) {
      console.error('Error rolling dice:', error);
      toast.error('Failed to roll dice');
    }
  }, [currentRoom, gameState, players.length]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentRoom) return;

    const roomChannel = supabase
      .channel('game-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${currentRoom.id}`
        },
        (payload) => {
          // Refresh players list
          fetchPlayers(currentRoom.id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_state',
          filter: `room_id=eq.${currentRoom.id}`
        },
        (payload) => {
          if (payload.new) {
            const newState = payload.new as any;
            if (newState.board_state?.tokens) {
              setGameTokens(newState.board_state.tokens as GameToken[]);
            }
            setGameState(payload.new as GameState);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${currentRoom.id}`
        },
        (payload) => {
          if (payload.new) {
            setCurrentRoom(payload.new as GameRoom);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [currentRoom]);

  // Fetch players for current room
  const fetchPlayers = useCallback(async (roomId: string) => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId);

    if (error) {
      console.error('Error fetching players:', error);
      return;
    }

    setPlayers((data || []) as Player[]);
  }, []);

  // Fetch game state
  const fetchGameState = useCallback(async (roomId: string) => {
    const { data, error } = await supabase
      .from('game_state')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (error) {
      console.error('Error fetching game state:', error);
      return;
    }

    setGameState(data as GameState);
    const gameData = data as any;
    if (gameData.board_state?.tokens) {
      setGameTokens(gameData.board_state.tokens as GameToken[]);
    }
  }, []);

  // Initialize room data when room changes
  useEffect(() => {
    if (currentRoom) {
      fetchPlayers(currentRoom.id);
      fetchGameState(currentRoom.id);
    }
  }, [currentRoom, fetchPlayers, fetchGameState]);

  return {
    currentRoom,
    gameState,
    players,
    currentPlayer,
    gameTokens,
    isLoading,
    createRoom,
    joinRoom,
    startGame,
    rollDice,
    moveToken,
    getValidMoves,
    setCurrentRoom: (room: GameRoom | null) => setCurrentRoom(room)
  };
};