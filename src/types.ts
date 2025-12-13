export type IncidentStatus = 'pending' | 'synced' | 'failed';

export interface Incident {
  id: string;
  type: string;
  severity: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  status: IncidentStatus;
}
