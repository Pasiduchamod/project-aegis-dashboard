import { Icon, LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (lat: number, lng: number) => void;
  selectedDistrict?: string;
  initialLat?: number;
  initialLng?: number;
}

const DISTRICT_COORDS: { [key: string]: { center: [number, number]; zoom: number } } = {
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

// Fix for default marker icon
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to fix map size on mount
function MapResizer() {
  const map = useMap();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  
  return null;
}

// Component to handle map clicks
function LocationMarker({ 
  position, 
  setPosition 
}: { 
  position: LatLng | null; 
  setPosition: (pos: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker 
      position={position}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          setPosition(e.target.getLatLng());
        },
      }}
    />
  );
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
  selectedDistrict,
  initialLat,
  initialLng,
}: LocationPickerModalProps) {
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(
    initialLat && initialLng ? new LatLng(initialLat, initialLng) : null
  );

  const districtCoords = selectedDistrict && DISTRICT_COORDS[selectedDistrict]
    ? DISTRICT_COORDS[selectedDistrict]
    : { center: [7.8731, 80.7718] as [number, number], zoom: 8 };

  const handleConfirm = () => {
    if (selectedPosition) {
      onSelectLocation(selectedPosition.lat, selectedPosition.lng);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Select Location on Map</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border-b">
          <p className="text-sm text-gray-700">
            {selectedDistrict && (
              <span className="font-semibold text-blue-700">District: {selectedDistrict} • </span>
            )}
            Click anywhere on the map to place a marker. You can drag the marker to adjust the location.
          </p>
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[500px] h-[500px] relative">
          <MapContainer
            center={districtCoords.center}
            zoom={districtCoords.zoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            key={selectedDistrict}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapResizer />
            <LocationMarker 
              position={selectedPosition} 
              setPosition={setSelectedPosition}
            />
          </MapContainer>
        </div>

        {/* Selected Coordinates Display */}
        {selectedPosition && (
          <div className="p-3 bg-gray-50 border-t">
            <p className="text-sm text-gray-600">
              Selected Coordinates: <span className="font-mono font-medium text-gray-900">
                {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
              </span>
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedPosition}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}
