import { X, MapPin, Calendar, Building2, Users, FileText, ExternalLink, Phone, User } from 'lucide-react';
import type { DetentionCamp, CampStatus } from '../types.js';
import { updateDetentionCampStatus, updateDetentionCampOccupancy } from '../services/firebaseService.js';
import { useState } from 'react';

interface DetentionCampDetailModalProps {
  camp: DetentionCamp | null;
  onClose: () => void;
}

export default function DetentionCampDetailModal({ camp, onClose }: DetentionCampDetailModalProps) {
  const [editingOccupancy, setEditingOccupancy] = useState(false);
  const [occupancyValue, setOccupancyValue] = useState('');

  if (!camp) return null;

  // Parse facilities
  let facilities: string[] = [];
  try {
    facilities = JSON.parse(camp.facilities);
  } catch {
    facilities = [];
  }

  const formatFullDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCampStatusColor = (status: CampStatus): string => {
    const colors = {
      'operational': 'bg-green-500/20 text-green-400 border-green-500/50',
      'full': 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      'closed': 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return colors[status];
  };

  const getOccupancyPercentage = () => {
    return Math.round((camp.current_occupancy / camp.capacity) * 100);
  };

  const getOccupancyColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as CampStatus;
    try {
      await updateDetentionCampStatus(camp.id, newStatus);
    } catch (error) {
      console.error('Failed to update camp status:', error);
    }
  };

  const handleOccupancyUpdate = async () => {
    const newOccupancy = parseInt(occupancyValue);
    if (isNaN(newOccupancy) || newOccupancy < 0 || newOccupancy > camp.capacity) {
      alert(`Occupancy must be between 0 and ${camp.capacity}`);
      return;
    }
    try {
      await updateDetentionCampOccupancy(camp.id, newOccupancy);
      setEditingOccupancy(false);
      setOccupancyValue('');
    } catch (error) {
      console.error('Failed to update occupancy:', error);
    }
  };

  const occupancyPercentage = getOccupancyPercentage();
  const googleMapsUrl = `https://www.google.com/maps?q=${camp.latitude},${camp.longitude}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{camp.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Camp Status</h3>
              <select
                value={camp.campStatus}
                onChange={handleStatusChange}
                className={`px-3 py-2 rounded border bg-slate-900 cursor-pointer text-sm font-medium ${getCampStatusColor(camp.campStatus)}`}
              >
                <option value="operational">Operational</option>
                <option value="full">Full</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Capacity</h3>
              <div className="px-3 py-2 rounded border border-slate-700 bg-slate-800/50 text-sm font-medium text-white">
                {camp.capacity} people
              </div>
            </div>
          </div>

          {/* Occupancy */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Current Occupancy
            </h3>
            <div className="bg-slate-800/50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{camp.current_occupancy}</span>
                  <span className="text-slate-400">/ {camp.capacity}</span>
                </div>
                {!editingOccupancy ? (
                  <button
                    onClick={() => {
                      setEditingOccupancy(true);
                      setOccupancyValue(camp.current_occupancy.toString());
                    }}
                    className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded hover:bg-blue-500/30 transition-colors"
                  >
                    Update
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={occupancyValue}
                      onChange={(e) => setOccupancyValue(e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-sm"
                      min="0"
                      max={camp.capacity}
                    />
                    <button
                      onClick={handleOccupancyUpdate}
                      className="text-xs px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/50 rounded hover:bg-green-500/30"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingOccupancy(false);
                        setOccupancyValue('');
                      }}
                      className="text-xs px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded hover:bg-red-500/30"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Occupancy Rate</span>
                  <span>{occupancyPercentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${getOccupancyColor(occupancyPercentage)} transition-all`}
                    style={{ width: `${occupancyPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Facilities */}
          {facilities.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Available Facilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {facilities.map((facility, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded-lg text-sm font-medium"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(camp.contact_person || camp.contact_phone) && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">Contact Information</h3>
              <div className="bg-slate-800/50 p-4 rounded-lg space-y-2 text-sm">
                {camp.contact_person && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{camp.contact_person}</span>
                  </div>
                )}
                {camp.contact_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <a href={`tel:${camp.contact_phone}`} className="text-blue-400 hover:text-blue-300">
                      {camp.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {camp.description && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description
              </h3>
              <p className="text-white bg-slate-800/50 p-4 rounded-lg text-sm">
                {camp.description}
              </p>
            </div>
          )}

          {/* Location */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </h3>
            <div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-mono text-sm">
                  {camp.latitude.toFixed(6)}, {camp.longitude.toFixed(6)}
                </span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                >
                  Open in Maps
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Timeline
            </h3>
            <div className="bg-slate-800/50 p-4 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Created:</span>
                <span className="text-white">{formatFullDate(camp.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Updated:</span>
                <span className="text-white">{formatFullDate(camp.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Camp ID */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">Camp ID</h3>
            <code className="block bg-slate-800/50 p-3 rounded-lg text-xs text-slate-300 font-mono break-all">
              {camp.id}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
