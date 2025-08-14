export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string[]; // normalized
  AvailableSlots: number[]; // normalized
  MaxLoadPerPhase: number;
  WorkerGroup?: string;
  QualificationLevel?: string | number;
}