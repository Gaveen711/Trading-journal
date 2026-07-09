import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, googleProvider, setPersistence, browserLocalPersistence, browserSessionPersistence } from './firebase.js';
import { getFriendlyErrorMessage } from './lib/errorUtils';
import { NeatGradient } from '@firecms/neat';
import { useAppTheme } from './hooks/useAppTheme';

async function fetchCountry() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) return null;
    const data = await res.json();
    return data.country_code || null;
  } catch { return null; }
}

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const modeParam = searchParams.get('mode');

  const [isSignUp, setIsSignUp] = useState(modeParam !== 'signin');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const canvasRef = useRef(null);
  const gradientRef = useRef(null);
  const { isLightMode } = useAppTheme();

  function createGradient(lightMode) {
    const lightColors = [
      { color: '#ffffff', enabled: true },
      { color: '#00E5FF', enabled: true },
      { color: '#FF5A36', enabled: true },
      { color: '#06FFA5', enabled: true },
      { color: '#ffffff', enabled: true },
    ];

    const darkColors = [
      { color: '#050510', enabled: true },
      { color: '#00E5FF', enabled: true },
      { color: '#FF5A36', enabled: true },
      { color: '#06FFA5', enabled: true },
      { color: '#050510', enabled: true },
    ];

    return new NeatGradient({
      ref: canvasRef.current,
      colors: lightMode ? lightColors : darkColors,
      speed: 10,
      horizontalPressure: 6,
      verticalPressure: 5,
      waveFrequencyX: 4,
      waveFrequencyY: 10,
      waveAmplitude: 1,
      shadows: 2,
      highlights: 2,
      colorBrightness: lightMode ? 1.2 : 1,
      colorSaturation: lightMode ? 0.25 : 0.45,
      wireframe: false,
      colorBlending: 8,
      backgroundColor: lightMode ? '#fafbfc' : '#050510',
      backgroundAlpha: 1,
      grainScale: 2,
      grainSparsity: 0,
      grainIntensity: 0,
      grainSpeed: 1,
      resolution: 0.75,
      flowEnabled: false,
      enableProceduralTexture: false,
      domainWarpEnabled: false,
      vignetteIntensity: 0,
      vignetteRadius: 0.8,
      fresnelEnabled: false,
      iridescenceEnabled: false,
      bloomIntensity: 0,
      chromaticAberration: 0,
    });
  }

  useEffect(() => {
    if (!canvasRef.current) return;

    if (gradientRef.current) {
      gradientRef.current.destroy();
      gradientRef.current = null;
    }
    gradientRef.current = createGradient(isLightMode);

    const handleScroll = () => {
      if (gradientRef.current) {
        gradientRef.current.yOffset = window.scrollY * 0.3;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (gradientRef.current) {
        gradientRef.current.destroy();
        gradientRef.current = null;
      }
    };
  }, [isLightMode]);


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const m = params.get('mode');
    if (m === 'signin') {
      setIsSignUp(false);
    } else if (m === 'signup') {
      setIsSignUp(true);
    }
  }, [location]);

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('xau-remembered-email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (rememberMe) {
        localStorage.setItem('xau-remembered-email', email);
      } else {
        localStorage.removeItem('xau-remembered-email');
      }

      if (isSignUp) {
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('auth/missing-name');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const country = await fetchCountry();
        
        await updateProfile(user, { displayName: `${firstName} ${lastName}` });
        
        // Write profile details immediately to Firestore without sensitive subscription info
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          totalTradesLogged: 0,
          totalJournalsLogged: 0,
          agreedToTerms: false,
          country,
          createdAt: new Date().toISOString()
        }, { merge: true });

        // Retrieve token to authenticate the server call
        try {
          const token = await user.getIdToken();
          const initResponse = await fetch('/api/init-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (!initResponse.ok) {
            throw new Error('Failed to initialize user subscription.');
          }
        } catch (initErr) {
          console.error('Failed to initialize user subscription:', initErr);
          if (!isLocalhost) {
            throw initErr;
          }
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      localStorage.setItem('xau-auth-hint', 'true');

      // Trigger Login Alert Email
      try {
        const token = await auth.currentUser.getIdToken();
        fetch('/api/auth-utils', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'send-login-alert' })
        }).catch(e => {
          if (e.name !== 'AbortError') {
            console.error("Failed to trigger login alert:", e);
          }
        });
      } catch (e) {
        console.error("Failed to trigger login alert:", e);
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Reset link sent to your email.');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      localStorage.setItem('xau-auth-hint', 'true');

      // Extract names from Google profile
      const displayName = user.displayName || '';
      const [first, ...last] = displayName.split(' ');
      const firstName = first || '';
      const lastName = last.join(' ') || '';

      // Initialize/update their user doc in Firestore to ensure names are present
      const country = await fetchCountry();
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        firstName: firstName || 'Google',
        lastName: lastName || 'User',
        displayName: displayName || user.email?.split('@')[0] || 'Google User',
        totalTradesLogged: 0,
        totalJournalsLogged: 0,
        agreedToTerms: false,
        country,
        createdAt: new Date().toISOString()
      }, { merge: true });

      // Trigger Login Alert Email
      try {
        const token = await auth.currentUser.getIdToken();
        fetch('/api/auth-utils', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'send-login-alert' })
        }).catch(e => {
          if (e.name !== 'AbortError') {
            console.error("Failed to trigger login alert:", e);
          }
        });

        // Initialize user subscription securely on the server
        const initResponse = await fetch('/api/init-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (!initResponse.ok) {
          throw new Error('Failed to initialize user subscription.');
        }
      } catch (e) {
        console.error("Failed to trigger post-login actions:", e);
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };



  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden select-none bg-background text-foreground aurora-theme"
    >
      {/* NeatGradient animated background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: isLightMode ? 0.28 : 0.55 }}
        />
      </div>


      {/* Glass Login Card */}
      <div className="w-full max-w-[420px] bg-white/70 dark:bg-card/75 backdrop-blur-xl border border-white/40 dark:border-border/60 rounded-[2.5rem] p-8 sm:p-10 space-y-6 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.06)] dark:shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Top Icon Link */}
        <Link 
          to="/" 
          className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/50 dark:border-zinc-700/50 mx-auto hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-white">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
          </svg>
        </Link>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-bold text-[#1a1a24] dark:text-foreground tracking-tight">
            {isSignUp ? 'Create account' : 'Sign in with email'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
            {isSignUp 
              ? 'Create a free terminal profile to bring your journals, data, and trades together.'
              : 'Access your terminal to bring your trades, data, and strategies together. For free'}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          
          {/* First & Last name inputs (Only visible in Register/Sign Up mode) */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/20 dark:border-white/5 focus:border-slate-200/80 dark:focus:border-primary/50 focus:bg-white dark:focus:bg-black/20 focus:ring-0 transition-all font-medium text-sm text-slate-800 dark:text-white placeholder-slate-400/80 dark:placeholder-slate-500 outline-none"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Last name"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/20 dark:border-white/5 focus:border-slate-200/80 dark:focus:border-primary/50 focus:bg-white dark:focus:bg-black/20 focus:ring-0 transition-all font-medium text-sm text-slate-800 dark:text-white placeholder-slate-400/80 dark:placeholder-slate-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/20 dark:border-white/5 focus:border-slate-200/80 dark:focus:border-primary/50 focus:bg-white dark:focus:bg-black/20 focus:ring-0 transition-all font-medium text-sm text-slate-800 dark:text-white placeholder-slate-400/80 dark:placeholder-slate-500 outline-none"
            />
          </div>

          {/* Password input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full h-12 pl-11 pr-11 rounded-2xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/20 dark:border-white/5 focus:border-slate-200/80 dark:focus:border-primary/50 focus:bg-white dark:focus:bg-black/20 focus:ring-0 transition-all font-medium text-sm text-slate-800 dark:text-white placeholder-slate-400/80 dark:placeholder-slate-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#1a1a24] dark:hover:text-white transition-colors bg-transparent border-0 outline-none hover:shadow-none"
            >
              {showPassword ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>

          {/* Forgot password */}
          {!isSignUp && (
            <div className="flex justify-end px-1">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Error & Success Messages */}
          {error && (
            <div
              className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left text-sm font-semibold leading-relaxed text-red-600 dark:text-red-300"
              role="alert"
              aria-live="polite"
            >
              <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 7v6" />
                <path d="M12 17h.01" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="rounded-2xl border border-green-500/15 bg-green-500/10 px-4 py-3 text-left text-sm font-semibold leading-relaxed text-green-600 dark:text-green-300" role="status" aria-live="polite">
              {message}
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-[200px] h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-black text-[10px] uppercase tracking-[0.18em] hover:scale-105 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-lg dark:shadow-[0_8px_30px_rgba(255,255,255,0.05)] border-0 cursor-pointer"
            >
              {loading ? 'Authorizing...' : isSignUp ? 'Get Started' : 'Login'}
            </button>
          </div>

          {/* Stay Signed In Switch */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-3">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-9 h-5 rounded-full transition-all duration-300 cursor-pointer relative ${rememberMe ? 'bg-[#18181b] dark:bg-primary' : 'bg-slate-200 dark:bg-zinc-800'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${rememberMe ? 'left-[18px]' : 'left-0.5'}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400/80 dark:text-muted-foreground/80">Stay signed in</span>
            </div>
          </div>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 border-t border-dotted border-slate-300 dark:border-zinc-800" />
          <span className="text-[10px] text-slate-400 dark:text-muted-foreground font-medium uppercase tracking-wider">Or sign in with</span>
          <div className="flex-1 border-t border-dotted border-slate-300 dark:border-zinc-800" />
        </div>

        {/* Google Auth Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-12 bg-white dark:bg-zinc-800/80 hover:bg-slate-50 dark:hover:bg-zinc-700/50 border border-slate-200/60 dark:border-zinc-700/50 rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.98] shadow-sm font-semibold text-xs text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Footer switcher */}
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setError('');
              navigate(`/login?mode=${isSignUp ? 'signin' : 'signup'}`);
            }}
            className="text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors tracking-wide"
          >
            {isSignUp ? 'Already a member? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;
