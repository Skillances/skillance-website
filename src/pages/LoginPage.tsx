import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CircleCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFormRateLimit } from '@/hooks/useFormRateLimit';
import AuthShell from '@/components/marketplace/AuthShell';
import { MkPasswordInput } from '@/components/marketplace/forms';
import { MkButton, MkFormError, MkInput } from '@/components/marketplace/ui';
import { isStaff, landingPath } from '@/lib/marketplace/session';
import {
  INVALID_LOGIN_CREDENTIALS_MESSAGE,
  LOGIN_RATE_LIMIT_MESSAGE,
  LOGIN_UNAVAILABLE_MESSAGE,
} from '@/lib/marketplace/authMessages';
import { returnPathFrom } from '@/lib/marketplace/redirect';

const REMEMBER_EMAIL_STORAGE_KEY = 'skillance_admin_remember_email';

function readRememberedEmail(): string {
  try {
    return localStorage.getItem(REMEMBER_EMAIL_STORAGE_KEY)?.trim().toLowerCase() ?? '';
  } catch {
    return '';
  }
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState(readRememberedEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => readRememberedEmail() !== '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { canSubmit, secondsRemaining, startCooldownFromRetryAfter } = useFormRateLimit(600_000);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  if (!authLoading && isAuthenticated && user && !isLoading) {
    const back = returnPathFrom(location.state);
    return <Navigate to={!isStaff(user) && back ? back : landingPath(user)} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailOk = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk || !password) {
      setError(INVALID_LOGIN_CREDENTIALS_MESSAGE);
      return;
    }

    if (!canSubmit) return;

    setIsLoading(true);

    try {
      const result = await login(email, password, { rememberMe });

      if (result.success) {
        try {
          if (rememberMe) {
            localStorage.setItem(REMEMBER_EMAIL_STORAGE_KEY, email.trim().toLowerCase());
          } else {
            localStorage.removeItem(REMEMBER_EMAIL_STORAGE_KEY);
          }
        } catch {
          /* ignore */
        }
        const back = returnPathFrom(location.state);
        if (!isStaff(result.user) && back) {
          navigate(back, { replace: true });
        } else {
          navigate(landingPath(result.user), { replace: true });
        }
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'retryAfter' in err) {
        const r = err as { retryAfter?: number; message?: string };
        setError(r.message || LOGIN_RATE_LIMIT_MESSAGE);
        if (r.retryAfter != null) startCooldownFromRetryAfter(r.retryAfter);
      } else if (err instanceof Error && err.message === LOGIN_UNAVAILABLE_MESSAGE) {
        setError(LOGIN_UNAVAILABLE_MESSAGE);
      } else {
        setError(INVALID_LOGIN_CREDENTIALS_MESSAGE);
      }
      setIsLoading(false);
    }
  };

  const disabled = isLoading || !canSubmit;
  const notice = (location.state as { notice?: unknown } | null)?.notice;

  return (
    <AuthShell
      panel
      title="Welcome back"
      subtitle="Sign in to manage bookings, messages, and your Skillance account."
      footer={
        <>
          New to Skillance?{' '}
          <Link to="/register">
            Create an account
          </Link>
        </>
      }
    >
      {typeof notice === 'string' && notice && (
        <div
          role="status"
          className="mb-5 flex gap-3 rounded-xl border border-mk-success/25 bg-mk-muted/80 p-3.5 text-[14px] leading-relaxed text-mk-text-primary"
        >
          <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-mk-success" aria-hidden="true" />
          <span>{notice}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
        <MkInput
          id="email"
          type="email"
          label="Email address"
          autoComplete="email"
          inputMode="email"
          placeholder="name@example.com"
          value={email}
          autoFocus={email === ''}
          onChange={(e) => {
            setEmail(e.target.value.trim().toLowerCase());
            setError('');
          }}
          disabled={disabled}
        />

        <MkPasswordInput
          id="password"
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          disabled={disabled}
        />

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-0.5">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-[14px] text-mk-text-secondary">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={disabled}
              className="h-5 w-5 rounded-md border-mk-border text-mk-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mk-primary/15 focus-visible:ring-offset-2"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="inline-flex min-h-11 items-center text-[14px] font-semibold text-black underline-offset-4 transition-opacity duration-150 ease-out hover:underline"
          >
            Forgot password
          </Link>
        </div>

        <MkFormError message={error} />

        <MkButton type="submit" block loading={isLoading} disabled={!canSubmit} className="mt-1 h-12 min-h-12 w-full">
          {!canSubmit ? `Try again in ${secondsRemaining}s` : 'Sign in'}
        </MkButton>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
