import { AlertTriangle, Camera, Cloud, Droplets, Filter, Flame, Mountain, Users, X, Zap } from 'lucide-react';
import React from 'react';
import { updateIncidentActionStatus } from '../services/firebaseService.js';
import type { ActionStatus, Incident } from '../types.js';

interface IncidentListProps {
  incidents: Incident[];
  onIncidentClick: (incident: Incident) => void;
  statusFilter?: 'all' | 'critical' | 'completed' | 'pending';
  onClearFilter?: () => void;
}

type IncidentType = 'all' | 'flood' | 'landslide' | 'fire' | 'earthquake' | 'storm' | 'trapped civilians' | 'road block' | 'power line down';

export default function IncidentList({ incidents, onIncidentClick, statusFilter = 'all', onClearFilter }: IncidentListProps) {
  const [typeFilter, setTypeFilter] = React.useState<IncidentType>('all');

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

  // Filter incidents by type
  const displayedIncidents = typeFilter === 'all' 
    ? incidents 
    : incidents.filter(incident => incident.type.toLowerCase() === typeFilter.toLowerCase());

  return (
    <div className="h-[600px] overflow-y-auto">
      {/* Filter Controls */}
      <div className="sticky top-0 bg-slate-900 z-10 border-b border-slate-700">
        {/* Status Filter Badge */}
        {statusFilter !== 'all' && onClearFilter && (
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg text-sm font-semibold shadow-lg ${getFilterColor()}`}>
                <span>📌 Status: {getFilterLabel()}</span>
              </div>
              <button
                onClick={onClearFilter}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-md"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
        )}
        
        {/* Type Filter Dropdown */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <label className="text-sm font-semibold text-slate-300">Filter by Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as IncidentType)}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="all">All Types ({incidents.length})</option>
              <option value="trapped civilians">👥 Trapped Civilians</option>
              <option value="flood">💧 Flood</option>
              {/* <option value="fire">🔥 Fire</option> */}
              <option value="landslide">⛰️ Landslide</option>
              {/* <option value="earthquake">⚡ Earthquake</option> */}
              {/* <option value="storm">🌩️ Storm</option> */}
              <option value="road block">🚧 Road Block</option>
              <option value="power line down">⚡ Power Line Down</option>
            </select>
            {typeFilter !== 'all' && (
              <button
                onClick={() => setTypeFilter('all')}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
      <div className="space-y-4">{displayedIncidents.map((incident) => {
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
            className={`p-5 rounded-xl border transition-all cursor-pointer shadow-lg ${
              isTrappedCivilians 
                ? 'border-red-500 bg-red-500/10 hover:bg-red-500/20' 
                : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
            }`}
            onClick={() => onIncidentClick(incident)}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`p-3 rounded-xl shadow-md ${
                isTrappedCivilians 
                  ? 'bg-red-500/30 text-red-400 border-2 border-red-500' 
                  : incident.severity >= 4 
                  ? 'bg-red-500/30 text-red-400' 
                  : 'bg-orange-500/30 text-orange-400'
              }`}>
                {getIcon(incident.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-base text-white">{incident.type}</h3>
                    {isTrappedCivilians && (
                      <span className="text-xs px-2.5 py-1 rounded-md bg-red-500 text-white font-bold animate-pulse shadow-lg">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-slate-400 whitespace-nowrap font-medium">
                    {formatTime(incident.timestamp)}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2.5 flex-wrap">
                  {/* Severity Badge */}
                  <span className={`text-sm px-3 py-1.5 rounded-lg border font-semibold ${getSeverityColor(incident.severity)}`}>
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
                    className={`text-sm px-3 py-1.5 rounded-lg border cursor-pointer font-semibold ${getActionStatusColor(incident.actionStatus)} bg-slate-800`}
                  >
                    <option value="pending" className="bg-slate-800">🔴 Pending</option>
                    <option value="taking action" className="bg-slate-800">🟡 Taking Action</option>
                    <option value="completed" className="bg-slate-800">🟢 Completed</option>
                  </select>
                  
                  {/* Has Images Indicator */}
                  {hasImages && (
                    <span className="text-sm px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/50 flex items-center gap-1.5 font-medium">
                      <Camera className="w-4 h-4" />
                      {imageCount} photo{imageCount !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                
                {/* Location - Separate Line */}
                <div className="mt-3 text-sm text-slate-400">
                  📍 {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
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

        {displayedIncidents.length === 0 && (
          <div className="p-8 text-center">
            <div className="text-slate-400 text-lg font-semibold mb-2">
              {typeFilter !== 'all' || statusFilter !== 'all' 
                ? '🔍 No incidents match your filters' 
                : '📭 No incidents reported'}
            </div>
            {(typeFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setTypeFilter('all');
                  if (onClearFilter) onClearFilter();
                }}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
