import { AlertTriangle, ArrowUpDown, BarChart3, Building2, HandHeart, LogOut, MapPin } from 'lucide-react';
import { useState } from 'react';
import logo from '../assets/logo.png';
import type { AidRequest, DetentionCamp, Incident } from '../types.js';
import AddDetentionCampModal from './AddDetentionCampModal';
import AidRequestDetailModal from './AidRequestDetailModal';
import AidRequestList from './AidRequestList';
import DetentionCampDetailModal from './DetentionCampDetailModal';
import DetentionCampList from './DetentionCampList';
import IncidentDetailModal from './IncidentDetailModal';
import IncidentList from './IncidentList';
import MapComponent from './MapComponent';
import StatsOverview from './StatsOverview';
import VolunteerList from './VolunteerList';

interface Volunteer {
  id: string;
  user_email: string;
  full_name: string;
  phone_number: string;
  district: string; // JSON string array
  skills: string;
  availability: string;
  preferred_tasks: string;
  emergency_contact?: string;
  emergency_phone?: string;
  approved: boolean;
  created_at: number;
  updated_at: number;
}

interface DashboardProps {
  incidents: Incident[];
  aidRequests: AidRequest[];
  detentionCamps: DetentionCamp[];
  volunteers: Volunteer[];
  isLive: boolean;
  onLogout?: () => void;
}

type TabType = 'stats' | 'incidents' | 'aidRequests' | 'detentionCamps' | 'volunteers';

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

