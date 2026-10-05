export interface MatchLocation {
  latitude?: number;
  longitude?: number;
  addressName?: string;
  city?: string;
}

export interface MatchPlayerRecord {
  id: string;
  playerName: string;
  position: string;
  goals: number;
  assists: number;
  yellowCards: number;
  rating: number; // 1 a 10
  photoUri: string | null;
  location: MatchLocation;
  matchDate: string;
  notes?: string;
}
