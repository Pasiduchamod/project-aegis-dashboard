import { X, MapPin, Calendar, AlertCircle, FileText, ExternalLink, Mail } from 'lucide-react';
import type { AidRequest, AidStatus } from '../types.js';
import { updateAidRequestStatus } from '../services/firebaseService.js';
import { getDistrictFromCoordinates, getDistrictOfficerEmail, formatAidRequestEmail, sendEmail } from '../utils/emailUtils.js';

interface AidRequestDetailModalProps {
  aidRequest: AidRequest | null;
  onClose: () => void;
}

export default function AidRequestDetailModal({ aidRequest, onClose }: AidRequestDetailModalProps) {
  if (!aidRequest) return null;

  // Parse aid types
  let aidTypes: string[] = [];
  try {
    aidTypes = JSON.parse(aidRequest.aid_types);
  } catch {
    aidTypes = [];
  }

  const formatFullDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (level: number): string => {
    const colors = [
      'bg-green-500/20 text-green-400 border-green-500/50', // 1
      'bg-blue-500/20 text-blue-400 border-blue-500/50',     // 2
      'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', // 3
      'bg-orange-500/20 text-orange-400 border-orange-500/50', // 4
      'bg-red-500/20 text-red-400 border-red-500/50',        // 5
    ];
    return colors[level - 1] || colors[2];
  };

  const getPriorityLabel = (level: number): string => {
    const labels = ['Low', 'Normal', 'Medium', 'High', 'Critical'];
    return labels[level - 1] || 'Medium';
  };

  const getAidStatusColor = (status: AidStatus = 'pending'): string => {
    const colors = {
      'pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      'taking action': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'completed': 'bg-green-500/20 text-green-400 border-green-500/50',
    };
    return colors[status];
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as AidStatus;
    try {
      await updateAidRequestStatus(aidRequest.id, newStatus);
    } catch (error) {
      console.error('Failed to update aid status:', error);
    }
  };

  const handleSendEmail = () => {
    const district = getDistrictFromCoordinates(aidRequest.latitude, aidRequest.longitude);
    const email = getDistrictOfficerEmail(district);
    
    if (!email) {
      alert('Unable to determine district from coordinates');
      return;
    }
    
    const { subject, body } = formatAidRequestEmail(aidRequest);
    sendEmail(email, subject, body);
  };
  const googleMapsUrl = `https://www.google.com/maps?q=${aidRequest.latitude},${aidRequest.longitude}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Aid Request Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Aid Types */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Requested Aid Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {aidTypes.map((type, idx) => (
                <span
                  key={idx}
                  className="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-lg text-sm font-medium"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Priority Level</h3>
              <span className={`inline-block px-3 py-2 rounded border text-sm font-medium ${getPriorityColor(aidRequest.priority_level)}`}>
                {getPriorityLabel(aidRequest.priority_level)} ({aidRequest.priority_level}/5)
              </span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Aid Status</h3>
              <select
                value={aidRequest.aidStatus || 'pending'}
                onChange={handleStatusChange}
                className={`px-3 py-2 rounded border bg-slate-900 cursor-pointer text-sm font-medium ${getAidStatusColor(aidRequest.aidStatus)}`}
              >
                <option value="pending">Pending</option>
                <option value="taking action">Taking Action</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Description */}
          {aidRequest.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Additional Details
              </h3>
              <p className="text-white bg-slate-800/50 p-4 rounded-lg">
                {aidRequest.description}
              </p>
            </div>
          )}

          {/* Location */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h3>
            <div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-mono">
                  {aidRequest.latitude.toFixed(6)}, {aidRequest.longitude.toFixed(6)}
                </span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Open in Maps
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </h3>
            <div className="bg-slate-800/50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Created:</span>
                <span className="text-white">{formatFullDate(aidRequest.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Updated:</span>
                <span className="text-white">{formatFullDate(aidRequest.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Request ID */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Request ID</h3>
            <code className="block bg-slate-800/50 p-3 rounded-lg text-xs text-slate-300 font-mono break-all">
              {aidRequest.id}
            </code>
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
