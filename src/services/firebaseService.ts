import { collection, doc, onSnapshot, orderBy, query, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig.js';
import type { ActionStatus, AidRequest, AidStatus, CampStatus, DetentionCamp, Incident } from '../types.js';

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
          description: data.description,
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
            description: data.description,
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
          requester_name: data.requester_name || null,
          contact_number: data.contact_number || null,
          number_of_people: data.number_of_people || null,
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

// ============= DETENTION CAMP FUNCTIONS =============

export interface FirebaseDetentionCamp extends DetentionCamp {
  userId?: string;
}

/**
 * Create a new detention camp
 * @param camp The detention camp data (without timestamps)
 */
export async function createDetentionCamp(
  camp: Omit<DetentionCamp, 'created_at' | 'updated_at'>
): Promise<string> {
  const now = Date.now();
  const campRef = doc(db, 'detention_camps', camp.id);
  
  const fullCamp: FirebaseDetentionCamp = {
    ...camp,
    adminApproved: true, // Admin-created camps are auto-approved
    created_at: now,
    updated_at: now,
  };

  await setDoc(campRef, fullCamp);
  return camp.id;
}

/**
 * Update the status of a detention camp
 * @param campId The ID of the detention camp to update
 * @param campStatus The new camp status
 */
export async function updateDetentionCampStatus(
  campId: string,
  campStatus: CampStatus
): Promise<void> {
  const campRef = doc(db, 'detention_camps', campId);
  await updateDoc(campRef, {
    campStatus,
    updated_at: Date.now()
  });
}

/**
 * Update detention camp occupancy
 * @param campId The ID of the detention camp to update
 * @param currentOccupancy The new occupancy count
 */
export async function updateDetentionCampOccupancy(
  campId: string,
  currentOccupancy: number
): Promise<void> {
  const campRef = doc(db, 'detention_camps', campId);
  await updateDoc(campRef, {
    current_occupancy: currentOccupancy,
    updated_at: Date.now()
  });
}

/**
 * Update the admin approval status of a detention camp
 * @param campId The ID of the detention camp to update
 * @param adminApproved The approval status
 */
export async function updateCampApproval(
  campId: string,
  adminApproved: boolean
): Promise<void> {
  const campRef = doc(db, 'detention_camps', campId);
  await updateDoc(campRef, {
    adminApproved,
    updated_at: Date.now()
  });
}

/**
 * Subscribe to real-time detention camp updates from Firestore
 * @param callback Function to call when detention camps data changes
 * @returns Unsubscribe function
 */
export function subscribeToDetentionCamps(
  callback: (camps: DetentionCamp[]) => void
): () => void {
  const campsRef = collection(db, 'detention_camps');
  const campsQuery = query(campsRef, orderBy('created_at', 'desc'));

  const unsubscribe = onSnapshot(
    campsQuery,
    (snapshot) => {
      const campsArray: DetentionCamp[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        campsArray.push({
          id: data.id || doc.id,
          name: data.name,
          latitude: data.latitude,
          longitude: data.longitude,
          capacity: data.capacity,
          current_occupancy: data.current_occupancy || 0,
          facilities: data.facilities,
          campStatus: data.campStatus || 'operational',
          contact_person: data.contact_person,
          contact_phone: data.contact_phone,
          description: data.description,
          adminApproved: data.adminApproved !== undefined ? data.adminApproved : true,
          userId: data.userId,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      });

      callback(campsArray);
    },
    (error) => {
      console.error('Error fetching detention camps from Firestore:', error);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to real-time volunteer updates from Firestore
 * @param callback Function to call when volunteers data changes
 * @returns Unsubscribe function
 */
export function subscribeToVolunteers(
  callback: (volunteers: any[]) => void
): () => void {
  const volunteersRef = collection(db, 'volunteers');
  const volunteersQuery = query(volunteersRef, orderBy('created_at', 'desc'));

  const unsubscribe = onSnapshot(
    volunteersQuery,
    (snapshot) => {
      const volunteersArray: any[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        volunteersArray.push({
          id: data.id || doc.id,
          user_email: data.user_email,
          full_name: data.full_name,
          phone_number: data.phone_number,
          district: data.district,
          skills: data.skills,
          availability: data.availability,
          preferred_tasks: data.preferred_tasks,
          emergency_contact: data.emergency_contact,
          emergency_phone: data.emergency_phone,
          approved: data.approved ?? false,
          userId: data.userId,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      });

      callback(volunteersArray);
    },
    (error) => {
      console.error('Error fetching volunteers from Firestore:', error);
      callback([]);
    }
  );

  return unsubscribe;
}

/**
 * Update volunteer approval status
 * @param volunteerId The ID of the volunteer to update
 * @param approved The new approval status
 */
export async function updateVolunteerApproval(
  volunteerId: string,
  approved: boolean
): Promise<void> {
  const volunteerRef = doc(db, 'volunteers', volunteerId);
  await updateDoc(volunteerRef, {
    approved,
    updated_at: Date.now()
  });
}
