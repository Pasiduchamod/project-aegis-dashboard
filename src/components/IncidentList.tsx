import { Droplets, Mountain, Flame, Zap, Cloud, AlertTriangle } from 'lucide-react';
import type { Incident } from '../types.js';

interface IncidentListProps {
  incidents: Incident[];
}

export default function IncidentList({ incidents }: IncidentListProps) {
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

  return (
    <div className="h-[600px] overflow-y-auto">
      <div className="divide-y divide-slate-800">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`p-2 rounded-lg ${
                incident.severity >= 4 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
              }`}>
                {getIcon(incident.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-sm">{incident.type}</h3>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {formatTime(incident.timestamp)}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {/* Severity Badge */}
                  <span className={`text-xs px-2 py-1 rounded border ${getSeverityColor(incident.severity)}`}>
                    Severity {incident.severity}
                  </span>
                  
                  {/* Location */}
                  <span className="text-xs text-slate-500">
                    {incident.latitude.toFixed(4)}, {incident.longitude.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {incidents.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No incidents reported
          </div>
        )}
      </div>
    </div>
  );
}
