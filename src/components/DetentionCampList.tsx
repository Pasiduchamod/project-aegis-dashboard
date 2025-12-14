import { AlertCircle, Building2, CheckCircle, Clock, MapPin, Users, XCircle } from 'lucide-react';
import { updateCampApproval, updateDetentionCampStatus } from '../services/firebaseService.js';
import type { CampStatus, DetentionCamp } from '../types.js';

interface DetentionCampListProps {
  camps: DetentionCamp[];
  onCampClick: (camp: DetentionCamp) => void;
}

export default function DetentionCampList({ camps, onCampClick }: DetentionCampListProps) {
  const formatTime = (value: unknown) => {
    let date: Date;

    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'number') {
      // Handle seconds vs milliseconds
      const ms = value < 1_000_000_000_000 ? value * 1000 : value;
      date = new Date(ms);
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else if (value && typeof value === 'object') {
      const v = value as { toDate?: () => Date; seconds?: number };
      if (typeof v.toDate === 'function') {
        date = v.toDate();
      } else if (typeof v.seconds === 'number') {
        date = new Date(v.seconds * 1000);
      } else {
        date = new Date(NaN);
      }
    } else {
      date = new Date(NaN);
    }

    const ts = date.getTime();
    if (isNaN(ts)) return 'Unknown date';

    const nowMs = Date.now();
    const diffMs = Math.max(0, nowMs - ts);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getCampStatusColor = (status: CampStatus): string => {
    const colors = {
      'operational': 'bg-green-500/20 text-green-400 border-green-500/50',
      'full': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      'closed': 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return colors[status];
  };

  const getOccupancyColor = (occupancy: number, capacity: number): string => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-orange-400';
    return 'text-green-400';
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, campId: string) => {
    e.stopPropagation();
    const newStatus = e.target.value as CampStatus;
    try {
      await updateDetentionCampStatus(campId, newStatus);
    } catch (error) {
      console.error('Failed to update camp status:', error);
    }
  };

  const handleApprovalChange = async (e: React.MouseEvent, campId: string, approved: boolean) => {
    e.stopPropagation();
    try {
      await updateCampApproval(campId, approved);
    } catch (error) {
      console.error('Failed to update camp approval:', error);
    }
  };

  return (
    <div className="h-[600px] overflow-y-auto">
      <div className="divide-y divide-slate-800">
        {camps.map((camp) => {
          // Parse facilities
          let facilities: string[] = [];
          try {
            facilities = JSON.parse(camp.facilities);
          } catch {
            facilities = [];
          }

          const occupancyPercentage = Math.round((camp.current_occupancy / camp.capacity) * 100);

          return (
            <div
              key={camp.id}
              className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
              onClick={() => onCampClick(camp)}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${getCampStatusColor(camp.campStatus)}`}>
                  <Building2 className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-base">{camp.name}</h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(camp.created_at)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {/* Approval Status Badge */}
                    {camp.adminApproved === false && (
                      <span className="text-xs px-2 py-1 rounded border bg-yellow-500/20 text-yellow-400 border-yellow-500/50 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Pending Approval
                      </span>
                    )}
                    {camp.adminApproved === true && (
                      <span className="text-xs px-2 py-1 rounded border bg-green-500/20 text-green-400 border-green-500/50 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                      </span>
                    )}

                    {/* Occupancy */}
                    <span className={`text-xs px-2 py-1 rounded border bg-slate-900 border-slate-700 flex items-center gap-1`}>
                      <Users className="w-3 h-3" />
                      <span className={getOccupancyColor(camp.current_occupancy, camp.capacity)}>
                        {camp.current_occupancy}/{camp.capacity}
                      </span>
                      <span className="text-slate-500">({occupancyPercentage}%)</span>
                    </span>

                    {/* Camp Status Dropdown */}
                    <select
                      value={camp.campStatus}
                      onChange={(e) => handleStatusChange(e, camp.id)}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-xs px-2 py-1 rounded border bg-slate-900 cursor-pointer ${getCampStatusColor(camp.campStatus)}`}
                    >
                      <option value="operational">Operational</option>
                      <option value="full">Full</option>
                      <option value="closed">Closed</option>
                    </select>

                    {/* Facilities count */}
                    {facilities.length > 0 && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/50">
                        {facilities.length} facilities
                      </span>
                    )}

                    {/* Location */}
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {camp.latitude.toFixed(4)}, {camp.longitude.toFixed(4)}
                    </span>
                  </div>

                  {/* Description Preview */}
                  {camp.description && (
                    <p className="mt-2 text-xs text-slate-400 line-clamp-1">
                      {camp.description}
                    </p>
                  )}

                  {/* Approval Actions */}
                  {camp.adminApproved === false && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={(e) => handleApprovalChange(e, camp.id, true)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Approve Camp
                      </button>
                      <button
                        onClick={(e) => handleApprovalChange(e, camp.id, false)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium rounded bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {camps.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No detention camps registered
          </div>
        )}
      </div>
    </div>
  );
}
