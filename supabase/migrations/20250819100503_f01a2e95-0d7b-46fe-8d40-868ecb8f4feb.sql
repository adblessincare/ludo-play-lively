-- Create rooms table for multiplayer Ludo games
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_code TEXT NOT NULL UNIQUE,
  created_by TEXT,
  max_players INTEGER NOT NULL DEFAULT 4,
  current_players INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_state table to track the current game progress
CREATE TABLE public.game_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  current_turn INTEGER NOT NULL DEFAULT 0,
  dice_value INTEGER,
  board_state JSONB NOT NULL DEFAULT '{}',
  player_colors JSONB NOT NULL DEFAULT '{}',
  winner TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table to track who's in which room
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  player_color TEXT NOT NULL,
  position INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Anyone can view rooms" 
ON public.rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create rooms" 
ON public.rooms 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update rooms" 
ON public.rooms 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can view game state" 
ON public.game_state 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create game state" 
ON public.game_state 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update game state" 
ON public.game_state 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can view players" 
ON public.players 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create players" 
ON public.players 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update players" 
ON public.players 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete players" 
ON public.players 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_state_updated_at
  BEFORE UPDATE ON public.game_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_rooms_room_code ON public.rooms(room_code);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_game_state_room_id ON public.game_state(room_id);
CREATE INDEX idx_players_room_id ON public.players(room_id);

-- Enable realtime for all tables
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.game_state REPLICA IDENTITY FULL;
ALTER TABLE public.players REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;