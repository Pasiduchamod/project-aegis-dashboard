import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import type { Incident, ActionStatus, AidRequest, AidStatus } from '../types.js';

export interface FirebaseIncident extends Incident {
  userId?: string;
  created_at: number;
  updated_at: number;
}

/**
 * Update the action status of an incident
 * @param incidentId The ID of the incident to update
 * @param actionStatus The new action status
 */
export async function updateIncidentActionStatus(
  incidentId: string,
  actionStatus: ActionStatus
): Promise<void> {
  const incidentRef = doc(db, 'incidents', incidentId);
  await updateDoc(incidentRef, {
    actionStatus,
    updated_at: Date.now()
  });
}

/**
 * Subscribe to real-time incident updates from Firestore
 * @param callback Function to call when incidents data changes
 * @returns Unsubscribe function
 */
export function subscribeToIncidents(
  callback: (incidents: Incident[]) => void
): () => void {
  // Reference to the incidents collection
  const incidentsRef = collection(db, 'incidents');
  
  // Query to order by timestamp descending (newest first)
  const incidentsQuery = query(incidentsRef, orderBy('timestamp', 'desc'));

  // Subscribe to real-time updates
  const unsubscribe = onSnapshot(
    incidentsQuery,
    (snapshot) => {
      const incidentsArray: Incident[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        incidentsArray.push({
          id: data.id || doc.id,
          type: data.type,
          severity: data.severity,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: data.timestamp,
          status: data.status || 'synced',
          actionStatus: data.actionStatus || 'pending',
          location: data.location,
          cloudImageUrls: data.cloudImageUrls || [],
          imageQualities: data.imageQualities || [],
        });
      });

      callback(incidentsArray);
    },
    (error) => {
      console.error('Error fetching incidents from Firestore:', error);
      callback([]);
    }
  );

  // Return cleanup function
  return unsubscribe;
}

/**
 * Get incidents once without subscribing
 * @returns Promise with incidents array
 */
export async function getIncidentsOnce(): Promise<Incident[]> {
  return new Promise((resolve, reject) => {
    const incidentsRef = collection(db, 'incidents');
    const incidentsQuery = query(incidentsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      incidentsQuery,
      (snapshot) => {
        const incidentsArray: Incident[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          incidentsArray.push({
            id: data.id || doc.id,
            type: data.type,
            severity: data.severity,
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: data.timestamp,
            status: data.status || 'synced',
            actionStatus: data.actionStatus || 'pending',
            location: data.location,
            cloudImageUrls: data.cloudImageUrls || [],
            imageQualities: data.imageQualities || [],
          });
        });

        unsubscribe();
        resolve(incidentsArray);
      },
      (error) => {
        reject(error);
      }
    );
  });
}

// ============= AID REQUEST FUNCTIONS =============

export interface FirebaseAidRequest extends AidRequest {
  userId?: string;
}

/**
 * Update the aid status of an aid request
 * @param aidRequestId The ID of the aid request to update
 * @param aidStatus The new aid status
 */
export async function updateAidRequestStatus(
  aidRequestId: string,
  aidStatus: AidStatus
): Promise<void> {
  const aidRequestRef = doc(db, 'aid_requests', aidRequestId);
  await updateDoc(aidRequestRef, {
    aidStatus,
    updated_at: Date.now()
  });
}

/**
 * Subscribe to real-time aid request updates from Firestore
 * @param callback Function to call when aid requests data changes
 * @returns Unsubscribe function
 */
export function subscribeToAidRequests(
  callback: (aidRequests: AidRequest[]) => void
): () => void {
  const aidRequestsRef = collection(db, 'aid_requests');
  const aidRequestsQuery = query(aidRequestsRef, orderBy('created_at', 'desc'));

  const unsubscribe = onSnapshot(
    aidRequestsQuery,
    (snapshot) => {
      const aidRequestsArray: AidRequest[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        aidRequestsArray.push({
          id: data.id || doc.id,
          aid_types: data.aid_types,
          latitude: data.latitude,
          longitude: data.longitude,
          description: data.description || null,
          priority_level: data.priority_level,
          status: data.status || 'synced',
          aidStatus: data.aidStatus || 'pending',
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      });

      callback(aidRequestsArray);
    },
    (error) => {
      console.error('Error fetching aid requests from Firestore:', error);
      callback([]);
    }
  );

  return unsubscribe;
}
