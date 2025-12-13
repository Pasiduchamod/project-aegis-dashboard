import { MapPin, AlertCircle, Clock } from 'lucide-react';
import type { AidRequest, AidStatus } from '../types.js';
import { updateAidRequestStatus } from '../services/firebaseService.js';

interface AidRequestListProps {
  aidRequests: AidRequest[];
  onAidRequestClick: (aidRequest: AidRequest) => void;
}

export default function AidRequestList({ aidRequests, onAidRequestClick }: AidRequestListProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
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

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, aidRequestId: string) => {
    e.stopPropagation();
    const newStatus = e.target.value as AidStatus;
    try {
      await updateAidRequestStatus(aidRequestId, newStatus);
    } catch (error) {
      console.error('Failed to update aid status:', error);
    }
  };

  return (
    <div className="h-[600px] overflow-y-auto">
      <div className="divide-y divide-slate-800">
        {aidRequests.map((aidRequest) => {
          // Parse aid types
          let aidTypes: string[] = [];
          try {
            aidTypes = JSON.parse(aidRequest.aid_types);
          } catch {
            aidTypes = [];
          }

          return (
            <div
              key={aidRequest.id}
              className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
              onClick={() => onAidRequestClick(aidRequest)}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${getPriorityColor(aidRequest.priority_level)}`}>
                  <AlertCircle className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {aidTypes.slice(0, 2).map((type, idx) => (
                        <span key={idx} className="text-sm font-medium">
                          {type}
                        </span>
                      ))}
                      {aidTypes.length > 2 && (
                        <span className="text-xs text-slate-400">
                          +{aidTypes.length - 2} more
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(aidRequest.created_at)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {/* Priority Badge */}
                    <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(aidRequest.priority_level)}`}>
                      Priority: {getPriorityLabel(aidRequest.priority_level)}
                    </span>

                    {/* Aid Status Dropdown */}
                    <select
                      value={aidRequest.aidStatus || 'pending'}
                      onChange={(e) => handleStatusChange(e, aidRequest.id)}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-xs px-2 py-1 rounded border bg-slate-900 cursor-pointer ${getAidStatusColor(aidRequest.aidStatus)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="taking action">Taking Action</option>
                      <option value="completed">Completed</option>
                    </select>

                    {/* Location */}
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {aidRequest.latitude.toFixed(4)}, {aidRequest.longitude.toFixed(4)}
                    </span>
                  </div>

                  {/* Description Preview */}
                  {aidRequest.description && (
                    <p className="mt-2 text-xs text-slate-400 line-clamp-1">
                      {aidRequest.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {aidRequests.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No aid requests yet
          </div>
        )}
      </div>
    </div>
  );
}
