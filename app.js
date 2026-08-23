// Mow Masters App - Vanilla JavaScript (No React Complexity)

// ========== AUTH STATE ==========
let authState = {
  user: null,
  stage: 'checking', // 'checking' | 'login' | 'biometric' | 'remember' | 'app'
  loading: true,
  error: null
};

// ========== RENDER LOGIN PAGE ==========
function renderLoginPage() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; font-family: 'Inter', system-ui, sans-serif;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); width: 100%; max-width: 400px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a202c; margin-bottom: 8px; text-align: center;">Mow Masters of Edmond</h1>
        <p style="font-size: 14px; color: #718096; margin-bottom: 24px; text-align: center;">Professional Lawn Care Management</p>

        <form id="loginForm" style="display: flex; flex-direction: column; gap: 12px;">
          <input type="email" id="email" placeholder="Email" required style="padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: 'Inter', system-ui, sans-serif;">
          <input type="password" id="password" placeholder="Password" required style="padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-family: 'Inter', system-ui, sans-serif;">
          <button type="submit" id="submitBtn" style="padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; font-family: 'Inter', system-ui, sans-serif; background: #667eea; color: white;">Login</button>
        </form>

        <div style="text-align: center; color: #a0aec0; margin: 20px 0; font-size: 12px;">OR</div>

        <button id="toggleMode" style="width: 100%; padding: 12px 16px; background: #f7fafc; color: #667eea; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Inter', system-ui, sans-serif;">Don't have an account? Sign up</button>
      </div>
    </div>
  `;

  let isSignUp = false;
  const form = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');
  const toggleBtn = document.getElementById('toggleMode');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  toggleBtn.addEventListener('click', () => {
    isSignUp = !isSignUp;
    submitBtn.textContent = isSignUp ? 'Sign Up' : 'Login';
    toggleBtn.textContent = isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign up";
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
      const email = emailInput.value;
      const password = passwordInput.value;

      let result;
      if (isSignUp) {
        result = await window.authModule.supabase.signUp(email, password);
      } else {
        result = await window.authModule.supabase.signIn(email, password);
      }

      if (result.error) {
        alert('Auth error: ' + result.error);
      } else {
        authState.user = result.user;
        authState.stage = 'biometric';
        renderBiometricSetup();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = isSignUp ? 'Sign Up' : 'Login';
    }
  });
}

// ========== RENDER BIOMETRIC SETUP ==========
function renderBiometricSetup() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; font-family: 'Inter', system-ui, sans-serif;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); width: 100%; max-width: 400px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #1a202c; margin-bottom: 8px; text-align: center;">Set Up Security</h2>
        <p style="font-size: 14px; color: #718096; margin-bottom: 24px; text-align: center;">Choose how to unlock your app</p>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 24px;">
          <button class="bioBtn" data-action="faceID" style="padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; font-family: 'Inter', system-ui, sans-serif; background: #667eea; color: white;">📱 Set Up Face ID</button>
          <button class="bioBtn" data-action="pin" style="padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; font-family: 'Inter', system-ui, sans-serif; background: #667eea; color: white;">🔐 Set Up PIN</button>
          <button class="bioBtn" data-action="skip" style="padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; font-family: 'Inter', system-ui, sans-serif; background: #f7fafc; color: #667eea; border: 1px solid #e2e8f0;">Skip for Now</button>
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.bioBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      btn.disabled = true;

      try {
        if (action === 'faceID') {
          await window.authModule.setupFaceID(authState.user.id);
        } else if (action === 'pin') {
          const pin = prompt('Enter a 4-digit PIN:');
          if (pin && pin.length >= 4) {
            await window.authModule.setupPIN(authState.user.id, pin);
          }
        }

        authState.stage = 'remember';
        renderRememberDevice();
      } catch (err) {
        alert('Setup failed: ' + err.message);
        btn.disabled = false;
      }
    });
  });
}

// ========== RENDER REMEMBER DEVICE ==========
function renderRememberDevice() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; font-family: 'Inter', system-ui, sans-serif;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); width: 100%; max-width: 400px;">
        <h2 style="font-size: 24px; font-weight: 700; color: #1a202c; margin-bottom: 8px; text-align: center;">Remember This Device?</h2>
        <p style="font-size: 14px; color: #718096; margin-bottom: 24px; text-align: center;">Stay logged in for 24 hours</p>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 24px;">
          <button id="rememberYes" style="padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; font-family: 'Inter', system-ui, sans-serif; background: #10b981; color: white;">✓ Yes, Remember</button>
          <button id="rememberNo" style="padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; font-family: 'Inter', system-ui, sans-serif; background: #f7fafc; color: #667eea; border: 1px solid #e2e8f0;">✗ No, Ask Again</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('rememberYes').addEventListener('click', () => {
    const token = Math.random().toString(36).substr(2, 9);
    window.authModule.setDeviceMemory(token);
    authState.stage = 'app';
    renderApp();
  });

  document.getElementById('rememberNo').addEventListener('click', () => {
    authState.stage = 'app';
    renderApp();
  });
}

// ========== RENDER APP (DASHBOARD) ==========
function renderApp() {
  const root = document.getElementById('root');
  root.innerHTML = `
    <div style="min-height: 100vh; background: #f5f5f5; padding: 20px; font-family: 'Inter', system-ui, sans-serif;">
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="background: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 20px;">
          <h1 style="font-size: 32px; font-weight: 700; color: #1a202c; margin-bottom: 8px;">Welcome back, ${authState.user.email}!</h1>
          <p style="font-size: 16px; color: #718096;">Mow Masters of Edmond - Professional Lawn Care Management</p>
        </div>

        <div style="background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h2 style="font-size: 20px; font-weight: 600; color: #1a202c; margin-bottom: 16px;">Dashboard</h2>
          <p style="color: #718096; margin-bottom: 16px;">Authentication successful! Your app is now running.</p>

          <button id="logoutBtn" style="padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; font-family: 'Inter', system-ui, sans-serif; background: #d9534f; color: white;">🚪 Logout</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await window.authModule.supabase.signOut();
    window.authModule.clearDeviceMemory();
    authState.user = null;
    authState.stage = 'login';
    authState.error = null;
    renderLoginPage();
  });
}

// ========== INITIALIZE APP ==========
async function initApp() {
  try {
    // Check device memory first
    const deviceToken = window.authModule?.getDeviceMemory?.();
    if (deviceToken) {
      const session = await window.authModule.supabase.getSession();
      if (session?.user) {
        authState.user = session.user;
        authState.stage = 'app';
        renderApp();
        return;
      }
    }

    // No device memory, show login
    authState.stage = 'login';
    renderLoginPage();
  } catch (err) {
    console.error('Init error:', err);
    authState.stage = 'login';
    renderLoginPage();
  }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

console.log('[App] Initialized');
