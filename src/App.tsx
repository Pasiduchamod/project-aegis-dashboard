import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { initEmailService } from './services/emailService.js';
import { subscribeToAidRequests, subscribeToDetentionCamps, subscribeToIncidents, subscribeToVolunteers } from './services/firebaseService.js';
import type { AidRequest, DetentionCamp, Incident } from './types.js';

interface Volunteer {
  id: string;
  user_email: string;
  full_name: string;
  phone_number: string;
  district: string; // JSON string array
  skills: string;
  availability: string;
  preferred_tasks: string;
  emergency_contact?: string;
  emergency_phone?: string;
  approved: boolean;
  created_at: number;
  updated_at: number;
}

// Simple admin credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [aidRequests, setAidRequests] = useState<AidRequest[]>([]);
  const [detentionCamps, setDetentionCamps] = useState<DetentionCamp[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('lankasafe_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    
    // Initialize email service
    initEmailService();
  }, []);

  const handleLogin = (username: string, password: string) => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setLoginError(null);
      // Save session
      localStorage.setItem('lankasafe_admin_auth', 'true');
    } else {
      setLoginError('Invalid username or password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('lankasafe_admin_auth');
  };

  useEffect(() => {
    // Only subscribe if authenticated
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    // Subscribe to real-time Firebase updates
    let unsubscribeIncidents: (() => void) | null = null;
    let unsubscribeAidRequests: (() => void) | null = null;
    let unsubscribeDetentionCamps: (() => void) | null = null;
    let unsubscribeVolunteers: (() => void) | null = null;

    try {
      // Subscribe to incidents
      unsubscribeIncidents = subscribeToIncidents((fetchedIncidents) => {
        setIncidents(fetchedIncidents);
        setError(null);
      });

      // Subscribe to aid requests
      unsubscribeAidRequests = subscribeToAidRequests((fetchedAidRequests) => {
        setAidRequests(fetchedAidRequests);
        setError(null);
      });

      // Subscribe to detention camps
      unsubscribeDetentionCamps = subscribeToDetentionCamps((fetchedCamps) => {
        setDetentionCamps(fetchedCamps);
        setError(null);
      });

      // Subscribe to volunteers
      unsubscribeVolunteers = subscribeToVolunteers((fetchedVolunteers) => {
        setVolunteers(fetchedVolunteers);
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
      if (unsubscribeDetentionCamps) {
        unsubscribeDetentionCamps();
      }
      if (unsubscribeVolunteers) {
        unsubscribeVolunteers();
      }
    };
  }, [isAuthenticated]);

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

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
      <Dashboard 
        incidents={incidents} 
        aidRequests={aidRequests} 
        detentionCamps={detentionCamps} 
        volunteers={volunteers}
        isLive={isLive}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
