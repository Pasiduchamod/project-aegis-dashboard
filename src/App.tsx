import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import type { Incident, AidRequest } from './types.js';
import { subscribeToIncidents, subscribeToAidRequests } from './services/firebaseService.js';

function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [aidRequests, setAidRequests] = useState<AidRequest[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to real-time Firebase updates
    let unsubscribeIncidents: (() => void) | null = null;
    let unsubscribeAidRequests: (() => void) | null = null;

    try {
      // Subscribe to incidents
      unsubscribeIncidents = subscribeToIncidents((fetchedIncidents) => {
        setIncidents(fetchedIncidents);
        setError(null);
      });

      // Subscribe to aid requests
      unsubscribeAidRequests = subscribeToAidRequests((fetchedAidRequests) => {
        setAidRequests(fetchedAidRequests);
        setIsLoading(false);
        setError(null);
      });
    } catch (err) {
      console.error('Failed to connect to Firebase:', err);
      setError('Failed to connect to database. Please check your Firebase configuration.');
      setIsLoading(false);
    }

    // Cleanup subscriptions on unmount
    return () => {
      if (unsubscribeIncidents) {
        unsubscribeIncidents();
      }
      if (unsubscribeAidRequests) {
        unsubscribeAidRequests();
      }
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Connection Error</h2>
          <p className="text-slate-400 mb-4">{error}</p>
          <p className="text-sm text-slate-500">
            Please update your Firebase configuration in <code className="bg-slate-800 px-2 py-1 rounded">src/firebaseConfig.ts</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Dashboard incidents={incidents} aidRequests={aidRequests} isLive={isLive} />
    </div>
  );
}

export default App;
