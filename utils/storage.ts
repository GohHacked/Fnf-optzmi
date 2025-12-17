// This service acts as a "Database" abstraction.
// Currently it uses localStorage (Browser Memory).
// To make it work across devices (Real Database), you would replace the logic inside these functions 
// with API calls to Firebase, Supabase, or a custom backend.

const STORAGE_KEYS = {
  ADMIN_AUTH: 'fnf_admin_auth',
  MAINTENANCE: 'fnf_maintenance',
  THEME: 'fnf_theme'
};

export const db = {
  // Check if user is admin
  isAdmin: (): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch (e) {
      return false;
    }
  },

  // Login (Save admin session)
  login: () => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
  },

  // Logout
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
  },

  // Check Maintenance Status
  getMaintenanceStatus: (): boolean => {
    try {
      return localStorage.getItem(STORAGE_KEYS.MAINTENANCE) === 'true';
    } catch (e) {
      return false;
    }
  },

  // Update Maintenance Status
  setMaintenanceStatus: (isActive: boolean) => {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, isActive.toString());
    // Dispatch event for other tabs in the same browser
    window.dispatchEvent(new Event('storage')); 
  }
};