import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { Icon, LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Incident } from '../types.js';

interface MapComponentProps {
  incidents: Incident[];
  selectedDistrict: string;
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

export default function MapComponent({ incidents, selectedDistrict }: MapComponentProps) {
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
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-base mb-1">{incident.type}</div>
                  <div className="text-gray-600">
                    Severity: <span className={isCritical ? 'text-red-600 font-semibold' : 'text-orange-600'}>{incident.severity}</span>
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {formatTime(incident.timestamp)}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
