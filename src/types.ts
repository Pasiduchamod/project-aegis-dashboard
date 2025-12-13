export type IncidentStatus = 'pending' | 'synced' | 'failed';
export type ActionStatus = 'pending' | 'taking action' | 'completed';
export type AidStatus = 'pending' | 'taking action' | 'completed';
export type CampStatus = 'operational' | 'full' | 'closed';

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
  description?: string;
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
  requester_name?: string ;
  contact_number?: string ;
  number_of_people?: number ;
  created_at: number;
  updated_at: number;
}

export interface DetentionCamp {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  facilities: string; // JSON string array
  campStatus: CampStatus;
  contact_person?: string;
  contact_phone?: string;
  description?: string;
  created_at: number;
  updated_at: number;
}
