import { Droplets, Mountain, Flame, Zap, Cloud, AlertTriangle, Camera, X, Users } from 'lucide-react';
import type { Incident, ActionStatus } from '../types.js';
import { updateIncidentActionStatus } from '../services/firebaseService.js';

interface IncidentListProps {
  incidents: Incident[];
  onIncidentClick: (incident: Incident) => void;
  statusFilter?: 'all' | 'critical' | 'completed' | 'pending';
  onClearFilter?: () => void;
}

export default function IncidentList({ incidents, onIncidentClick, statusFilter = 'all', onClearFilter }: IncidentListProps) {
  const getIcon = (type: string) => {
    const iconClass = "w-5 h-5";
    
    switch (type.toLowerCase()) {
      case 'flood':
        return <Droplets className={iconClass} />;
      case 'landslide':
        return <Mountain className={iconClass} />;
      case 'fire':
        return <Flame className={iconClass} />;
      case 'earthquake':
        return <Zap className={iconClass} />;
      case 'storm':
        return <Cloud className={iconClass} />;
      case 'trapped civilians':
        return <Users className={iconClass} />;
      case 'road block':
      case 'power line down':
        return <AlertTriangle className={iconClass} />;
      default:
        return <AlertTriangle className={iconClass} />;
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'bg-red-500/20 text-red-400 border-red-500/50';
    if (severity >= 3) return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
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

  const handleStatusChange = async (incidentId: string, newStatus: ActionStatus) => {
    try {
      await updateIncidentActionStatus(incidentId, newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getFilterLabel = () => {
    switch (statusFilter) {
      case 'critical':
        return 'Critical Alerts';
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      default:
        return null;
    }
  };

  const getFilterColor = () => {
    switch (statusFilter) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return '';
    }
  };

  return (
    <div className="h-[600px] overflow-y-auto">
      {/* Filter Badge */}
      {statusFilter !== 'all' && onClearFilter && (
        <div className="p-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm font-medium ${getFilterColor()}`}>
              <span>Filtered by: {getFilterLabel()}</span>
            </div>
            <button
              onClick={onClearFilter}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      )}
      <div className="divide-y divide-slate-800">{incidents.map((incident) => {
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
          const imageCount = imageUrls.filter(url => url && url !== '' && url !== null).length;
          
          const isTrappedCivilians = incident.type === 'Trapped Civilians';
          
          return (
          <div
            key={incident.id}
            className={`p-4 hover:bg-slate-800/50 transition-colors cursor-pointer ${
              isTrappedCivilians ? 'border-2 border-red-500 bg-red-500/10 rounded-lg mb-2' : ''
            }`}
            onClick={() => onIncidentClick(incident)}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`p-2 rounded-lg ${
                isTrappedCivilians 
                  ? 'bg-red-500/30 text-red-400 border-2 border-red-500' 
                  : incident.severity >= 4 
                  ? 'bg-red-500/20 text-red-400' 
                  : 'bg-orange-500/20 text-orange-400'
              }`}>
                {getIcon(incident.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{incident.type}</h3>
                    {isTrappedCivilians && (
                      <span className="text-xs px-2 py-0.5 rounded bg-red-500 text-white font-bold animate-pulse">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatTime(incident.timestamp)}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  {/* Severity Badge */}
                  <span className={`text-xs px-2 py-1 rounded border ${getSeverityColor(incident.severity)}`}>
                    Severity {incident.severity}
                  </span>
                  
                  {/* Action Status Dropdown */}
                  <select
                    value={incident.actionStatus || 'pending'}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(incident.id, e.target.value as ActionStatus);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-xs px-2 py-1 rounded border cursor-pointer ${getActionStatusColor(incident.actionStatus)} bg-slate-800`}
                  >
                    <option value="pending" className="bg-slate-800">🔴 Pending</option>
                    <option value="taking action" className="bg-slate-800">🟡 Taking Action</option>
                    <option value="completed" className="bg-slate-800">🟢 Completed</option>
                  </select>
                  
                  {/* Has Images Indicator */}
                  {hasImages && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/50 flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {imageCount} photo{imageCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  
                  {/* Location */}
                  <span className="text-xs text-slate-500">
                    {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                  </span>
                </div>

                {/* Trapped Civilians Details */}
                {isTrappedCivilians && incident.description && (() => {
                  const parts = incident.description.split(' | ');
                  const trappedCount = parts[0]?.replace('TRAPPED PEOPLE: ', '') || 'Unknown';
                  const details = parts[1]?.replace('DETAILS: ', '') || '';
                  return (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-bold text-red-400">
                          {trappedCount} {parseInt(trappedCount) === 1 ? 'Person' : 'People'} Trapped
                        </span>
                      </div>
                      {details && (
                        <p className="text-xs text-slate-300 line-clamp-2">
                          <span className="font-semibold text-red-400">Details:</span> {details}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Road Block Route */}
                {incident.type === 'Road Block' && incident.description && incident.description.startsWith('ROUTE:') && (
                  <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-bold text-orange-400">
                        Blocked Route:
                      </span>
                      <span className="text-sm text-slate-300">
                        {incident.description.replace('ROUTE: ', '')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        })}

        {incidents.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No incidents reported
          </div>
        )}
      </div>
    </div>
  );
}
