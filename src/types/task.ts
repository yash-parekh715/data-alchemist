export interface Task {
  TaskID: string;
  TaskName: string;
  Category?: string;
  Duration: number; // >= 1
  RequiredSkills: string[]; // normalized
  PreferredPhases: number[]; // normalized
  MaxConcurrent: number;
}
