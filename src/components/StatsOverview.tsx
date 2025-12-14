import { AlertTriangle, CheckCircle2, Clock, HandHeart, MapPin, Shield, TrendingUp, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { AidRequest, DetentionCamp, Incident } from '../types';

interface StatsOverviewProps {
  incidents: Incident[];
  aidRequests: AidRequest[];
  detentionCamps: DetentionCamp[];
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
  subtitle?: string;
}

const StatCard = ({ title, value, icon, trend, color, subtitle }: StatCardProps) => (
  <div className={`bg-slate-900 border ${color} rounded-lg p-6 hover:shadow-lg transition-shadow`}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
        <p className="text-3xl font-bold text-white mb-1">{value}</p>
        {subtitle && <p className="text-slate-500 text-xs">{subtitle}</p>}
        {trend && (
          <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>
      <div className={`${color.replace('border-', 'bg-').replace('500', '500/20')} p-3 rounded-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

export default function StatsOverview({ incidents, aidRequests, detentionCamps }: StatsOverviewProps) {
  // Get current date boundaries
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();
  
  const weekAgo = now - (7 * 24 * 60 * 60 * 1000);

  // Incident Statistics
  const totalIncidents = incidents.length;
  const todayIncidents = incidents.filter(i => i.timestamp >= todayStart).length;
  const criticalIncidents = incidents.filter(i => i.severity >= 4).length;
  const trappedCiviliansIncidentsArray = incidents.filter(i => i.type === 'Trapped Civilians');
  const trappedCiviliansIncidents = trappedCiviliansIncidentsArray.length;
  const roadBlockIncidents = incidents.filter(i => i.type === 'Road Block').length;
  
  // Incident by status
  const pendingIncidents = incidents.filter(i => !i.actionStatus || i.actionStatus === 'pending').length;
  const inActionIncidents = incidents.filter(i => i.actionStatus === 'taking action').length;
  const completedIncidents = incidents.filter(i => i.actionStatus === 'completed').length;

  // Incident by severity
  const lowSeverity = incidents.filter(i => i.severity === 1).length;
  const minorSeverity = incidents.filter(i => i.severity === 2).length;
  const mediumSeverity = incidents.filter(i => i.severity === 3).length;
  const highSeverity = incidents.filter(i => i.severity === 4).length;
  const criticalSeverity = incidents.filter(i => i.severity === 5).length;

  // Incident by type
  const incidentTypes = incidents.reduce((acc, incident) => {
    acc[incident.type] = (acc[incident.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Aid Request Statistics
  const totalAidRequests = aidRequests.length;
  const todayAidRequests = aidRequests.filter(ar => ar.created_at >= todayStart).length;
  
  // Aid by status
  const pendingAid = aidRequests.filter(ar => !ar.aidStatus || ar.aidStatus === 'pending').length;
  const inActionAid = aidRequests.filter(ar => ar.aidStatus === 'taking action').length;
  const completedAid = aidRequests.filter(ar => ar.aidStatus === 'completed').length;

  // Aid by priority
  const lowPriority = aidRequests.filter(ar => ar.priority_level === 1).length;
  const mediumPriority = aidRequests.filter(ar => ar.priority_level === 3).length;
  const highPriority = aidRequests.filter(ar => ar.priority_level === 4).length;
  const criticalPriority = aidRequests.filter(ar => ar.priority_level === 5).length;
  
  // Parse trapped civilians count
  let totalTrappedPeople = 0;
  trappedCiviliansIncidentsArray.forEach(incident => {
    if (incident.description) {
      const match = incident.description.match(/People trapped: (\d+)/);
      if (match) {
        totalTrappedPeople += parseInt(match[1], 10);
      }
    }
  });

  // Detention Camp Statistics
  const totalCamps = detentionCamps.length;
  const operationalCamps = detentionCamps.filter(c => c.campStatus === 'operational').length;
  const fullCamps = detentionCamps.filter(c => c.campStatus === 'full').length;
  const totalCapacity = detentionCamps.reduce((sum, c) => sum + c.capacity, 0);
  const currentOccupancy = detentionCamps.reduce((sum, c) => sum + c.current_occupancy, 0);
  const availableSpace = totalCapacity - currentOccupancy;
  const occupancyRate = totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0;

  // Recent activity (last 7 days)
  const recentIncidents = incidents.filter(i => i.timestamp >= weekAgo).length;
  const recentAidRequests = aidRequests.filter(ar => ar.created_at >= weekAgo).length;

  // Prepare chart data
  const severityChartData = [
    { name: 'Low', value: lowSeverity, color: '#10b981' },
    { name: 'Minor', value: minorSeverity, color: '#06b6d4' },
    { name: 'Medium', value: mediumSeverity, color: '#f59e0b' },
    { name: 'High', value: highSeverity, color: '#f97316' },
    { name: 'Critical', value: criticalSeverity, color: '#dc2626' },
  ].filter(item => item.value > 0);

  const statusChartData = [
    { name: 'Pending', incidents: pendingIncidents, aid: pendingAid },
    { name: 'Taking Action', incidents: inActionIncidents, aid: inActionAid },
    { name: 'Completed', incidents: completedIncidents, aid: completedAid },
  ];

  const incidentTypesChartData = Object.entries(incidentTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([type, count], index) => ({ 
      name: type, 
      value: count,
      color: ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899'][index % 6]
    }));

  const priorityChartData = [
    { name: 'Low', value: lowPriority, color: '#10b981' },
    { name: 'Medium', value: mediumPriority, color: '#f59e0b' },
    { name: 'High', value: highPriority, color: '#f97316' },
    { name: 'Critical', value: criticalPriority, color: '#dc2626' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          Overview & Statistics
        </h2>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Incidents"
          value={totalIncidents}
          icon={<AlertTriangle className="w-6 h-6 text-yellow-400" />}
          color="border-yellow-500"
          subtitle={`${todayIncidents} reported today`}
        />
        <StatCard
          title="Critical Incidents"
          value={criticalIncidents}
          icon={<AlertTriangle className="w-6 h-6 text-red-400" />}
          color="border-red-500"
          subtitle={`${trappedCiviliansIncidents} trapped civilians`}
        />
        <StatCard
          title="Aid Requests"
          value={totalAidRequests}
          icon={<HandHeart className="w-6 h-6 text-blue-400" />}
          color="border-blue-500"
          subtitle={`${todayAidRequests} requested today`}
        />
        <StatCard
          title="People in Camps"
          value={currentOccupancy}
          icon={<Users className="w-6 h-6 text-purple-400" />}
          color="border-purple-500"
          subtitle={`${totalCapacity} total capacity`}
        />
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Status Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Incident Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300">Pending</span>
              </div>
              <span className="text-white font-semibold">{pendingIncidents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">Taking Action</span>
              </div>
              <span className="text-white font-semibold">{inActionIncidents}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">Completed</span>
              </div>
              <span className="text-white font-semibold">{completedIncidents}</span>
            </div>
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Completion Rate</span>
                <span className="text-green-400 font-semibold">
                  {totalIncidents > 0 ? Math.round((completedIncidents / totalIncidents) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Incident Severity Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Severity Distribution</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-slate-300">Low</span>
              </div>
              <span className="text-white font-semibold">{lowSeverity}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-300">Minor</span>
              </div>
              <span className="text-white font-semibold">{minorSeverity}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-slate-300">Medium</span>
              </div>
              <span className="text-white font-semibold">{mediumSeverity}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-slate-300">High</span>
              </div>
              <span className="text-white font-semibold">{highSeverity}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-slate-300">Critical</span>
              </div>
              <span className="text-white font-semibold">{criticalSeverity}</span>
            </div>
          </div>
        </div>

        {/* Aid Request Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HandHeart className="w-5 h-5 text-blue-400" />
            Aid Request Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-slate-300">Pending</span>
              </div>
              <span className="text-white font-semibold">{pendingAid}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300">Taking Action</span>
              </div>
              <span className="text-white font-semibold">{inActionAid}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-slate-300">Completed</span>
              </div>
              <span className="text-white font-semibold">{completedAid}</span>
            </div>
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Completion Rate</span>
                <span className="text-green-400 font-semibold">
                  {totalAidRequests > 0 ? Math.round((completedAid / totalAidRequests) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Types */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Incident Types</h3>
          <div className="space-y-2">
            {Object.entries(incidentTypes)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{type}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            {Object.keys(incidentTypes).length === 0 && (
              <p className="text-slate-500 text-sm">No incidents reported</p>
            )}
          </div>
        </div>

        {/* Aid Priority Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Aid Priority</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-slate-300">Low</span>
              </div>
              <span className="text-white font-semibold">{lowPriority}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-slate-300">Medium</span>
              </div>
              <span className="text-white font-semibold">{mediumPriority}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-slate-300">High</span>
              </div>
              <span className="text-white font-semibold">{highPriority}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-slate-300">Critical</span>
              </div>
              <span className="text-white font-semibold">{criticalPriority}</span>
            </div>
          </div>
        </div>

        {/* Detention Camps */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-400" />
            Detention Camps
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total Camps</span>
              <span className="text-white font-semibold">{totalCamps}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Operational</span>
              <span className="text-green-400 font-semibold">{operationalCamps}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Full</span>
              <span className="text-orange-400 font-semibold">{fullCamps}</span>
            </div>
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Capacity</span>
                <span className="text-white font-semibold">{totalCapacity}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Occupancy</span>
                <span className="text-blue-400 font-semibold">{currentOccupancy} ({occupancyRate}%)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Available</span>
                <span className="text-green-400 font-semibold">{availableSpace}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Information Banner */}
      {(trappedCiviliansIncidents > 0 || roadBlockIncidents > 0) && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-3">⚠️ Critical Alerts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trappedCiviliansIncidents > 0 && (
              <div className="bg-red-900/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-red-400" />
                  <span className="text-white font-semibold">Trapped Civilians</span>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{trappedCiviliansIncidents}</p>
                <p className="text-red-300 text-sm">{totalTrappedPeople} people trapped</p>
              </div>
            )}
            {roadBlockIncidents > 0 && (
              <div className="bg-orange-900/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <span className="text-white font-semibold">Road Blocks</span>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{roadBlockIncidents}</p>
                <p className="text-orange-300 text-sm">Active road blockages</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Distribution Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Incident Severity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityChartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => (percent !== undefined && percent > 0) ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {severityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Status Comparison Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Status Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#fff' }} />
              <Bar dataKey="incidents" fill="#ef4444" name="Incidents" radius={[8, 8, 0, 0]} />
              <Bar dataKey="aid" fill="#3b82f6" name="Aid Requests" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Types Bar Chart */}
        {incidentTypesChartData.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Top Incident Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incidentTypesChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={120} style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" name="Count" radius={[0, 8, 8, 0]}>
                  {incidentTypesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Aid Priority Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Aid Request Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityChartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => (percent !== undefined && percent > 0) ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {priorityChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity (Last 7 Days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
            <span className="text-slate-300">Incidents</span>
            <span className="text-white font-semibold">{recentIncidents}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
            <span className="text-slate-300">Aid Requests</span>
            <span className="text-white font-semibold">{recentAidRequests}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded">
            <span className="text-slate-300">Total Reports</span>
            <span className="text-white font-semibold">{recentIncidents + recentAidRequests}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
