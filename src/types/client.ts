export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: number; // 1-5
  RequestedTaskIDs: string[]; // normalized array
  GroupTag?: string;
  AttributesJSON?: Record<string, unknown>;
}
