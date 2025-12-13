import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Incident } from '../types.js';

interface MapComponentProps {
  incidents: Incident[];
}

// Component to fix map size issues
function MapResizer() {
  const map = useMap();
  
  useEffect(() => {
    // Invalidate map size after a short delay to ensure container is rendered
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [map]);
  
  return null;
}

// Fix for default marker icon
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapComponent({ incidents }: MapComponentProps) {
  const center: LatLngExpression = [6.6828, 80.3992]; // Ratnapura, Sri Lanka

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
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        scrollWheelZoom={true}
      >
        <MapResizer />
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
