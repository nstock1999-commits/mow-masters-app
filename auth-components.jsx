// Auth Components - Login, Biometric Setup, Remember Device
// Loaded as global window.LoginPage, window.BiometricSetupPage, window.RememberDevicePrompt
// These will be initialized after React loads via importmap

function initAuthComponents() {
  const React = window.React;
  const { useState } = React;

  // LoginPage Component
  window.LoginPage = function LoginPage({ onLoginSuccess, error }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('login'); // 'login' or 'signup'

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        let result;
        if (mode === 'signup') {
          result = await window.authModule.supabase.signUp(email, password);
        } else {
          result = await window.authModule.supabase.signIn(email, password);
        }

        if (result.error) {
          alert('Auth error: ' + result.error);
        } else {
          onLoginSuccess(result.user);
        }
      } catch (err) {
        alert('Error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    return React.createElement('div', { style: styles.container },
      React.createElement('div', { style: styles.card },
        React.createElement('h1', { style: styles.title }, 'Mow Masters of Edmond'),
        React.createElement('p', { style: styles.subtitle }, 'Professional Lawn Care Management'),

        error && React.createElement('div', { style: styles.error }, error),

        React.createElement('form', { onSubmit: handleSubmit, style: styles.form },
          React.createElement('input', {
            type: 'email',
            placeholder: 'Email',
            value: email,
            onChange: (e) => setEmail(e.target.value),
            required: true,
            style: styles.input
          }),
          React.createElement('input', {
            type: 'password',
            placeholder: 'Password',
            value: password,
            onChange: (e) => setPassword(e.target.value),
            required: true,
            style: styles.input
          }),
          React.createElement('button', {
            type: 'submit',
            disabled: loading,
            style: { ...styles.button, opacity: loading ? 0.6 : 1 }
          }, loading ? 'Signing in...' : (mode === 'signup' ? 'Sign Up' : 'Login'))
        ),

        React.createElement('div', { style: styles.divider }, 'OR'),

        React.createElement('button', {
          onClick: () => setMode(mode === 'signup' ? 'login' : 'signup'),
          style: styles.secondaryButton
        }, mode === 'signup' ? 'Already have an account? Login' : "Don't have an account? Sign up")
      )
    );
  };

  // BiometricSetupPage Component
  window.BiometricSetupPage = function BiometricSetupPage({ userId, onComplete }) {
    const [loading, setLoading] = useState(false);

    const handleFaceID = async () => {
      setLoading(true);
      try {
        await window.authModule.setupFaceID(userId);
        onComplete();
      } catch (err) {
        alert('Face ID setup failed: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    const handlePIN = async () => {
      setLoading(true);
      try {
        const pin = prompt('Enter a 4-digit PIN:');
        if (pin && pin.length >= 4) {
          await window.authModule.setupPIN(userId, pin);
          onComplete();
        }
      } catch (err) {
        alert('PIN setup failed: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    return React.createElement('div', { style: styles.container },
      React.createElement('div', { style: styles.card },
        React.createElement('h2', { style: styles.title }, 'Set Up Security'),
        React.createElement('p', { style: styles.subtitle }, 'Choose how to unlock your app'),

        React.createElement('div', { style: styles.buttonGroup },
          React.createElement('button', {
            onClick: handleFaceID,
            disabled: loading,
            style: { ...styles.button, ...styles.primaryButton }
          }, '📱 Set Up Face ID'),
          React.createElement('button', {
            onClick: handlePIN,
            disabled: loading,
            style: { ...styles.button, ...styles.primaryButton }
          }, '🔐 Set Up PIN'),
          React.createElement('button', {
            onClick: onComplete,
            disabled: loading,
            style: { ...styles.button, ...styles.secondaryButton }
          }, 'Skip for Now')
        )
      )
    );
  };

  // RememberDevicePrompt Component
  window.RememberDevicePrompt = function RememberDevicePrompt({ onConfirm, onDecline }) {
    const [loading, setLoading] = useState(false);

    const handleYes = async () => {
      setLoading(true);
      const token = Math.random().toString(36).substr(2, 9);
      onConfirm(token);
    };

    const handleNo = () => {
      setLoading(true);
      onDecline();
    };

    return React.createElement('div', { style: styles.container },
      React.createElement('div', { style: styles.card },
        React.createElement('h2', { style: styles.title }, 'Remember This Device?'),
        React.createElement('p', { style: styles.subtitle }, 'Stay logged in for 24 hours'),

        React.createElement('div', { style: styles.buttonGroup },
          React.createElement('button', {
            onClick: handleYes,
            disabled: loading,
            style: { ...styles.button, ...styles.primaryButton, background: '#10b981' }
          }, '✓ Yes, Remember'),
          React.createElement('button', {
            onClick: handleNo,
            disabled: loading,
            style: { ...styles.button, ...styles.secondaryButton }
          }, '✗ No, Ask Again')
        )
      )
    );
  };

  console.log('[Auth Components] Loaded');
}

// Shared Styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: "'Inter', system-ui, sans-serif"
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: '8px',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    marginBottom: '24px',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'border-color 0.2s'
  },
  button: {
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: 'all 0.2s'
  },
  primaryButton: {
    background: '#667eea',
    color: 'white'
  },
  secondaryButton: {
    background: '#f7fafc',
    color: '#667eea',
    border: '1px solid #e2e8f0'
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px'
  },
  divider: {
    textAlign: 'center',
    color: '#a0aec0',
    margin: '20px 0',
    fontSize: '12px'
  },
  error: {
    background: '#fed7d7',
    color: '#c53030',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px'
  }
};

// Initialize after React loads via importmap (with retry loop)
function tryInitAuthComponents() {
  if (window.React) {
    initAuthComponents();
  } else {
    setTimeout(tryInitAuthComponents, 100);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryInitAuthComponents);
} else {
  tryInitAuthComponents();
}
