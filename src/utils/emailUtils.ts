// District boundaries (approximate bounding boxes: [minLat, minLng, maxLat, maxLng])
const DISTRICT_BOUNDS: { [key: string]: [number, number, number, number] } = {
  'Colombo': [6.78, 79.74, 7.05, 80.05],
  'Gampaha': [6.98, 79.88, 7.30, 80.15],
  'Kalutara': [6.40, 79.85, 6.75, 80.30],
  'Kandy': [7.10, 80.45, 7.50, 80.85],
  'Matale': [7.35, 80.45, 7.75, 80.90],
  'Nuwara Eliya': [6.80, 80.55, 7.15, 80.95],
  'Galle': [5.95, 80.05, 6.30, 80.40],
  'Matara': [5.85, 80.35, 6.10, 80.75],
  'Hambantota': [5.95, 80.85, 6.40, 81.35],
  'Jaffna': [9.50, 79.90, 9.85, 80.30],
  'Kilinochchi': [9.25, 80.25, 9.55, 80.60],
  'Mannar': [8.75, 79.70, 9.25, 80.15],
  'Vavuniya': [8.60, 80.30, 8.95, 80.70],
  'Mullaitivu': [9.10, 80.65, 9.50, 81.05],
  'Batticaloa': [7.55, 81.40, 7.90, 81.90],
  'Ampara': [6.95, 81.45, 7.50, 81.95],
  'Trincomalee': [8.35, 80.90, 8.75, 81.40],
  'Kurunegala': [7.25, 79.95, 7.75, 80.50],
  'Puttalam': [7.85, 79.70, 8.50, 80.15],
  'Anuradhapura': [8.05, 80.15, 8.65, 80.70],
  'Polonnaruwa': [7.70, 80.85, 8.15, 81.30],
  'Badulla': [6.75, 80.90, 7.20, 81.40],
  'Monaragala': [6.50, 81.05, 7.05, 81.60],
  'Ratnapura': [6.40, 80.25, 6.95, 80.70],
  'Kegalle': [6.95, 80.05, 7.40, 80.50],
};

// Get district name from coordinates
export function getDistrictFromCoordinates(lat: number, lng: number): string {
  for (const [district, bounds] of Object.entries(DISTRICT_BOUNDS)) {
    const [minLat, minLng, maxLat, maxLng] = bounds;
    if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
      return district;
    }
  }
  return 'Unknown';
}

// Get district officer email
export function getDistrictOfficerEmail(district: string): string {
  if (district === 'Unknown') return '';
  return `${district.toLowerCase().replace(/\s+/g, '')}@mailinator.com`;
}

// Format incident email body
export function formatIncidentEmail(incident: {
  id: string;
  type: string;
  severity: number;
  latitude: number;
  longitude: number;
  timestamp: number;
  location?: string;
}): { subject: string; body: string } {
  const district = getDistrictFromCoordinates(incident.latitude, incident.longitude);
  const date = new Date(incident.timestamp).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  
  const severityLabel = incident.severity >= 4 ? 'CRITICAL' : incident.severity >= 3 ? 'HIGH' : 'MODERATE';
  const mapsUrl = `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`;
  
  const subject = `[${severityLabel}] ${incident.type} Incident in ${district} District`;
  const body = `Dear District Officer,

An incident has been reported in your district that requires immediate attention.

INCIDENT DETAILS:
-----------------
Type: ${incident.type}
Severity: ${severityLabel} (${incident.severity}/5)
District: ${district}
Reported At: ${date}
${incident.location ? `Location: ${incident.location}\n` : ''}
LOCATION:
---------
Coordinates: ${incident.latitude.toFixed(6)}, ${incident.longitude.toFixed(6)}
Google Maps: ${mapsUrl}

INCIDENT ID: ${incident.id}

Please take necessary action and update the incident status in the LankaSafe HQ Dashboard.

---
This is an automated alert from LankaSafe HQ
Emergency Response System`;

  return { subject, body };
}

// Format aid request email body
export function formatAidRequestEmail(aidRequest: {
  id: string;
  aid_types: string;
  description?: string | null;
  priority_level: number;
  latitude: number;
  longitude: number;
  created_at: number;
  contact_person?: string;
  contact_phone?: string;
}): { subject: string; body: string } {
  const district = getDistrictFromCoordinates(aidRequest.latitude, aidRequest.longitude);
  const date = new Date(aidRequest.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  
  const priorityLabel = aidRequest.priority_level >= 4 ? 'URGENT' : aidRequest.priority_level >= 3 ? 'HIGH' : 'NORMAL';
  const mapsUrl = `https://www.google.com/maps?q=${aidRequest.latitude},${aidRequest.longitude}`;
  
  let aidTypes: string[] = [];
  try {
    aidTypes = JSON.parse(aidRequest.aid_types);
  } catch {
    aidTypes = [aidRequest.aid_types];
  }
  
  const subject = `[${priorityLabel} PRIORITY] Aid Request in ${district} District`;
  const body = `Dear District Officer,

An aid request has been submitted in your district that requires assistance.

AID REQUEST DETAILS:
-------------------
Priority: ${priorityLabel} (${aidRequest.priority_level}/5)
District: ${district}
Requested At: ${date}

Required Aid:
${aidTypes.map(type => `• ${type}`).join('\n')}

${aidRequest.description ? `Additional Information:\n${aidRequest.description}\n` : ''}
CONTACT INFORMATION:
-------------------
${aidRequest.contact_person ? `Contact Person: ${aidRequest.contact_person}` : ''}
${aidRequest.contact_phone ? `Phone: ${aidRequest.contact_phone}` : ''}

LOCATION:
---------
Coordinates: ${aidRequest.latitude.toFixed(6)}, ${aidRequest.longitude.toFixed(6)}
Google Maps: ${mapsUrl}

REQUEST ID: ${aidRequest.id}

Please coordinate with the requesting party and provide necessary assistance.

---
This is an automated alert from LankaSafe HQ
Emergency Response System`;

  return { subject, body };
}

// Send email (opens mailto link)
export function sendEmail(to: string, subject: string, body: string): void {
  const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoLink;
}
