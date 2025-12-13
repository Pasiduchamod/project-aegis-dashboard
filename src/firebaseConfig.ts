import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration from your mobile app
const firebaseConfig = {
  apiKey: "AIzaSyA1jOTH_a-NNdZqR93aOkD7VfQ35lhsnsQ",
  authDomain: "project-aegis-ce5a8.firebaseapp.com",
  projectId: "project-aegis-ce5a8",
  storageBucket: "project-aegis-ce5a8.firebasestorage.app",
  messagingSenderId: "920882154678",
  appId: "1:920882154678:web:eda4aa0a0997471762ea17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
