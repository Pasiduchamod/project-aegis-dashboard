import { useState } from 'react';
import type { Incident, AidRequest } from '../types.js';
import MapComponent from './MapComponent';
import IncidentList from './IncidentList';
import IncidentDetailModal from './IncidentDetailModal';
import AidRequestList from './AidRequestList';
import AidRequestDetailModal from './AidRequestDetailModal';
import logo from '../assets/logo.png';
import { AlertTriangle, HandHeart } from 'lucide-react';

interface DashboardProps {
  incidents: Incident[];
  aidRequests: AidRequest[];
  isLive: boolean;
}

type TabType = 'incidents' | 'aidRequests';

const SRI_LANKA_DISTRICTS = [
  'All Districts',
  'Colombo', 'Gampaha', 'Kalutara',
  'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota',
  'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu',
  'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam',
  'Anuradhapura', 'Polonnaruwa',
  'Badulla', 'Monaragala',
  'Ratnapura', 'Kegalle'
];

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
  'Batticaloa': [7.50, 81.40, 8.05, 81.90],
  'Ampara': [6.95, 81.40, 7.60, 81.95],
  'Trincomalee': [8.30, 80.95, 8.85, 81.45],
  'Kurunegala': [7.30, 80.15, 7.90, 80.65],
  'Puttalam': [7.80, 79.65, 8.50, 80.15],
  'Anuradhapura': [7.95, 80.20, 8.60, 80.70],
  'Polonnaruwa': [7.70, 80.85, 8.20, 81.35],
  'Badulla': [6.75, 80.85, 7.25, 81.35],
  'Monaragala': [6.60, 81.15, 7.05, 81.75],
  'Ratnapura': [6.45, 80.20, 6.95, 80.65],
  'Kegalle': [7.05, 80.20, 7.45, 80.50],
};

// Function to check if coordinates are within district bounds
const isInDistrict = (lat: number, lng: number, district: string): boolean => {
  const bounds = DISTRICT_BOUNDS[district];
  if (!bounds) return false;
  const [minLat, minLng, maxLat, maxLng] = bounds;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
};

export default function Dashboard({ incidents, aidRequests, isLive }: DashboardProps) {
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedAidRequest, setSelectedAidRequest] = useState<AidRequest | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('incidents');
  
  const filteredIncidents = selectedDistrict === 'All Districts' 
    ? incidents 
    : incidents.filter(i => isInDistrict(i.latitude, i.longitude, selectedDistrict));
  
  const filteredAidRequests = selectedDistrict === 'All Districts'
    ? aidRequests
    : aidRequests.filter(ar => isInDistrict(ar.latitude, ar.longitude, selectedDistrict));
  
  const criticalCount = filteredIncidents.filter((i) => i.severity >= 4).length;
  const criticalAidCount = filteredAidRequests.filter((ar) => ar.priority_level >= 4).length;
  const completedIncidents = filteredIncidents.filter((i) => i.actionStatus === 'completed').length;
  const pendingIncidents = filteredIncidents.filter((i) => i.actionStatus === 'pending').length;
  const completedAidRequests = filteredAidRequests.filter((ar) => ar.aidStatus === 'completed').length;
  const pendingAidRequests = filteredAidRequests.filter((ar) => ar.aidStatus === 'pending').length;
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

      {/* Tab Navigation */}
      <div className="px-6 pt-6">
        <div className="flex gap-2 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'incidents'
                ? 'text-red-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Incidents
            <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold">
              {filteredIncidents.length}
            </span>
            {activeTab === 'incidents' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('aidRequests')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'aidRequests'
                ? 'text-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HandHeart className="w-5 h-5" />
            Aid Requests
            <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
              {filteredAidRequests.length}
            </span>
            {activeTab === 'aidRequests' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {activeTab === 'incidents' ? (
          <>
            {/* Total Incidents */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Total Incidents</div>
              <div className="text-3xl font-bold">{filteredIncidents.length}</div>
            </div>

            {/* Critical Alerts */}
            <div className="bg-slate-900 border border-red-900/50 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Critical Alerts</div>
              <div className="text-3xl font-bold text-red-500">{criticalCount}</div>
            </div>

            {/* Completed */}
            <div className="bg-slate-900 border border-green-900/50 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-500">{completedIncidents}</div>
            </div>

            {/* Pending */}
            <div className="bg-slate-900 border border-yellow-900/50 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Pending</div>
              <div className="text-3xl font-bold text-yellow-500">{pendingIncidents}</div>
            </div>

            {/* Last Updated */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Last Updated</div>
              <div className="text-lg font-medium">
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Total Aid Requests */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Total Aid Requests</div>
              <div className="text-3xl font-bold">{filteredAidRequests.length}</div>
            </div>

            {/* Critical Priority */}
            <div className="bg-slate-900 border border-red-900/50 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">High Priority</div>
              <div className="text-3xl font-bold text-red-500">{criticalAidCount}</div>
            </div>

            {/* Completed */}
            <div className="bg-slate-900 border border-green-900/50 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-500">{completedAidRequests}</div>
            </div>

            {/* Pending */}
            <div className="bg-slate-900 border border-yellow-900/50 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Pending</div>
              <div className="text-3xl font-bold text-yellow-500">{pendingAidRequests}</div>
            </div>

            {/* Last Updated */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Last Updated</div>
              <div className="text-lg font-medium">
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Grid: Map + Feed */}
      <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map (66% width on desktop) */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {activeTab === 'incidents' ? 'Live Incident Map' : 'Aid Request Map'}
              </h2>
              <select 
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-red-500 cursor-pointer"
              >
                {SRI_LANKA_DISTRICTS.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            <MapComponent 
              incidents={activeTab === 'incidents' ? filteredIncidents : []} 
              selectedDistrict={selectedDistrict} 
            />
          </div>
        </div>

        {/* Feed (33% width on desktop) */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-lg font-semibold">
                {activeTab === 'incidents' ? 'Recent Reports' : 'Recent Aid Requests'}
              </h2>
            </div>
            {activeTab === 'incidents' ? (
              <IncidentList incidents={filteredIncidents} onIncidentClick={setSelectedIncident} />
            ) : (
              <AidRequestList aidRequests={filteredAidRequests} onAidRequestClick={setSelectedAidRequest} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <IncidentDetailModal 
        incident={selectedIncident} 
        onClose={() => setSelectedIncident(null)} 
      />
      <AidRequestDetailModal 
        aidRequest={selectedAidRequest} 
        onClose={() => setSelectedAidRequest(null)} 
      />
    </div>
  );
}
