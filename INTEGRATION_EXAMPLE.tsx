// Example: How to integrate UserSignalCheck into IncidentDetailModal.tsx

import React from 'react';
import { UserSignalCheck } from './UserSignalCheck';

interface IncidentDetailModalProps {
  incident: {
    id: string;
    type: string;
    severity: number;
    userId?: string; // Important: incidents must store userId
    // ... other fields
  };
  onClose: () => void;
  currentAdminId: string; // Get from auth context
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  currentAdminId,
}) => {
  return (
    <div className="modal">
      <h2>Incident Details</h2>
      
      {/* Existing incident details */}
      <div className="incident-info">
        <p>Type: {incident.type}</p>
        <p>Severity: {incident.severity}</p>
        {/* ... more fields */}
      </div>

      {/* ADD THIS: User Signal Check Component */}
      {incident.userId && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Reporter Status</h3>
          <UserSignalCheck
            userId={incident.userId}
            contextType="incident"
            contextId={incident.id}
            adminId={currentAdminId}
          />
        </div>
      )}

      <button onClick={onClose}>Close</button>
    </div>
  );
};

// Same pattern for AidRequestDetailModal.tsx:
// <UserSignalCheck
//   userId={aidRequest.userId}
//   contextType="aidRequest"
//   contextId={aidRequest.id}
//   adminId={currentAdminId}
// />
