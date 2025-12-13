import { AlertCircle, AlertTriangle, Clock, Image as ImageIcon, Mail, MapPin, Users, X } from 'lucide-react';
import { sendIncidentEmail } from '../services/emailService.js';
import { updateIncidentActionStatus } from '../services/firebaseService.js';
import type { ActionStatus, Incident } from '../types.js';
import { getDistrictFromCoordinates } from '../utils/emailUtils.js';

interface IncidentDetailModalProps {
  incident: Incident | null;
  onClose: () => void;
}

export default function IncidentDetailModal({ incident, onClose }: IncidentDetailModalProps) {
  if (!incident) return null;

  console.log('Incident data:', incident);
  console.log('Cloud image URLs:', incident.cloudImageUrls);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'text-red-500';
    if (severity >= 3) return 'text-orange-500';
    return 'text-yellow-500';
  };

  const getActionStatusColor = (actionStatus?: ActionStatus) => {
    switch (actionStatus) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'taking action':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'pending':
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const handleStatusChange = async (newStatus: ActionStatus) => {
    try {
      await updateIncidentActionStatus(incident.id, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSendEmail = async () => {
    const district = getDistrictFromCoordinates(incident.latitude, incident.longitude);
    
    if (district === 'Unknown') {
      alert('Unable to determine district from coordinates');
      return;
    }
    
    try {
      await sendIncidentEmail(incident);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  // Handle both array and string formats from Firebase
  let imageUrls: string[] = [];
  if (incident.cloudImageUrls) {
    if (typeof incident.cloudImageUrls === 'string') {
      try {
        imageUrls = JSON.parse(incident.cloudImageUrls);
      } catch {
        imageUrls = [incident.cloudImageUrls];
      }
    } else if (Array.isArray(incident.cloudImageUrls)) {
      imageUrls = incident.cloudImageUrls;
    }
  }
  
  const hasImages = imageUrls.length > 0 && imageUrls[0] !== '' && imageUrls[0] !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div 
        className="bg-slate-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{incident.type} Incident</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Critical Alert for Trapped Civilians */}
          {incident.type === 'Trapped Civilians' && (
            <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-xl font-bold text-red-400">⚠️ CRITICAL INCIDENT - TRAPPED CIVILIANS</h3>
              </div>
              {incident.description && (() => {
                const parts = incident.description.split(' | ');
                const trappedCount = parts[0]?.replace('TRAPPED PEOPLE: ', '') || 'Unknown';
                return (
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-red-500" />
                    <p className="text-red-300 font-semibold">
                      Number of Trapped People: <span className="text-2xl font-bold text-red-500">{trappedCount}</span>
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Road Block Route Display */}
          {incident.type === 'Road Block' && incident.description && incident.description.startsWith('ROUTE:') && (
            <div className="bg-orange-500/20 border-2 border-orange-500 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                <div>
                  <h3 className="text-lg font-bold text-orange-400">Blocked Route</h3>
                  <p className="text-slate-300 text-xl mt-2">
                    {incident.description.replace('ROUTE: ', '')}
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Images Section */}
          {hasImages && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-300">
                <ImageIcon className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Incident Photos</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {imageUrls.filter(url => url && url !== '' && url !== null).map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Incident ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg border border-slate-700"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                      >
                        View Full Size
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Severity */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Severity Level</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-bold ${getSeverityColor(incident.severity)}`}>
                {incident.severity}
              </span>
              <span className="text-slate-400">/ 5</span>
            </div>
          </div>

          {/* Action Status */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-300">Action Status</h3>
            <select
              value={incident.actionStatus || 'pending'}
              onChange={(e) => handleStatusChange(e.target.value as ActionStatus)}
              className={`w-full px-4 py-3 rounded-lg border cursor-pointer text-base ${getActionStatusColor(incident.actionStatus)} bg-slate-800`}
            >
              <option value="pending" className="bg-slate-800">🔴 Pending</option>
              <option value="taking action" className="bg-slate-800">🟡 Taking Action</option>
              <option value="completed" className="bg-slate-800">🟢 Completed</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Location</h3>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 space-y-1">
              <p className="text-slate-300">
                <span className="text-slate-500">Latitude:</span> {incident.latitude.toFixed(6)}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-500">Longitude:</span> {incident.longitude.toFixed(6)}
              </p>
              <a
                href={`https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-red-400 hover:text-red-300 transition-colors"
              >
                View on Google Maps →
              </a>
            </div>
          </div>

          {/* Timestamp */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Reported At</h3>
            </div>
            <p className="text-slate-300 bg-slate-800/50 rounded-lg p-4">
              {formatTime(incident.timestamp)}
            </p>
          </div>

          {/* Incident ID */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-300">Incident ID</h3>
            <p className="text-slate-400 bg-slate-800/50 rounded-lg p-4 font-mono text-sm break-all">
              {incident.id}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-6">
          <div className="flex gap-3">
            <button
              onClick={handleSendEmail}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Email District Officer
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
