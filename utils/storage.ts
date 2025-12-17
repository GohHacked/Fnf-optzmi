import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, getDoc, Firestore } from "firebase/firestore";
import { FirebaseConfig } from "../types";

// KEYS
const STORAGE_KEYS = {
  ADMIN_AUTH: 'fnf_admin_auth',
  MAINTENANCE: 'fnf_maintenance', // Local fallback
  FIREBASE_CONFIG: 'fnf_firebase_config'
};

// HARDCODED CONFIG (Verified)
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
    let config = DEFAULT_CONFIG;
    const stored = localStorage.getItem(STORAGE_KEYS.FIREBASE_CONFIG);
    
    if (stored) {
      config = JSON.parse(stored);
    }

    if (!getApps().length) {
      const app = initializeApp(config);
      dbInstance = getFirestore(app);
      console.log("Firebase initialized successfully");
    } else {
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
  isAdmin: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  },

  login: () => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  },

  isConnected: (): boolean => {
    return !!dbInstance;
  },

  connect: (config: FirebaseConfig) => {
    localStorage.setItem(STORAGE_KEYS.FIREBASE_CONFIG, JSON.stringify(config));
    window.location.reload(); 
  },

  disconnect: () => {
    localStorage.removeItem(STORAGE_KEYS.FIREBASE_CONFIG);
    window.location.reload();
  },

  // Maintenance Logic with Fallback
  setMaintenanceStatus: async (isActive: boolean) => {
    // ALWAYS save locally first as backup
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, isActive.toString());
    
    if (dbInstance) {
      try {
        await setDoc(doc(dbInstance, "settings", "global"), {
          maintenance: isActive,
          updatedAt: new Date().toISOString()
        });
      } catch (e: any) {
        console.error("Firebase write error:", e);
        
        // Handle Permission Error specifically
        if (e.code === 'permission-denied' || e.message.includes('permission')) {
             alert(
                 "⚠️ ОШИБКА ДОСТУПА К БАЗЕ!\n\n" +
                 "Сайт не может сохранить настройки в облако.\n" +
                 "1. Зайдите в Firebase Console -> Firestore Database\n" +
                 "2. Откройте вкладку 'Правила' (Rules)\n" +
                 "3. Замените код на:\n" +
                 "   allow read, write: if true;\n" +
                 "4. Нажмите Опубликовать.\n\n" +
                 "Режим переключен ТОЛЬКО ЛОКАЛЬНО."
             );
        } else {
             // For other errors, just log to console and don't block user
             console.warn("Sync failed, using local mode.");
        }
        
        // Trigger local event so other tabs might see it if lucky, but mostly to ensure fallback works
        window.dispatchEvent(new Event('storage'));
      }
    } else {
      // Local Only Mode
      window.dispatchEvent(new Event('storage'));
    }
  },

  // Real-time listener
  subscribeToMaintenance: (callback: (isActive: boolean) => void) => {
    if (dbInstance) {
      if(unsubscribe) unsubscribe();
      
      const docRef = doc(dbInstance, "settings", "global");
      
      unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const val = !!data.maintenance;
          cachedMaintenance = val;
          callback(val);
        } else {
          // Document doesn't exist? Try to use local fallback
          callback(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) === 'true');
        }
      }, (error) => {
        console.error("Listen failed (using local fallback):", error);
        callback(localStorage.getItem(STORAGE_KEYS.MAINTENANCE) === 'true');
      });

    } else {
      const handler = () => {
        const val = localStorage.getItem(STORAGE_KEYS.MAINTENANCE) === 'true';
        callback(val);
      };
      handler();
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }
  },
  
  cleanup: () => {
      if(unsubscribe) unsubscribe();
  }
};