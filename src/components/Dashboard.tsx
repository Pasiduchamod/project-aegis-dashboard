import type { Incident } from '../types.js';
import MapComponent from './MapComponent';
import IncidentList from './IncidentList';
import logo from '../assets/logo.png';

interface DashboardProps {
  incidents: Incident[];
  isLive: boolean;
}

export default function Dashboard({ incidents, isLive }: DashboardProps) {
  const criticalCount = incidents.filter((i) => i.severity >= 4).length;
  const lastUpdate = new Date();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="LankaSafe" 
              className="w-12 h-12 rounded-full object-cover border-2 border-red-500 shadow-lg shadow-red-500/50"
            />
            <h1 className="text-2xl font-bold">LankaSafe HQ</h1>
          </div>
          
          {/* Live Sync Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-sm font-medium">{isLive ? 'Live Sync' : 'Paused'}</span>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Incidents */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-1">Total Incidents</div>
          <div className="text-3xl font-bold">{incidents.length}</div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-slate-900 border border-red-900/50 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-1">Critical Alerts</div>
          <div className="text-3xl font-bold text-red-500">{criticalCount}</div>
        </div>

        {/* Last Updated */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <div className="text-sm text-slate-400 mb-1">Last Updated</div>
          <div className="text-lg font-medium">
            {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Main Grid: Map + Incident Feed */}
      <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map (66% width on desktop) */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold">Live Incident Map</h2>
            </div>
            <MapComponent incidents={incidents} />
          </div>
        </div>

        {/* Incident Feed (33% width on desktop) */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold">Recent Reports</h2>
            </div>
            <IncidentList incidents={incidents} />
          </div>
        </div>
      </div>
    </div>
  );
}
