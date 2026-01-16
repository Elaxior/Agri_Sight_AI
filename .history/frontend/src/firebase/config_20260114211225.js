/**
 * Firebase Configuration
 * Real-time Database connection for React frontend
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onChildAdded, onValue } from 'firebase/database';

// Firebase configuration
// Replace with YOUR config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyC...", // Replace with your actual key
  authDomain: "agri-drone-analytics.firebaseapp.com",
  databaseURL: "https://agri-drone-analytics-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "agri-drone-analytics",
  storageBucket: "agri-drone-analytics.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Export for use in components
export { database, ref, onChildAdded, onValue };
