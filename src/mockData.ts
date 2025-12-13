import type { Incident } from './types.js';

// Mock incidents data for initial development
export const mockIncidents: Incident[] = [
  {
    id: '1',
    type: 'Flood',
    severity: 5,
    latitude: 6.6828,
    longitude: 80.3992,
    timestamp: Date.now() - 120000, // 2 minutes ago
    status: 'synced',
  },
  {
    id: '2',
    type: 'Landslide',
    severity: 4,
    latitude: 6.7065,
    longitude: 80.4129,
    timestamp: Date.now() - 300000, // 5 minutes ago
    status: 'synced',
  },
  {
    id: '3',
    type: 'Fire',
    severity: 3,
    latitude: 6.6591,
    longitude: 80.3753,
    timestamp: Date.now() - 600000, // 10 minutes ago
    status: 'synced',
  },
  {
    id: '4',
    type: 'Earthquake',
    severity: 5,
    latitude: 6.7200,
    longitude: 80.4300,
    timestamp: Date.now() - 900000, // 15 minutes ago
    status: 'synced',
  },
  {
    id: '5',
    type: 'Flood',
    severity: 2,
    latitude: 6.6400,
    longitude: 80.3600,
    timestamp: Date.now() - 1800000, // 30 minutes ago
    status: 'synced',
  },
  {
    id: '6',
    type: 'Storm',
    severity: 4,
    latitude: 6.7500,
    longitude: 80.4500,
    timestamp: Date.now() - 2700000, // 45 minutes ago
    status: 'synced',
  },
];
