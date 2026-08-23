// Storage Shim - Supabase Backend Compatibility
// Replaces localStorage with Supabase backend calls

window.storage = {
  async get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  async delete(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage delete error:', e);
      return false;
    }
  },

  async list() {
    try {
      const keys = Object.keys(localStorage);
      return keys;
    } catch (e) {
      return [];
    }
  }
};

console.log('[Storage Shim] Initialized');
