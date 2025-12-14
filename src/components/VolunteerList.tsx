import { CheckCircle2, Clock, Mail, Phone, XCircle } from 'lucide-react';
import { useState } from 'react';
import { updateVolunteerApproval } from '../services/firebaseService';

export interface Volunteer {
  id: string;
  user_email: string;
  full_name: string;
  phone_number: string;
  district: string; // JSON string array
  skills: string; // JSON string array
  availability: string;
  preferred_tasks: string; // JSON string array
  emergency_contact?: string;
  emergency_phone?: string;
  approved: boolean;
  created_at: number;
  updated_at: number;
}

interface VolunteerListProps {
  volunteers: Volunteer[];
  onVolunteerUpdate?: () => void;
}

export default function VolunteerList({ volunteers, onVolunteerUpdate }: VolunteerListProps) {
  const [expandedVolunteerId, setExpandedVolunteerId] = useState<string | null>(null);
  const [loadingApprovals, setLoadingApprovals] = useState<Set<string>>(new Set());

  const handleApprovalToggle = async (volunteerId: string, currentApproval: boolean) => {
    setLoadingApprovals(prev => new Set(prev).add(volunteerId));
    
    try {
      await updateVolunteerApproval(volunteerId, !currentApproval);
      
      // Notify parent to refresh data
      if (onVolunteerUpdate) {
        onVolunteerUpdate();
      }
    } catch (error) {
      console.error('Error updating volunteer approval:', error);
      alert('Failed to update volunteer approval. Please try again.');
    } finally {
      setLoadingApprovals(prev => {
        const newSet = new Set(prev);
        newSet.delete(volunteerId);
        return newSet;
      });
    }
  };

  const parseJSONArray = (jsonString: string): string[] => {
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Sort volunteers: pending first, then approved, then by date
  const sortedVolunteers = [...volunteers].sort((a, b) => {
    if (a.approved !== b.approved) {
      return a.approved ? 1 : -1; // pending first
    }
    return b.created_at - a.created_at; // newest first
  });

  const pendingCount = volunteers.filter(v => !v.approved).length;
  const approvedCount = volunteers.filter(v => v.approved).length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{volunteers.length}</div>
              <div className="text-sm text-slate-400">Total Volunteers</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{pendingCount}</div>
              <div className="text-sm text-slate-400">Pending Approval</div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{approvedCount}</div>
              <div className="text-sm text-slate-400">Approved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Volunteers List */}
      {sortedVolunteers.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-lg border border-slate-700">
          <div className="text-slate-400 text-lg">No volunteers registered yet</div>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedVolunteers.map((volunteer) => {
            const skills = parseJSONArray(volunteer.skills);
            const tasks = parseJSONArray(volunteer.preferred_tasks);
            const isExpanded = expandedVolunteerId === volunteer.id;
            const isLoading = loadingApprovals.has(volunteer.id);

            return (
              <div
                key={volunteer.id}
                className={`bg-slate-800/50 rounded-lg border transition-all ${
                  volunteer.approved
                    ? 'border-green-600/30 bg-green-900/10'
                    : 'border-amber-600/30 bg-amber-900/10'
                }`}
              >
                {/* Main Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-white truncate">
                          {volunteer.full_name}
                        </h3>
                        {volunteer.approved ? (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-slate-300 mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {volunteer.user_email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          {volunteer.phone_number}
                        </div>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Preferred Districts:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {parseJSONArray(volunteer.district || '[]').length > 0 ? (
                              parseJSONArray(volunteer.district || '[]').map((dist, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30"
                                >
                                   {dist}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-500 italic">No districts specified</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 mr-2">Availability:</span>
                          <span className="text-sm text-white font-medium">{volunteer.availability}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs text-slate-400">Skills:</span>
                        {skills.slice(0, isExpanded ? skills.length : 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {!isExpanded && skills.length > 3 && (
                          <span className="text-xs text-slate-400">+{skills.length - 3} more</span>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-3 space-y-3 pt-3 border-t border-slate-700">
                          <div>
                            <div className="text-xs text-slate-400 mb-2">Preferred Tasks:</div>
                            <div className="flex flex-wrap gap-2">
                              {tasks.map((task, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs"
                                >
                                  {task}
                                </span>
                              ))}
                            </div>
                          </div>

                          {(volunteer.emergency_contact || volunteer.emergency_phone) && (
                            <div>
                              <div className="text-xs text-slate-400 mb-1">Emergency Contact:</div>
                              <div className="text-sm text-slate-300">
                                {volunteer.emergency_contact && <div>Name: {volunteer.emergency_contact}</div>}
                                {volunteer.emergency_phone && <div>Phone: {volunteer.emergency_phone}</div>}
                              </div>
                            </div>
                          )}

                          <div className="text-xs text-slate-500">
                            Registered: {formatDate(volunteer.created_at)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col gap-2">
                      {volunteer.approved ? (
                        <button
                          onClick={() => handleApprovalToggle(volunteer.id, volunteer.approved)}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          {isLoading ? 'Revoking...' : 'Revoke'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprovalToggle(volunteer.id, volunteer.approved)}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 font-semibold transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {isLoading ? 'Approving...' : 'Approve'}
                        </button>
                      )}

                      <button
                        onClick={() => setExpandedVolunteerId(isExpanded ? null : volunteer.id)}
                        className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 font-semibold transition-colors text-sm"
                      >
                        {isExpanded ? 'Show Less' : 'Show More'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
