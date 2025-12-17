import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, getDoc, Firestore } from "firebase/firestore";
import { FirebaseConfig } from "../types";

// KEYS
const STORAGE_KEYS = {
  ADMIN_AUTH: 'fnf_admin_auth',
  MAINTENANCE: 'fnf_maintenance', // Local fallback
  FIREBASE_CONFIG: 'fnf_firebase_config'
};

// HARDCODED CONFIG (From Screenshot)
const DEFAULT_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyDhy_TlFjXQv70Kw8kC-r9bjDq7GyapTeI",
  authDomain: "fnfopt-26cec.firebaseapp.com",
  projectId: "fnfopt-26cec",
  storageBucket: "fnfopt-26cec.firebasestorage.app",
  messagingSenderId: "2375023806",
  appId: "1:2375023806:web:d5aece2caeba25cd7af2ef"
};

// Internal state
let dbInstance: Firestore | null = null;
let unsubscribe: (() => void) | null = null;
let cachedMaintenance = false;

// Helper to initialize Firebase
const initFirebase = () => {
  try {
    // 1. Try Custom Config from LocalStorage
    let config = DEFAULT_CONFIG;
    const stored = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
    
    if (stored) {
      config = JSON.parse(stored);
    }

    // Initialize
    if (!getApps().length) {
      const app = initializeApp(config);
      dbInstance = getFirestore(app);
      console.log("Firebase initialized successfully");
    } else {
      // App already exists (HMR or prev init)
      const app = getApp();
      dbInstance = getFirestore(app);
    }
    return true;

  } catch (e) {
    console.error("Failed to init firebase:", e);
    dbInstance = null;
  }
  return false;
};

// Initialize on load
initFirebase();

export const db = {
  // Check auth (Session is always local for this app structure)
  isAdmin: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  },

  login: () => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  },

  // Connection management
  isConnected: (): boolean => {
    return !!dbInstance;
  },

  connect: (config: FirebaseConfig) => {
    localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(config));
    // We don't need to reload strictly if we handle re-init, but reload is safer for full clean state
    window.location.reload(); 
  },

  disconnect: () => {
    // If we want to truly disconnect when a default config exists, we'd need a flag.
    // For now, removing custom config reverts to Default (Connected). 
    // To allow "Offline Mode", we can mess with the config, but let's assume disconnect = reset to default.
    localStorage.removeItem(STORAGE_KEYS.FIREBASE_CONFIG);
    window.location.reload();
  },

  // Maintenance Logic
  setMaintenanceStatus: async (isActive: boolean) => {
    if (dbInstance) {
      // REMOTE MODE
      try {
        await setDoc(doc(dbInstance, "settings", "global"), {
          maintenance: isActive,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.error("Firebase write error:", e);
        // Fallback or Alert
        // If write fails (e.g. rules), we might want to update local state too so the admin sees the change immediately
        // but real sync failed.
        alert("Sync Error: Check internet or permissions.");
      }
    } else {
      // LOCAL MODE
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE, isActive.toString());
      window.dispatchEvent(new Event('storage'));
    }
  },

  // Real-time listener
  subscribeToMaintenance: (callback: (isActive: boolean) => void) => {
    if (dbInstance) {
      // REMOTE LISTENER
      if(unsubscribe) unsubscribe();
      
      const docRef = doc(dbInstance, "settings", "global");
      
      unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const val = !!data.maintenance;
          cachedMaintenance = val;
          callback(val);
        } else {
          // If doc doesn't exist yet, create it default false
          // Use setDoc cautiously in listener, but okay for init
          // setDoc(docRef, { maintenance: false }); 
          callback(false);
        }
      }, (error) => {
        console.error("Listen failed:", error);
        // Fallback to local if connection drops
        callback(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) === 'true');
      });

    } else {
      // LOCAL LISTENER (Storage Event)
      const handler = () => {
        const val = localStorage.getItem(STORAGE_KEYS.MAINTENANCE) === 'true';
        callback(val);
      };
      
      // Initial value
      handler();

      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }
  },
  
  // Clean up
  cleanup: () => {
      if(unsubscribe) unsubscribe();
  }
};