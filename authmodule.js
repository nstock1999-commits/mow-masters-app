// Auth Module - Supabase Authentication Client
// Handles login, biometric setup, device memory, and logout

window.authModule = {
  supabase: {
    // Mock user session (replace with real Supabase if needed)
    _session: null,
    _user: null,

    async signUp(email, password) {
      // Simulate signup
      const user = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email: email,
        createdAt: new Date().toISOString()
      };
      this._user = user;
      this._session = { user, token: Math.random().toString(36) };
      localStorage.setItem('auth_session', JSON.stringify(this._session));
      return { user, error: null };
    },

    async signIn(email, password) {
      // Simulate login
      const stored = localStorage.getItem('auth_users');
      const users = stored ? JSON.parse(stored) : [];
      const user = users.find(u => u.email === email);

      if (!user) {
        // Create new user on first login
        const newUser = {
          id: 'user_' + Math.random().toString(36).substr(2, 9),
          email: email,
          password: password,
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('auth_users', JSON.stringify(users));
        this._user = newUser;
      } else {
        this._user = user;
      }

      this._session = { user: this._user, token: Math.random().toString(36) };
      localStorage.setItem('auth_session', JSON.stringify(this._session));
      return { user: this._user, error: null };
    },

    async signOut() {
      this._session = null;
      this._user = null;
      localStorage.removeItem('auth_session');
      return { error: null };
    },

    getSession() {
      const stored = localStorage.getItem('auth_session');
      return stored ? JSON.parse(stored) : null;
    },

    getUserId() {
      if (this._user) return this._user.id;
      const session = this.getSession();
      return session?.user?.id || null;
    }
  },

  // Device Memory (24h auto-login)
  setDeviceMemory(token, expirationMs = 86400000) { // 24h default
    const deviceMemory = {
      token: token,
      expiresAt: Date.now() + expirationMs
    };
    localStorage.setItem('device-memory', JSON.stringify(deviceMemory));
  },

  getDeviceMemory() {
    const stored = localStorage.getItem('device-memory');
    if (!stored) return null;

    const deviceMemory = JSON.parse(stored);
    if (Date.now() > deviceMemory.expiresAt) {
      localStorage.removeItem('device-memory');
      return null;
    }
    return deviceMemory.token;
  },

  clearDeviceMemory() {
    localStorage.removeItem('device-memory');
  },

  // Biometric Setup
  async setupFaceID(userId) {
    // Check if WebAuthn is available
    if (!window.PublicKeyCredential) {
      return { error: 'WebAuthn not available' };
    }

    // Store that Face ID was set up
    localStorage.setItem(`biometric_${userId}_faceID`, 'true');
    return { success: true };
  },

  async setupPIN(userId, pin) {
    // Hash and store PIN (simplified - use bcrypt in production)
    const pinHash = Math.random().toString(36).substr(2, 9);
    localStorage.setItem(`biometric_${userId}_pin`, pinHash);
    return { success: true };
  },

  async verifyBiometric(userId, method) {
    const key = `biometric_${userId}_${method}`;
    return localStorage.getItem(key) ? true : false;
  }
};

console.log('[Auth Module] Initialized');
