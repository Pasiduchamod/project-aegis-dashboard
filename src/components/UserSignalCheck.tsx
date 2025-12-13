import { collection, doc, onSnapshot, Timestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';

interface UserSignalCheckProps {
  userId: string;
  contextType: 'incident' | 'aidRequest';
  contextId: string;
  adminId: string;
}

interface UserPresence {
  userId: string;
  lastSeenAt: number;
  isOnline: boolean;
}

interface PendingCheck {
  id: string;
  status: 'pending' | 'resolved' | 'expired';
  createdAt: number;
  expiresAt: number;
  resolvedAt?: number;
}

const ONLINE_THRESHOLD_MS = 90000; // 90 seconds
const FIREBASE_FUNCTIONS_URL = 'https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net'; // Replace!

export const UserSignalCheck: React.FC<UserSignalCheckProps> = ({
  userId,
  contextType,
  contextId,
  adminId,
}) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastSeenAt, setLastSeenAt] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [pendingCheckId, setPendingCheckId] = useState<string | null>(null);
  const [checkStatus, setCheckStatus] = useState<string>('');
  const [notification, setNotification] = useState<string>('');

  // Real-time listener for user presence
  useEffect(() => {
    const presenceRef = doc(db, 'userPresence', userId);
    
    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const lastSeen = data.lastSeenAt;
        const online = Date.now() - lastSeen <= ONLINE_THRESHOLD_MS;
        
        setLastSeenAt(lastSeen);
        setIsOnline(online);
      } else {
        setIsOnline(false);
        setLastSeenAt(null);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // Real-time listener for pending check resolution
  useEffect(() => {
    if (!pendingCheckId) return;

    const checkRef = doc(db, 'pendingReachabilityChecks', pendingCheckId);
    
    const unsubscribe = onSnapshot(checkRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as PendingCheck;
        
        if (data.status === 'resolved') {
          setNotification('✅ User is now online and reachable!');
          setCheckStatus('User came online');
          setPendingCheckId(null);
          setIsChecking(false);
          
          // Auto-hide notification after 5 seconds
          setTimeout(() => setNotification(''), 5000);
        } else if (data.status === 'expired' || Date.now() > data.expiresAt) {
          setNotification('⏰ Check expired. User did not come online.');
          setCheckStatus('Check expired');
          setPendingCheckId(null);
          setIsChecking(false);
          
          setTimeout(() => setNotification(''), 5000);
        }
      }
    });

    return () => unsubscribe();
  }, [pendingCheckId]);

  const handleCheckSignal = async () => {
    setIsChecking(true);
    setNotification('');
    setCheckStatus('Checking...');

    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_URL}/checkReachability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          adminId,
          contextType,
          contextId,
        }),
      });

      const data = await response.json();

      if (data.status === 'online') {
        setNotification('✅ User is currently online!');
        setCheckStatus('Online now');
        setIsChecking(false);
      } else if (data.status === 'pending') {
        setPendingCheckId(data.checkId);
        setNotification('⏳ Waiting for user to come online... (2 min timeout)');
        setCheckStatus('Waiting for user...');
        // isChecking stays true, will be set to false when resolved/expired
      }
    } catch (error) {
      console.error('Check failed:', error);
      setNotification('❌ Failed to check user signal');
      setCheckStatus('Error');
      setIsChecking(false);
    }
  };

  const getStatusColor = (): string => {
    if (isOnline === null) return 'bg-gray-400';
    return isOnline ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = (): string => {
    if (isOnline === null) return 'Unknown';
    if (isOnline) return 'Online';
    
    if (!lastSeenAt) return 'Offline';
    
    const timeSince = Date.now() - lastSeenAt;
    const minutesAgo = Math.floor(timeSince / 60000);
    const hoursAgo = Math.floor(timeSince / 3600000);
    
    if (minutesAgo < 5) return `Offline (${minutesAgo}m ago)`;
    if (hoursAgo < 1) return `Offline (${minutesAgo}m ago)`;
    if (hoursAgo < 24) return `Offline (${hoursAgo}h ago)`;
    return 'Offline (>24h ago)';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`} />
          <span className="text-sm font-medium text-gray-700">
            {getStatusText()}
          </span>
        </div>
        
        <button
          onClick={handleCheckSignal}
          disabled={isChecking}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isChecking
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isChecking ? '⏳ Checking...' : '📡 Check User Signal'}
        </button>
      </div>

      {checkStatus && (
        <div className="text-xs text-gray-600 mb-2">
          Status: {checkStatus}
        </div>
      )}

      {notification && (
        <div
          className={`mt-3 p-3 rounded-md text-sm ${
            notification.includes('✅')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : notification.includes('⏰') || notification.includes('⏳')
              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {notification}
        </div>
      )}

      {lastSeenAt && !isOnline && (
        <div className="mt-2 text-xs text-gray-500">
          Last seen: {new Date(lastSeenAt).toLocaleString()}
        </div>
      )}
    </div>
  );
};
