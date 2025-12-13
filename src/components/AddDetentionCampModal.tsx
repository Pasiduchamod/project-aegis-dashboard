import { X, MapPin, Users, Building2, Phone, User, FileText } from 'lucide-react';
import { useState } from 'react';
import { createDetentionCamp } from '../services/firebaseService.js';

interface AddDetentionCampModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const FACILITY_OPTIONS = [
  'Medical Clinic',
  'Food Distribution',
  'Water Supply',
  'Sanitation',
  'Shelter',
  'Security',
  'Communication Center',
  'Children\'s Area',
  'Education Center',
  'Registration Office',
];

export default function AddDetentionCampModal({ onClose, onSuccess }: AddDetentionCampModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    capacity: '',
    facilities: [] as string[],
    contact_person: '',
    contact_phone: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Camp name is required');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      setError('Latitude and longitude are required');
      return;
    }
    if (!formData.capacity || parseInt(formData.capacity) <= 0) {
      setError('Valid capacity is required');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Invalid coordinates');
      return;
    }

    setIsSubmitting(true);
    try {
      const campId = `camp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      await createDetentionCamp({
        id: campId,
        name: formData.name.trim(),
        latitude: lat,
        longitude: lng,
        capacity: parseInt(formData.capacity),
        current_occupancy: 0,
        facilities: JSON.stringify(formData.facilities),
        campStatus: 'operational',
        contact_person: formData.contact_person.trim() || undefined,
        contact_phone: formData.contact_phone.trim() || undefined,
        description: formData.description.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating camp:', err);
      setError('Failed to create camp. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Add Detention Camp
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Camp Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2">
              Camp Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="e.g., Central Relief Camp"
              required
            />
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Latitude <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="7.8731"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Longitude <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="80.7718"
                required
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Capacity (people) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="500"
              required
            />
          </div>

          {/* Facilities */}
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-3">
              Available Facilities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FACILITY_OPTIONS.map((facility) => (
                <label
                  key={facility}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-750 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.facilities.includes(facility)}
                    onChange={() => handleFacilityToggle(facility)}
                    className="w-4 h-4 text-purple-500 bg-slate-900 border-slate-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-white">{facility}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2 flex items-center gap-1">
                <User className="w-4 h-4" />
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="+94 77 123 4567"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Additional information about the camp..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Building2 className="w-5 h-5" />
                  Create Camp
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
