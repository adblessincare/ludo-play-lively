import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, LogIn } from "lucide-react";
import { toast } from "sonner";

interface RoomCreationProps {
  onCreateRoom?: (playerName: string) => void;
  onJoinRoom?: (roomCode: string, playerName: string) => void;
  isLoading?: boolean;
}

export const RoomCreation = ({ onCreateRoom, onJoinRoom, isLoading = false }: RoomCreationProps) => {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");
  
  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    onCreateRoom?.(playerName.trim());
  };
  
  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }
    onJoinRoom?.(roomCode.trim().toUpperCase(), playerName.trim());
  };
  
  return (
    <div className="min-h-screen bg-gradient-game flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Game Title */}
        <motion.div 
          className="text-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl font-black text-white mb-2 drop-shadow-lg">
            LUDO
          </h1>
          <p className="text-white/80 text-lg">Modern Online Multiplayer</p>
        </motion.div>

        <Card className="shadow-game border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {mode === "create" ? "Create Game Room" : "Join Game Room"}
            </CardTitle>
            <CardDescription>
              {mode === "create" 
                ? "Start a new game and invite friends" 
                : "Enter a room code to join an existing game"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={mode === "create" ? "default" : "ghost"}
                className={`flex-1 ${mode === "create" ? "bg-gradient-primary text-white" : ""}`}
                onClick={() => setMode("create")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create
              </Button>
              <Button
                variant={mode === "join" ? "default" : "ghost"}
                className={`flex-1 ${mode === "join" ? "bg-gradient-primary text-white" : ""}`}
                onClick={() => setMode("join")}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Join
              </Button>
            </div>

            {/* Player Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Your Name
              </label>
              <Input
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="border-board-border focus:ring-primary/50"
                maxLength={20}
              />
            </div>

            {/* Room Code Input (Join mode only) */}
            {mode === "join" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-foreground">
                  Room Code
                </label>
                <Input
                  placeholder="Enter 6-digit room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="border-board-border focus:ring-primary/50 font-mono text-center text-lg"
                  maxLength={6}
                />
              </motion.div>
            )}

            {/* Action Button */}
            <Button
              onClick={mode === "create" ? handleCreateRoom : handleJoinRoom}
              disabled={isLoading || !playerName.trim() || (mode === "join" && !roomCode.trim())}
              className="w-full bg-gradient-primary text-white font-semibold py-3 rounded-xl shadow-soft hover:shadow-game transition-all duration-200"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === "create" ? "Creating..." : "Joining..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {mode === "create" ? (
                    <>
                      <Users className="w-5 h-5" />
                      Create Room
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Join Room
                    </>
                  )}
                </div>
              )}
            </Button>

            {/* Info Text */}
            <div className="text-center text-sm text-muted-foreground">
              {mode === "create" 
                ? "You'll get a 6-digit code to share with friends"
                : "Ask your friend for the room code"
              }
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};