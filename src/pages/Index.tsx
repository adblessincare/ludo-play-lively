import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoomCreation } from "@/components/ludo/RoomCreation";
import { GameBoard } from "@/components/ludo/GameBoard";
import { Dice } from "@/components/ludo/Dice";
import { useLudoGame } from "@/hooks/useLudoGame";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Copy, Crown, Gamepad2 } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const {
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
    setCurrentRoom
  } = useLudoGame();

  const [diceValue, setDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState(false);

  const handleCreateRoom = async (playerName: string) => {
    try {
      await createRoom(playerName);
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async (roomCode: string, playerName: string) => {
    try {
      await joinRoom(roomCode, playerName);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleRollDice = async () => {
    setIsRolling(true);
    try {
      const value = await rollDice();
      if (value) {
        setDiceValue(value);
      }
    } catch (error) {
      console.error('Failed to roll dice:', error);
    } finally {
      setTimeout(() => setIsRolling(false), 800);
    }
  };

  const copyRoomCode = () => {
    if (currentRoom?.room_code) {
      navigator.clipboard.writeText(currentRoom.room_code);
      toast.success("Room code copied!");
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    toast.info("Left the room");
  };

  const handleTokenClick = (tokenId: string) => {
    if (!gameState || !currentPlayer) return;
    
    // Check if it's the current player's turn
    const currentTurnPlayer = players[gameState.current_turn];
    if (currentTurnPlayer?.id !== currentPlayer.id) {
      toast.error("It's not your turn!");
      return;
    }
    
    // Check if dice has been rolled
    if (!gameState.dice_value) {
      toast.error("Roll the dice first!");
      return;
    }
    
    // Find the token and get valid moves
    const token = gameTokens.find(t => t.id === tokenId);
    if (!token || token.color !== currentPlayer.player_color) {
      toast.error("Not your token!");
      return;
    }
    
    const validMoves = getValidMoves(token, gameState.dice_value);
    if (validMoves.length === 0) {
      toast.error("No valid moves!");
      return;
    }
    
    // Move to the first valid position (in a real game, player would choose)
    moveToken(tokenId, validMoves[0]);
  };

  // Show room creation/joining screen if not in a room
  if (!currentRoom) {
    return (
      <RoomCreation
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-game">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="container mx-auto p-4"
        >
          {/* Header */}
          <motion.div 
            className="flex justify-between items-center mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-lg">LUDO</h1>
              <p className="text-white/80">Room: {currentRoom.room_code}</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={copyRoomCode}
                variant="secondary"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
              <Button
                onClick={leaveRoom}
                variant="destructive"
                size="sm"
              >
                Leave Room
              </Button>
            </div>
          </motion.div>

          {/* Game Status */}
          <motion.div 
            className="grid md:grid-cols-3 gap-6 mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Players Panel */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players ({players.length}/{currentRoom.max_players})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full bg-gradient-${player.player_color}`} />
                      <span className="font-medium">{player.player_name}</span>
                      {index === 0 && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <Badge 
                      variant={gameState?.current_turn === index ? "default" : "secondary"}
                      className={gameState?.current_turn === index ? "bg-gradient-primary text-white" : ""}
                    >
                      {gameState?.current_turn === index ? "Turn" : "Waiting"}
                    </Badge>
                  </div>
                ))}
                
                {/* Empty slots */}
                {Array.from({ length: currentRoom.max_players - players.length }).map((_, index) => (
                  <div key={`empty-${index}`} className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-4 h-4 rounded-full border-2 border-dashed border-muted-foreground/50" />
                    <span>Waiting for player...</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Game Controls */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Game Controls
                </CardTitle>
                <CardDescription>
                  {currentRoom.status === 'waiting' 
                    ? "Waiting for more players to start..." 
                    : `Turn ${(gameState?.current_turn || 0) + 1}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                {currentRoom.status === 'playing' && (
                  <Dice
                    value={diceValue}
                    onRoll={handleRollDice}
                    isRolling={isRolling}
                    disabled={gameState?.current_turn !== players.findIndex(p => p.id === currentPlayer?.id)}
                  />
                )}
                {currentRoom.status === 'waiting' && (
                  <div className="text-center p-4">
                    <p className="text-muted-foreground mb-4">Need at least 2 players to start</p>
                    <Button
                      onClick={startGame}
                      disabled={players.length < 2}
                      className="bg-gradient-primary text-white"
                    >
                      Start Game
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Game Info */}
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Game Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={currentRoom.status === 'playing' ? 'default' : 'secondary'}>
                      {currentRoom.status}
                    </Badge>
                  </div>
                  {gameState?.dice_value && (
                    <div className="flex justify-between">
                      <span>Last Roll:</span>
                      <span className="font-bold">{gameState.dice_value}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Your Color:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full bg-gradient-${currentPlayer?.player_color}`} />
                      <span className="capitalize">{currentPlayer?.player_color}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Game Board */}
          {currentRoom.status === 'playing' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <GameBoard
                boardState={gameState?.board_state || {}}
                currentPlayer={currentPlayer?.player_color}
                gameTokens={gameTokens}
                diceValue={diceValue}
                onTokenClick={handleTokenClick}
              />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