export default function Dashboard({ incidents, aidRequests, detentionCamps, volunteers, isLive, onLogout }: DashboardProps) {
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedAidRequest, setSelectedAidRequest] = useState<AidRequest | null>(null);
  const [selectedCamp, setSelectedCamp] = useState<DetentionCamp | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('incidents');
  const [showAddCampModal, setShowAddCampModal] = useState(false);
  const [incidentStatusFilter, setIncidentStatusFilter] = useState<'all' | 'critical' | 'completed' | 'pending'>('all');
  const [aidStatusFilter, setAidStatusFilter] = useState<'all' | 'critical' | 'completed' | 'pending'>('all');
  const [campApprovalFilter, setCampApprovalFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [selectedMapLocation, setSelectedMapLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'severity'>('recent');
  
  // Filter by district first
  const districtFilteredIncidents = selectedDistrict === 'All Districts' 
    ? incidents 
    : incidents.filter(i => isInDistrict(i.latitude, i.longitude, selectedDistrict));
  
  const districtFilteredAidRequests = selectedDistrict === 'All Districts'
    ? aidRequests
    : aidRequests.filter(ar => isInDistrict(ar.latitude, ar.longitude, selectedDistrict));
  
  const districtFilteredCamps = selectedDistrict === 'All Districts'
    ? detentionCamps
    : detentionCamps.filter(camp => {
        return isInDistrict(camp.latitude, camp.longitude, selectedDistrict);
      });
  
  const districtFilteredVolunteers = volunteers;
  
  // Calculate counts from district-filtered data (before status filter)
  const criticalCount = districtFilteredIncidents.filter((i) => i.severity >= 4).length;
  const criticalAidCount = districtFilteredAidRequests.filter((ar) => ar.priority_level >= 4).length;
  const completedIncidents = districtFilteredIncidents.filter((i) => i.actionStatus === 'completed').length;
  const pendingIncidents = districtFilteredIncidents.filter((i) => i.actionStatus === 'pending').length;
  const completedAidRequests = districtFilteredAidRequests.filter((ar) => ar.aidStatus === 'completed').length;
  const pendingAidRequests = districtFilteredAidRequests.filter((ar) => ar.aidStatus === 'pending').length;
  
  // Then apply status filter for display
  let filteredIncidents = districtFilteredIncidents;
  if (incidentStatusFilter === 'critical') {
    filteredIncidents = filteredIncidents.filter(i => i.severity >= 4);
  } else if (incidentStatusFilter === 'completed') {
    filteredIncidents = filteredIncidents.filter(i => i.actionStatus === 'completed');
  } else if (incidentStatusFilter === 'pending') {
    filteredIncidents = filteredIncidents.filter(i => i.actionStatus === 'pending');
  }
  
  // Apply sorting
  filteredIncidents = [...filteredIncidents].sort((a, b) => {
    if (sortBy === 'recent') {
      return b.timestamp - a.timestamp;
    } else if (sortBy === 'oldest') {
      return a.timestamp - b.timestamp;
    } else { // severity
      return b.severity - a.severity;
    }
  });
  
  let filteredAidRequests = districtFilteredAidRequests;
  if (aidStatusFilter === 'critical') {
    filteredAidRequests = filteredAidRequests.filter(ar => ar.priority_level >= 4);
  } else if (aidStatusFilter === 'completed') {
    filteredAidRequests = filteredAidRequests.filter(ar => ar.aidStatus === 'completed');
  } else if (aidStatusFilter === 'pending') {
    filteredAidRequests = filteredAidRequests.filter(ar => ar.aidStatus === 'pending');
  }
  
  // Apply sorting
  filteredAidRequests = [...filteredAidRequests].sort((a, b) => {
    if (sortBy === 'recent') {
      return b.created_at - a.created_at;
    } else if (sortBy === 'oldest') {
      return a.created_at - b.created_at;
    } else { // severity
      return b.priority_level - a.priority_level;
    }
  });
  
  let filteredCamps = districtFilteredCamps;
  
  // Calculate counts before approval filter
  const pendingApprovalCamps = filteredCamps.filter((camp) => camp.adminApproved === false).length;
  const approvedCamps = filteredCamps.filter((camp) => camp.adminApproved === true).length;
  
  // Apply approval filter for display
  if (campApprovalFilter === 'pending') {
    filteredCamps = filteredCamps.filter(camp => camp.adminApproved === false);
  } else if (campApprovalFilter === 'approved') {
    filteredCamps = filteredCamps.filter(camp => camp.adminApproved === true);
  }
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
          
          {/* Right Side - District Filter, Sort, Live Sync Indicator and Logout */}
          <div className="flex items-center gap-4">
            {/* District Filter */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer text-sm font-medium"
              >
                {SRI_LANKA_DISTRICTS.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            {/* Sort Filter */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest' | 'severity')}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer text-sm font-medium"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="severity">By Severity</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-sm font-medium">{isLive ? 'Live Sync' : 'Paused'}</span>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            )}
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
          <button
            onClick={() => setActiveTab('detentionCamps')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'detentionCamps'
                ? 'text-purple-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-5 h-5" />
            Detention Camps
            <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
              {filteredCamps.length}
            </span>
            {activeTab === 'detentionCamps' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'volunteers'
                ? 'text-indigo-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HandHeart className="w-5 h-5" />
            Volunteers
            {activeTab === 'volunteers' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors relative ${
              activeTab === 'stats'
                ? 'text-green-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Overview & Stats
            {activeTab === 'stats' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-400" />
            )}
          </button>
        </div>
      </div>

      {/* Stats Row - Hide for volunteers and stats tabs */}
      {activeTab !== 'volunteers' && activeTab !== 'stats' && (
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {activeTab === 'incidents' ? (
          <>
            {/* Total Incidents */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Total Incidents</div>
              <div className="text-3xl font-bold">{filteredIncidents.length}</div>
            </div>

            {/* Critical Alerts */}
            <button
              onClick={() => setIncidentStatusFilter(incidentStatusFilter === 'critical' ? 'all' : 'critical')}
              className={`bg-slate-900 border rounded-lg p-6 text-left transition-all hover:scale-105 ${
                incidentStatusFilter === 'critical' 
                  ? 'border-red-500 shadow-lg shadow-red-500/20' 
                  : 'border-red-900/50 hover:border-red-700'
              }`}
            >
              <div className="text-sm text-slate-400 mb-1">Critical Alerts</div>
              <div className="text-3xl font-bold text-red-500">{criticalCount}</div>
            </button>

            {/* Completed */}
            <button
              onClick={() => setIncidentStatusFilter(incidentStatusFilter === 'completed' ? 'all' : 'completed')}
              className={`bg-slate-900 border rounded-lg p-6 text-left transition-all hover:scale-105 ${
                incidentStatusFilter === 'completed' 
                  ? 'border-green-500 shadow-lg shadow-green-500/20' 
                  : 'border-green-900/50 hover:border-green-700'
              }`}
            >
              <div className="text-sm text-slate-400 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-500">{completedIncidents}</div>
            </button>

            {/* Pending */}
            <button
              onClick={() => setIncidentStatusFilter(incidentStatusFilter === 'pending' ? 'all' : 'pending')}
              className={`bg-slate-900 border rounded-lg p-6 text-left transition-all hover:scale-105 ${
                incidentStatusFilter === 'pending' 
                  ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' 
                  : 'border-yellow-900/50 hover:border-yellow-700'
              }`}
            >
              <div className="text-sm text-slate-400 mb-1">Pending</div>
              <div className="text-3xl font-bold text-yellow-500">{pendingIncidents}</div>
            </button>

            {/* Last Updated */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Last Updated</div>
              <div className="text-lg font-medium">
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </>
        ) : activeTab === 'aidRequests' ? (
          <>
            {/* Total Aid Requests */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Total Aid Requests</div>
              <div className="text-3xl font-bold">{filteredAidRequests.length}</div>
            </div>

            {/* Critical Priority */}
            <button
              onClick={() => setAidStatusFilter(aidStatusFilter === 'critical' ? 'all' : 'critical')}
              className={`bg-slate-900 border rounded-lg p-6 text-left transition-all hover:scale-105 ${
                aidStatusFilter === 'critical' 
                  ? 'border-red-500 shadow-lg shadow-red-500/20' 
                  : 'border-red-900/50 hover:border-red-700'
              }`}
            >
              <div className="text-sm text-slate-400 mb-1">High Priority</div>
              <div className="text-3xl font-bold text-red-500">{criticalAidCount}</div>
            </button>

            {/* Completed */}
            <button
              onClick={() => setAidStatusFilter(aidStatusFilter === 'completed' ? 'all' : 'completed')}
              className={`bg-slate-900 border rounded-lg p-6 text-left transition-all hover:scale-105 ${
                aidStatusFilter === 'completed' 
                  ? 'border-green-500 shadow-lg shadow-green-500/20' 
                  : 'border-green-900/50 hover:border-green-700'
              }`}
            >
              <div className="text-sm text-slate-400 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-500">{completedAidRequests}</div>
            </button>

            {/* Pending */}
            <button
              onClick={() => setAidStatusFilter(aidStatusFilter === 'pending' ? 'all' : 'pending')}
              className={`bg-slate-900 border rounded-lg p-6 text-left transition-all hover:scale-105 ${
                aidStatusFilter === 'pending' 
                  ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' 
                  : 'border-yellow-900/50 hover:border-yellow-700'
              }`}
            >
              <div className="text-sm text-slate-400 mb-1">Pending</div>
              <div className="text-3xl font-bold text-yellow-500">{pendingAidRequests}</div>
            </button>

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
            {/* Total Camps */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Total Camps</div>
              <div className="text-3xl font-bold">{districtFilteredCamps.length}</div>
            </div>

            {/* Pending Approval */}
            <button
              onClick={() => setCampApprovalFilter(campApprovalFilter === 'pending' ? 'all' : 'pending')}
              className={`bg-slate-900 border rounded-lg p-6 text-left transition-all hover:scale-105 ${
                campApprovalFilter === 'pending' 
                  ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' 
                  : 'border-yellow-900/50 hover:border-yellow-700'
              }`}
            >
              <div className="text-sm text-slate-400 mb-1">Pending Approval</div>
              <div className="text-3xl font-bold text-yellow-500">{pendingApprovalCamps}</div>
            </button>

            {/* Approved Camps */}
            <button
              onClick={() => setCampApprovalFilter(campApprovalFilter === 'approved' ? 'all' : 'approved')}
              className={`bg-slate-900 border rounded-lg p-6 text-left transition-all hover:scale-105 ${
                campApprovalFilter === 'approved' 
                  ? 'border-green-500 shadow-lg shadow-green-500/20' 
                  : 'border-green-900/50 hover:border-green-700'
              }`}
            >
              <div className="text-sm text-slate-400 mb-1">Approved</div>
              <div className="text-3xl font-bold text-green-500">{approvedCamps}</div>
            </button>

            {/* Operational */}
            <div className="bg-slate-900 border border-blue-900/50 rounded-lg p-6">
              <div className="text-sm text-slate-400 mb-1">Operational</div>
              <div className="text-3xl font-bold text-blue-500">{districtFilteredCamps.filter(c => c.campStatus === 'operational').length}</div>
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
      )}

      {/* Main Content */}
      {activeTab === 'stats' ? (
        <div className="px-6 pb-6">
          <StatsOverview 
            incidents={districtFilteredIncidents}
            aidRequests={districtFilteredAidRequests}
            detentionCamps={districtFilteredCamps}
          />
        </div>
      ) : activeTab === 'volunteers' ? (
        <div className="px-6 pb-6">
          <VolunteerList volunteers={districtFilteredVolunteers} />
        </div>
      ) : (
        <>
          {/* Main Grid: Map + Feed */}
          <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Map (66% width on desktop) */}
            <div className="lg:col-span-2">
              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <h2 className="text-lg font-semibold">
                    {activeTab === 'incidents' ? 'Live Incident Map' : activeTab === 'aidRequests' ? 'Aid Request Map' : 'Detention Camps Map'}
                  </h2>
                </div>
                <MapComponent 
                  incidents={activeTab === 'incidents' ? filteredIncidents : []} 
                  aidRequests={activeTab === 'aidRequests' ? filteredAidRequests : []}
                  camps={activeTab === 'detentionCamps' ? filteredCamps : []}
                  selectedDistrict={selectedDistrict}
                  onMapClick={(lat, lng) => {
                    if (activeTab === 'detentionCamps') {
                      setSelectedMapLocation({ lat, lng });
                      setShowAddCampModal(true);
                    }
                  }}
                  enableMapClick={activeTab === 'detentionCamps'}
                  tempMarkerLocation={selectedMapLocation}
                />
              </div>
            </div>

            {/* Feed (33% width on desktop) */}
            <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {activeTab === 'incidents' ? 'Recent Reports' : activeTab === 'aidRequests' ? 'Recent Aid Requests' : 'Registered Camps'}
                  </h2>
                </div>
                {activeTab === 'detentionCamps' && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>Click anywhere on the map to add a new camp</span>
                  </div>
                )}
              </div>
              {activeTab === 'incidents' ? (
                <IncidentList 
                  incidents={filteredIncidents} 
                  onIncidentClick={setSelectedIncident}
                  statusFilter={incidentStatusFilter}
                  onClearFilter={() => setIncidentStatusFilter('all')}
                />
              ) : activeTab === 'aidRequests' ? (
                <AidRequestList 
                  aidRequests={filteredAidRequests} 
                  onAidRequestClick={setSelectedAidRequest}
                  statusFilter={aidStatusFilter}
                  onClearFilter={() => setAidStatusFilter('all')}
                />
              ) : (
                <DetentionCampList camps={filteredCamps} onCampClick={setSelectedCamp} />
              )}
            </div>
          </div>
        </div>
        </>
      )}

      {/* Modals */}
      <IncidentDetailModal 
        incident={selectedIncident} 
        onClose={() => setSelectedIncident(null)} 
      />
      <AidRequestDetailModal 
        aidRequest={selectedAidRequest} 
        onClose={() => setSelectedAidRequest(null)} 
      />
      <DetentionCampDetailModal 
        camp={selectedCamp} 
        onClose={() => setSelectedCamp(null)} 
      />
      {showAddCampModal && (
        <AddDetentionCampModal 
          onClose={() => {
            setShowAddCampModal(false);
            setSelectedMapLocation(null);
          }} 
          onSuccess={() => {
            setShowAddCampModal(false);
            setSelectedMapLocation(null);
          }}
          initialLocation={selectedMapLocation}
        />
      )}
    </div>
  );
}
