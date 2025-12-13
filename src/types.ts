export type IncidentStatus = 'pending' | 'synced' | 'failed';
export type ActionStatus = 'pending' | 'taking action' | 'completed';
export type AidStatus = 'pending' | 'taking action' | 'completed';

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

export interface AidRequest {
  id: string;
  aid_types: string; // JSON string array
  latitude: number;
  longitude: number;
  description: string | null;
  priority_level: number; // 1-5
  status: IncidentStatus;
  aidStatus?: AidStatus;
  created_at: number;
  updated_at: number;
}
