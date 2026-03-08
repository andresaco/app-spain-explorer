export type GameMode = 'rivers' | 'seas' | 'mountains' | 'communities' | 'provinces';

export interface GeoElement {
  id: string;
  name: string;
  type: GameMode;
  path?: string; // For regions or rivers
  x?: number;    // For points (mountains)
  y?: number;
}

export interface GameState {
  mode: GameMode | null;
  score: number;
  total: number;
  currentTarget: GeoElement | null;
  remainingTargets: GeoElement[];
  failedTargets: GeoElement[];
  feedback: 'correct' | 'wrong' | null;
  isGameOver: boolean;
}
