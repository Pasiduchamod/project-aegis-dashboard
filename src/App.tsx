import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import type { Incident } from './types.js';
import { mockIncidents } from './mockData';

function App() {
  const [incidents, setIncidents] = useState<Incident[]>(mockIncidents);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Simulate live updates every 5 seconds
    const interval = setInterval(() => {
      if (isLive) {
        // In production, this would fetch from: GET /api/incidents
        // For now, we'll add a new mock incident occasionally
        const shouldAddNew = Math.random() > 0.7;
        
        if (shouldAddNew) {
          const types = ['Flood', 'Landslide', 'Fire', 'Earthquake', 'Storm'];
          const newIncident: Incident = {
            id: Date.now().toString(),
            type: types[Math.floor(Math.random() * types.length)],
            severity: Math.floor(Math.random() * 5) + 1,
            latitude: 6.6828 + (Math.random() - 0.5) * 0.1,
            longitude: 80.3992 + (Math.random() - 0.5) * 0.1,
            timestamp: Date.now(),
            status: 'synced',
          };
          
          setIncidents((prev) => [newIncident, ...prev].slice(0, 20)); // Keep last 20
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="min-h-screen bg-slate-950">
      <Dashboard incidents={incidents} isLive={isLive} />
    </div>
  );
}

export default App;
