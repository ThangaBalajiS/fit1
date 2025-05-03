export interface SleepEntry {
  startTime: string; // ISO timestamp for when sleep started
  endTime: string;   // ISO timestamp for when sleep ended
  duration: number;  // Duration in minutes
  quality: number;   // Sleep quality rating 1-10
  notes: string;     // Any additional notes about sleep
  tags: string[];    // Tags like 'restless', 'deep', 'interrupted', etc.
}

export interface SleepAnalysis {
  totalHours: number;
  quality: number;
  sleepStages: {
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
} 