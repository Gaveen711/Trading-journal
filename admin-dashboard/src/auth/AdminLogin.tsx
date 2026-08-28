import { useEffect, useState, type FormEvent } from 'react';
import { FirebaseError } from 'firebase/app';
import { useLocation, useNavigate } from 'react-router-dom';
import { ADMIN_EMAIL } from './adminAdmission';
import { ADMIN_IDLE_TIMEOUT_MS, useAuth } from './AuthContext';
import './auth.css';

type LoginLocationState = { from?: string };

function authErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return 'Sign-in could not be completed. Check the account and try again.';
  }

  switch (error.code) {
    case 'auth/too-many-requests':
      return 'Too many attempts. Access is temporarily limited; try again later.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Sign-in failed. Check the account credentials and try again.';
    case 'auth/network-request-failed':
      return 'Firebase could not be reached. Check the connection and try again.';
    default:
      return 'Sign-in failed. Check the account credentials and try again.';
  }
}

function destinationFromState(state: unknown): string {
  const from = (state as LoginLocationState | null)?.from;
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')
    ? from
    : '/';
}

export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    status,
    user,
    notice,
    signInWithEmail,
    clearNotice,
  } = useAuth();
  const email = ADMIN_EMAIL;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const destination = destinationFromState(location.state);

  useEffect(() => {
    if (status === 'authorized' && user) navigate(destination, { replace: true });
  }, [destination, navigate, status, user]);

  const beginAttempt = () => {
    clearNotice();
    setFormError(null);
    setSubmitting(true);
  };

  const handleEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    beginAttempt();
    try {
      await signInWithEmail(email, password);
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(authErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const minutes = Math.round(ADMIN_IDLE_TIMEOUT_MS / 60_000);
  const visibleError = notice || formError;

  return (
    <main className="admin-login">
      <section className="admin-login__brief" aria-labelledby="admin-login-title">
        <a className="admin-login__brand" href="https://www.xaujournal.com" aria-label="XAU Journal home">
          <span className="admin-login__monogram" aria-hidden="true">XAU</span>
          <span>
            <strong>XAU Journal</strong>
            <small>Operator access</small>
          </span>
        </a>

        <div className="admin-login__statement">
          <span className="admin-login__kicker">Private control room</span>
          <h1 id="admin-login-title">One account.<br />One verified boundary.</h1>
          <p>
            Administrative access is limited to the verified XAU Journal operator
            identity carrying the Firebase admin claim.
          </p>
        </div>

        <dl className="admin-login__policy">
          <div><dt>Identity</dt><dd>Exact email match</dd></div>
          <div><dt>Privilege</dt><dd>Admin token claim</dd></div>
          <div><dt>Session</dt><dd>{minutes}-minute idle limit</dd></div>
        </dl>
      </section>

      <section className="admin-login__access" aria-label="Administrator sign in">
        <div className="admin-login__card">
          <div className="admin-login__card-heading">
            <span className="admin-login__key" aria-hidden="true">AUTH / 01</span>
            <h2>Enter the control room</h2>
            <p>Use the designated administrator email and its password.</p>
          </div>

          {visibleError && <div className="admin-login__alert" role="alert">{visibleError}</div>}

          <form onSubmit={handleEmailSignIn}>
            <label className="admin-login__field" htmlFor="admin-email">
              <span>Email address</span>
              <input
                id="admin-email"
                type="email"
                value={email}
                autoComplete="username"
                inputMode="email"
                spellCheck={false}
                readOnly
                required
              />
            </label>

            <label className="admin-login__field" htmlFor="admin-password">
              <span>Password</span>
              <span className="admin-login__password">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>

            <button
              className="admin-login__primary"
              type="submit"
              disabled={submitting || !password}
            >
              {submitting ? 'Verifying session…' : 'Continue with password'}
            </button>
          </form>

          <p className="admin-login__footnote">
            Browser-session persistence only. Closing the session or reaching the idle limit signs this console out.
          </p>
        </div>
      </section>
    </main>
  );
}
