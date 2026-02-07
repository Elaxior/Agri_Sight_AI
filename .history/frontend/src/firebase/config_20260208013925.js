/**
 * Firebase Configuration
 * Real-time Database connection for React frontend
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onChildAdded, onValue } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCT7GfgXuqPF9MPv5MWTX6T2Erchzz0YQc",
  authDomain: "agri-drone-analytics.firebaseapp.com",
  databaseURL: "https://agri-drone-analytics-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "agri-drone-analytics",
  storageBucket: "agri-drone-analytics.firebasestorage.app",
  messagingSenderId: "986874607497",
  appId: "1:986874607497:web:b3de88f82d3316083b5358",
  measurementId: "G-SGMH4G4C29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Export for use in components
export { database, ref, onChildAdded, onValue };
