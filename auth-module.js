
// Auth Module - Real Supabase Integration
// Handles login, signup, and session management with actual Supabase backend

const SUPABASE_URL = 'https://bmkmwfsnwyhspvzoebid.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wnSj7t3rsjLC5B1wlrXE4w_FtsPvYnG';

window.authModule = {
  supabase: {
    _session: null,
    _user: null,

    async signUp(email, password) {
      try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          return { user: null, error: data.message || 'Signup failed' };
        }

        this._user = data.user;
        this._session = { user: data.user, access_token: data.session?.access_token };
        localStorage.setItem('auth_session', JSON.stringify(this._session));
        return { user: data.user, error: null };
      } catch (err) {
        return { user: null, error: err.message };
      }
    },

    async signIn(email, password) {
      try {
        const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          return { user: null, error: data.error_description || 'Login failed' };
        }

        this._user = data.user;
        this._session = { user: data.user, access_token: data.access_token };
        localStorage.setItem('auth_session', JSON.stringify(this._session));
        return { user: data.user, error: null };
      } catch (err) {
        return { user: null, error: err.message };
      }
    },

    async signOut() {
      try {
        if (this._session?.access_token) {
          await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${this._session.access_token}`
            }
          });
        }
        this._session = null;
        this._user = null;
        localStorage.removeItem('auth_session');
        return { error: null };
      } catch (err) {
        this._session = null;
        this._user = null;
        localStorage.removeItem('auth_session');
        return { error: null };
      }
    },

    getSession() {
      const stored = localStorage.getItem('auth_session');
      if (stored) {
        try {
          this._session = JSON.parse(stored);
          return this._session;
        } catch (e) {
          return null;
        }
      }
      return null;
    },

    getUserId() {
      if (this._user) return this._user.id;
      const session = this.getSession();
      return session?.user?.id || null;
    }
  },

  // Device Memory (24h auto-login)
  setDeviceMemory(token, expirationMs = 86400000) {
    const deviceMemory = {
      token: token,
      expiresAt: Date.now() + expirationMs
    };
    localStorage.setItem('device-memory', JSON.stringify(deviceMemory));
  },

  getDeviceMemory() {
    const stored = localStorage.getItem('device-memory');
    if (!stored) return null;

    try {
      const deviceMemory = JSON.parse(stored);
      if (Date.now() > deviceMemory.expiresAt) {
        localStorage.removeItem('device-memory');
        return null;
      }
      return deviceMemory.token;
    } catch (e) {
      return null;
    }
  },

  clearDeviceMemory() {
    localStorage.removeItem('device-memory');
  },

  // Biometric Setup (placeholder - would use WebAuthn in production)
  async setupFaceID(userId) {
    if (!window.PublicKeyCredential) {
      return { error: 'WebAuthn not available' };
    }
    localStorage.setItem(`biometric_${userId}_faceID`, 'true');
    return { success: true };
  },

  async setupPIN(userId, pin) {
    // In production, hash and store securely on backend
    localStorage.setItem(`biometric_${userId}_pin`, 'set');
    return { success: true };
  },

  async verifyBiometric(userId, method) {
    const key = `biometric_${userId}_${method}`;
    return localStorage.getItem(key) ? true : false;
  }
};

console.log('[Auth Module] Initialized with Supabase');
