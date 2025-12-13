import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import type { Incident } from '../types.js';

export interface FirebaseIncident extends Incident {
  userId?: string;
  created_at: number;
  updated_at: number;
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
