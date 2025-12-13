import { Icon, LatLngExpression, divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import type { AidRequest, DetentionCamp, Incident } from '../types.js';

interface MapComponentProps {
  incidents: Incident[];
  aidRequests?: AidRequest[];
  camps?: DetentionCamp[];
  selectedDistrict: string;
  onMapClick?: (lat: number, lng: number) => void;
  enableMapClick?: boolean;
  tempMarkerLocation?: { lat: number; lng: number } | null;
}

// District coordinates for Sri Lanka
const DISTRICT_COORDS: { [key: string]: { center: LatLngExpression; zoom: number } } = {
  'All Districts': { center: [7.8731, 80.7718], zoom: 7 }, // Center of Sri Lanka
  'Colombo': { center: [6.9271, 79.8612], zoom: 11 },
  'Gampaha': { center: [7.0833, 80.0167], zoom: 10 },
  'Kalutara': { center: [6.5854, 79.9607], zoom: 10 },
  'Kandy': { center: [7.2906, 80.6337], zoom: 10 },
  'Matale': { center: [7.4675, 80.6234], zoom: 10 },
  'Nuwara Eliya': { center: [6.9497, 80.7891], zoom: 10 },
  'Galle': { center: [6.0535, 80.2210], zoom: 10 },
  'Matara': { center: [5.9549, 80.5550], zoom: 10 },
  'Hambantota': { center: [6.1429, 81.1212], zoom: 10 },
  'Jaffna': { center: [9.6615, 80.0255], zoom: 10 },
  'Kilinochchi': { center: [9.3964, 80.3981], zoom: 10 },
  'Mannar': { center: [8.9810, 79.9044], zoom: 10 },
  'Vavuniya': { center: [8.7542, 80.4982], zoom: 10 },
  'Mullaitivu': { center: [9.2671, 80.8142], zoom: 10 },
  'Batticaloa': { center: [7.7310, 81.6747], zoom: 10 },
  'Ampara': { center: [7.2973, 81.6747], zoom: 10 },
  'Trincomalee': { center: [8.5874, 81.2152], zoom: 10 },
  'Kurunegala': { center: [7.4818, 80.3609], zoom: 10 },
  'Puttalam': { center: [8.0362, 79.8283], zoom: 10 },
  'Anuradhapura': { center: [8.3114, 80.4037], zoom: 10 },
  'Polonnaruwa': { center: [7.9403, 81.0188], zoom: 10 },
  'Badulla': { center: [6.9934, 81.0550], zoom: 10 },
  'Monaragala': { center: [6.8728, 81.3507], zoom: 10 },
  'Ratnapura': { center: [6.6828, 80.3992], zoom: 10 },
  'Kegalle': { center: [7.2513, 80.3464], zoom: 10 },
};

// Component to handle map clicks
function MapClickHandler({ onClick, enabled }: { onClick?: (lat: number, lng: number) => void; enabled?: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (enabled) {
      map.getContainer().style.cursor = 'crosshair';
    } else {
      map.getContainer().style.cursor = '';
    }
    return () => {
      map.getContainer().style.cursor = '';
    };
  }, [enabled, map]);

  useMapEvents({
    click(e) {
      if (enabled && onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Component to fix map size issues and handle zoom changes
function MapController({ selectedDistrict }: { selectedDistrict: string }) {
  const map = useMap();
  
  useEffect(() => {
    // Invalidate map size after a short delay to ensure container is rendered
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [map]);
  
  useEffect(() => {
    // Update map view when district changes
    const coords = DISTRICT_COORDS[selectedDistrict] || DISTRICT_COORDS['All Districts'];
    map.setView(coords.center, coords.zoom, { animate: true });
  }, [selectedDistrict, map]);
  
  return null;
}

// Fix for default marker icon
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create location pin icon for new camp marker
const createLocationPinIcon = () => {
  return divIcon({
    className: 'custom-location-pin',
    html: `
      <div style="
        position: relative;
        width: 40px;
        height: 40px;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="white"></circle>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [10, -40],
  });
};

// Create custom camp icon
const createCampIcon = (status: string) => {
  const color = status === 'operational' ? '#10b981' : status === 'full' ? '#f59e0b' : '#ef4444';
  return divIcon({
    className: 'custom-camp-icon',
    html: `
      <div style="
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export default function MapComponent({ incidents, aidRequests = [], camps = [], selectedDistrict, onMapClick, enableMapClick = false, tempMarkerLocation }: MapComponentProps) {
  const defaultCoords = DISTRICT_COORDS[selectedDistrict] || DISTRICT_COORDS['All Districts'];

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

  return (
    <div className="h-[600px] w-full">
      <MapContainer
        center={defaultCoords.center}
        zoom={defaultCoords.zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        scrollWheelZoom={true}
      >
        <MapController selectedDistrict={selectedDistrict} />
        <MapClickHandler onClick={onMapClick} enabled={enableMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {incidents.map((incident) => {
          const position: LatLngExpression = [incident.latitude, incident.longitude];
          const isCritical = incident.severity >= 4;

          return (
            <CircleMarker
              key={incident.id}
              center={position}
              radius={isCritical ? 12 : 8}
              pathOptions={{
                fillColor: isCritical ? '#ef4444' : '#f59e0b',
                fillOpacity: 0.8,
                color: isCritical ? '#dc2626' : '#d97706',
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                <div className="text-xs">
                  <div className="font-semibold">{incident.type}</div>
                  <div>Severity: {incident.severity}</div>
                  <div className="text-gray-600">{formatTime(incident.timestamp)}</div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-base mb-1">{incident.type}</div>
                  <div className="text-gray-600">
                    Severity: <span className={isCritical ? 'text-red-600 font-semibold' : 'text-orange-600'}>{incident.severity}</span>
                  </div>
                  <div className="text-gray-600 text-xs mt-1">
                    Status: <span className={
                      incident.actionStatus === 'completed' ? 'text-green-600 font-semibold' :
                      incident.actionStatus === 'taking action' ? 'text-blue-600 font-semibold' :
                      'text-gray-500'
                    }>
                      {incident.actionStatus === 'completed' ? '🟢 Completed' :
                       incident.actionStatus === 'taking action' ? '🟡 Taking Action' :
                       '🔴 Pending'}
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {formatTime(incident.timestamp)}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Render Aid Request Markers */}
        {aidRequests.map((aidRequest) => {
          const position: LatLngExpression = [aidRequest.latitude, aidRequest.longitude];
          const isHighPriority = aidRequest.priority_level >= 4;
          const aidTypes = JSON.parse(aidRequest.aid_types) as string[];

          return (
            <CircleMarker
              key={aidRequest.id}
              center={position}
              radius={isHighPriority ? 12 : 8}
              pathOptions={{
                fillColor: isHighPriority ? '#3b82f6' : '#60a5fa',
                fillOpacity: 0.8,
                color: isHighPriority ? '#2563eb' : '#3b82f6',
                weight: 2,
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                <div className="text-xs">
                  <div className="font-semibold text-blue-600">🆘 {aidTypes[0] || 'Aid Request'}</div>
                  {aidTypes.length > 1 && (
                    <div className="text-gray-500">+{aidTypes.length - 1} more</div>
                  )}
                  <div>Priority: {aidRequest.priority_level}</div>
                  <div className="text-gray-600">{formatTime(aidRequest.created_at)}</div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-base mb-1 text-blue-600">🆘 {aidTypes[0] || 'Aid Request'}</div>
                  {aidTypes.length > 1 && (
                    <div className="text-xs text-gray-600 mb-1">
                      +{aidTypes.length - 1} more type{aidTypes.length > 2 ? 's' : ''}
                    </div>
                  )}
                  <div className="text-gray-600">
                    Priority: <span className={isHighPriority ? 'text-red-600 font-semibold' : 'text-blue-600'}>{aidRequest.priority_level}</span>
                  </div>
                  {aidRequest.description && (
                    <div className="text-gray-600 text-xs mt-1 italic">
                      {aidRequest.description.substring(0, 50)}{aidRequest.description.length > 50 ? '...' : ''}
                    </div>
                  )}
                  <div className="text-gray-600 text-xs mt-1">
                    Status: <span className={
                      aidRequest.aidStatus === 'completed' ? 'text-green-600 font-semibold' :
                      aidRequest.aidStatus === 'taking action' ? 'text-blue-600 font-semibold' :
                      'text-gray-500'
                    }>
                      {aidRequest.aidStatus === 'completed' ? '🟢 Completed' :
                       aidRequest.aidStatus === 'taking action' ? '🟡 Taking Action' :
                       '🔴 Pending'}
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {formatTime(aidRequest.created_at)}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Render Detention Camp Markers */}
        {camps.map((camp) => {
          const position: LatLngExpression = [camp.latitude, camp.longitude];
          const occupancyPercentage = (camp.current_occupancy / camp.capacity) * 100;
          let facilities: string[] = [];
          try {
            facilities = JSON.parse(camp.facilities);
          } catch {
            facilities = [];
          }

          return (
            <Marker
              key={camp.id}
              position={position}
              icon={createCampIcon(camp.campStatus)}
            >
              <Tooltip direction="top" offset={[0, -16]} opacity={0.9}>
                <div className="text-xs">
                  <div className="font-semibold">🏠 {camp.name}</div>
                  <div>Occupancy: {camp.current_occupancy}/{camp.capacity}</div>
                  <div className={
                    camp.campStatus === 'operational' ? 'text-green-600' :
                    camp.campStatus === 'full' ? 'text-orange-600' :
                    'text-red-600'
                  }>
                    {camp.campStatus === 'operational' ? '✓ Operational' :
                     camp.campStatus === 'full' ? '⚠ Full' :
                     '✗ Closed'}
                  </div>
                </div>
              </Tooltip>
              <Popup>
                <div className="text-sm min-w-[200px]">
                  <div className="font-bold text-base mb-2 flex items-center gap-2">
                    <span>🏠</span>
                    {camp.name}
                  </div>
                  
                  <div className="space-y-1 mb-2">
                    <div className="text-gray-600">
                      <span className="font-semibold">Status:</span>{' '}
                      <span className={
                        camp.campStatus === 'operational' ? 'text-green-600 font-semibold' :
                        camp.campStatus === 'full' ? 'text-orange-600 font-semibold' :
                        'text-red-600 font-semibold'
                      }>
                        {camp.campStatus === 'operational' ? '🟢 Operational' :
                         camp.campStatus === 'full' ? '🟡 Full' :
                         '🔴 Closed'}
                      </span>
                    </div>
                    
                    <div className="text-gray-600">
                      <span className="font-semibold">Capacity:</span> {camp.current_occupancy}/{camp.capacity}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          occupancyPercentage >= 90 ? 'bg-red-500' :
                          occupancyPercentage >= 70 ? 'bg-orange-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(occupancyPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {facilities.length > 0 && (
                    <div className="text-gray-600 text-xs mb-2">
                      <div className="font-semibold mb-1">Facilities:</div>
                      <div className="flex flex-wrap gap-1">
                        {facilities.slice(0, 3).map(facility => (
                          <span key={facility} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                            {facility}
                          </span>
                        ))}
                        {facilities.length > 3 && (
                          <span className="text-gray-500">+{facilities.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}

                  {camp.contact_person && (
                    <div className="text-gray-600 text-xs mt-2 pt-2 border-t">
                      <div><span className="font-semibold">Contact:</span> {camp.contact_person}</div>
                      {camp.contact_phone && <div>{camp.contact_phone}</div>}
                    </div>
                  )}

                  {camp.description && (
                    <div className="text-gray-500 text-xs mt-2 italic">
                      {camp.description}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Temporary marker for new camp location */}
        {tempMarkerLocation && (
          <Marker
            position={[tempMarkerLocation.lat, tempMarkerLocation.lng]}
            icon={createLocationPinIcon()}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold text-blue-600 mb-1">📍 New Camp Location</div>
                <div className="text-xs text-gray-600">
                  {tempMarkerLocation.lat.toFixed(6)}, {tempMarkerLocation.lng.toFixed(6)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
