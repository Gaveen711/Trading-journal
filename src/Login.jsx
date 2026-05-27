import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth, googleProvider, facebookProvider, setPersistence, browserLocalPersistence, browserSessionPersistence } from './firebase.js';
import { getFriendlyErrorMessage } from './lib/errorUtils';
import { useToast } from './components/ToastContext';

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
  const toast = useToast();

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
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (rememberMe) {
        localStorage.setItem('xau-remembered-email', email);
      } else {
        localStorage.removeItem('xau-remembered-email');
      }

      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: `${firstName} ${lastName}` });
        
        // Write profile details immediately to Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          firstName,
          lastName,
          displayName: `${firstName} ${lastName}`,
          plan: 'free',
          totalTradesLogged: 0,
          totalJournalsLogged: 0,
          agreedToTerms: false,
          createdAt: new Date().toISOString()
        }, { merge: true });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      localStorage.setItem('xau-auth-hint', 'true');

      // Trigger Login Alert Email
      try {
        const token = await auth.currentUser.getIdToken();
        fetch('/api/auth-utils?action=login-alert', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
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
      await signInWithPopup(auth, googleProvider);
      localStorage.setItem('xau-auth-hint', 'true');

      // Trigger Login Alert Email
      try {
        const token = await auth.currentUser.getIdToken();
        fetch('/api/auth-utils?action=login-alert', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
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

  const handleFacebook = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithPopup(auth, facebookProvider);
      localStorage.setItem('xau-auth-hint', 'true');

      // Trigger Login Alert Email
      try {
        const token = await auth.currentUser.getIdToken();
        fetch('/api/auth-utils?action=login-alert', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
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

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden select-none bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login_bg.png')" }}
    >
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/20 opacity-40" />
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/10 opacity-30" />
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full border border-white/5 opacity-20" />
      </div>

      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-slate-800 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Back
        </Link>
      </div>

      {/* Glass Login Card */}
      <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] p-8 sm:p-10 space-y-6 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.06)] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Top Icon Link */}
        <Link 
          to="/" 
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/50 mx-auto hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1a24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
          </svg>
        </Link>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-bold text-[#1a1a24] tracking-tight">
            {isSignUp ? 'Create account' : 'Sign in with email'}
          </h1>
          <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
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
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-100/60 border border-slate-200/20 focus:border-slate-200/80 focus:bg-white focus:ring-0 transition-all font-medium text-sm text-slate-800 placeholder-slate-400/80 outline-none"
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
                  className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-100/60 border border-slate-200/20 focus:border-slate-200/80 focus:bg-white focus:ring-0 transition-all font-medium text-sm text-slate-800 placeholder-slate-400/80 outline-none"
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
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-slate-100/60 border border-slate-200/20 focus:border-slate-200/80 focus:bg-white focus:ring-0 transition-all font-medium text-sm text-slate-800 placeholder-slate-400/80 outline-none"
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
              className="w-full h-12 pl-11 pr-11 rounded-2xl bg-slate-100/60 border border-slate-200/20 focus:border-slate-200/80 focus:bg-white focus:ring-0 transition-all font-medium text-sm text-slate-800 placeholder-slate-400/80 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-[#1a1a24] transition-colors bg-transparent border-0 outline-none hover:shadow-none"
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
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Error & Success Messages */}
          {error && (
            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500 text-xs font-bold uppercase tracking-tight text-center">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-500/5 border border-green-500/10 rounded-xl text-green-600 text-xs font-bold uppercase tracking-tight text-center">
              {message}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#18181b] hover:bg-[#27272a] active:scale-[0.98] text-white text-sm font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center shadow-md disabled:opacity-50"
          >
            {loading ? 'Authorizing...' : isSignUp ? 'Get Started' : 'Get Started'}
          </button>

          {/* Stay Signed In Switch */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center gap-3">
              <div
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-9 h-5 rounded-full transition-all duration-300 cursor-pointer relative ${rememberMe ? 'bg-[#18181b]' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 ${rememberMe ? 'left-[18px]' : 'left-0.5'}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400/80">Stay signed in</span>
            </div>
          </div>

        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 border-t border-dotted border-slate-300" />
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Or sign in with</span>
          <div className="flex-1 border-t border-dotted border-slate-300" />
        </div>

        {/* Social Grid */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="h-12 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-[0.98] shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" className="mx-auto">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={handleFacebook}
            disabled={loading}
            className="h-12 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-[0.98] shadow-sm"
          >
            <svg width="18" height="18" fill="#1877F2" viewBox="0 0 24 24" className="mx-auto">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
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
            className="text-xs font-semibold text-slate-400 hover:text-slate-800 transition-colors tracking-wide"
          >
            {isSignUp ? 'Already a member? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login;
