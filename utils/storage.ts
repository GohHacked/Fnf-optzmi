import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, getDoc, Firestore } from "firebase/firestore";
import { FirebaseConfig } from "../types";

// KEYS
const STORAGE_KEYS = {
  ADMIN_AUTH: 'fnf_admin_auth',
  MAINTENANCE: 'fnf_maintenance', // Local fallback
  FIREBASE_CONFIG: 'fnf_firebase_config'
};

// Internal state
let dbInstance: Firestore | null = null;
let unsubscribe: (() => void) | null = null;
let cachedMaintenance = false;

// Helper to initialize Firebase if config exists
const initFirebase = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
    if (stored) {
      const config = JSON.parse(stored);
      // Avoid duplicate initialization
      const app = !getApps().length ? initializeApp(config) : getApp();
      dbInstance = getFirestore(app);
      console.log("Firebase initialized successfully");
      return true;
    }
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
    const success = initFirebase();
    if(success) window.location.reload(); // Reload to start fresh connection
  },

  disconnect: () => {
    localStorage.removeItem(STORAGE_KEYS.FIREBASE_CONFIG);
    if(unsubscribe) unsubscribe();
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
        alert("Database write failed. Check your permissions.");
      }
    } else {
      // LOCAL MODE
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE, isActive.toString());
      // Trigger event for local tab sync
      window.dispatchEvent(new Event('storage'));
      // Manually trigger subscription callback if needed via App.tsx logic
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
          setDoc(docRef, { maintenance: false });
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
      // We return a cleanup function that removes the listener
      return () => window.removeEventListener('storage', handler);
    }
  },
  
  // Clean up
  cleanup: () => {
      if(unsubscribe) unsubscribe();
  }
};