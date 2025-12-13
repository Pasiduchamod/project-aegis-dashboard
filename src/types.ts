export type IncidentStatus = 'pending' | 'synced' | 'failed';
export type ActionStatus = 'pending' | 'taking action' | 'completed';

export interface Incident {
  id: string;
  type: string;
  severity: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  status: IncidentStatus;
  actionStatus?: ActionStatus;
  location?: string;
  cloudImageUrls?: string[];
  imageQualities?: ('none' | 'low' | 'high')[];
}
