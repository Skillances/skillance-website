import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFormRateLimit } from '@/hooks/useFormRateLimit';
import AuthShell from '@/components/marketplace/AuthShell';
import { MkButton, MkFormError, MkInput } from '@/components/marketplace/ui';
import { isStaff, landingPath } from '@/lib/marketplace/session';
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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState<{ email?: string; password?: string }>({});
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

    const nextFieldError: { email?: string; password?: string } = {};
    if (!email) nextFieldError.email = 'Enter your email address';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextFieldError.email = 'Please enter a valid email address';
    if (!password) nextFieldError.password = 'Enter your password';
    else if (password.length < 6) nextFieldError.password = 'Password must be at least 6 characters long';
    setFieldError(nextFieldError);
    if (nextFieldError.email || nextFieldError.password) return;

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
        setError(r.message || 'Too many login attempts. Please try again later.');
        if (r.retryAfter != null) startCooldownFromRetryAfter(r.retryAfter);
      } else {
        const message =
          err instanceof Error ? err.message : 'Invalid email or password.';
        setError(message);
      }
      setIsLoading(false);
    }
  };

  const disabled = isLoading || !canSubmit;
  const notice = (location.state as { notice?: unknown } | null)?.notice;

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Sign in with your Skillance account."
      footer={
        <>
          New to Skillance?{' '}
          <Link
            to="/register"
            className="font-semibold text-mk-text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      {typeof notice === 'string' && notice && (
        <p role="status" className="mb-5 rounded-xl border border-mk-border p-3 text-[14px] text-mk-success">
          {notice}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <MkInput
          id="email"
          type="email"
          label="Email address"
          autoComplete="email"
          inputMode="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value.trim().toLowerCase());
            setFieldError((f) => ({ ...f, email: undefined }));
            setError('');
          }}
          error={fieldError.email}
          disabled={disabled}
        />

        <div className="relative">
          <MkInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFieldError((f) => ({ ...f, password: undefined }));
              setError('');
            }}
            error={fieldError.password}
            disabled={disabled}
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-1 top-[28px] inline-flex h-11 w-11 items-center justify-center rounded-full text-mk-text-tertiary transition-colors duration-150 hover:text-mk-text-primary"
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-[14px] text-mk-text-secondary">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={disabled}
              className="h-5 w-5 rounded border-mk-border accent-mk-primary"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="inline-flex min-h-11 items-center text-[14px] font-semibold text-mk-text-primary underline-offset-4 hover:underline"
          >
            Forgot password
          </Link>
        </div>

        <MkFormError message={error} />

        <MkButton type="submit" block loading={isLoading} disabled={!canSubmit} className="h-12">
          {!canSubmit ? `Try again in ${secondsRemaining}s` : 'Sign in'}
        </MkButton>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
