/**
 * Interface representing the deconstructed components of a snowflake.
 */
export interface DeconstructedSnowflake {
  timestamp: number;
  date: Date;
  workerId: number;
  processId: number;
  increment: number;
  binary: string;
}
