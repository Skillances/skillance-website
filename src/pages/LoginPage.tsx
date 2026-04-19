import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { useFormRateLimit } from '@/hooks/useFormRateLimit';

const REMEMBER_EMAIL_STORAGE_KEY = 'skillance_admin_remember_email';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { canSubmit, secondsRemaining, startCooldownFromRetryAfter } = useFormRateLimit(600_000);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_EMAIL_STORAGE_KEY);
      if (saved) {
        setEmail(saved.trim().toLowerCase());
        setRememberMe(true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.trim().toLowerCase());
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
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
        const canAccessAdmin =
          result.user?.isAdmin === true ||
          String(result.user?.primaryRole ?? '').toLowerCase() === 'admin';
        if (canAccessAdmin) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          setError('Admin access required.');
          setIsLoading(false);
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

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#070707] px-5 py-14 sm:px-8">
      {/* Ambient layers — depth without clutter */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.07),transparent_55%)]" />
        <div className="absolute bottom-0 left-1/2 h-[min(55vh,520px)] w-[min(140vw,900px)] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.04),transparent_100%)] blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <header className="mb-10 text-center">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.35em] text-neutral-500">
            Admin
          </p>
          <h1 className="font-serif text-[2.35rem] leading-[1.08] tracking-tight text-white sm:text-5xl">
            Skillance
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-400">
            Sign in to manage the marketplace and keep operations running smoothly.
          </p>
        </header>

        <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/40 p-px shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <div className="rounded-[calc(1rem-1px)] bg-neutral-950/75 px-6 py-8 sm:px-8 sm:py-9">
            <div className="mb-8 border-b border-white/[0.06] pb-6">
              <h2 className="text-lg font-medium tracking-tight text-white">Secure login</h2>
              <p className="mt-1.5 text-sm text-neutral-500">
                Use your administrator credentials. Sessions are protected end-to-end.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  role="alert"
                  className="rounded-xl border border-red-500/25 bg-red-500/[0.08] p-3.5 flex gap-3"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />
                  <p className="text-sm leading-snug text-red-200/95">{error}</p>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-neutral-300">
                  Email address
                </Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500"
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={isLoading || !canSubmit}
                    className="h-11 rounded-xl border-neutral-800 bg-neutral-900/80 pl-11 text-[15px] text-white placeholder:text-neutral-600 focus-visible:border-neutral-500 focus-visible:ring-white/15"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-neutral-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-500"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isLoading || !canSubmit}
                    className="h-11 rounded-xl border-neutral-800 bg-neutral-900/80 pl-11 pr-11 text-[15px] text-white placeholder:text-neutral-600 focus-visible:border-neutral-500 focus-visible:ring-white/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-500 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
                    aria-pressed={showPassword}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(v) => setRememberMe(v === true)}
                    disabled={isLoading || !canSubmit}
                    className="border-neutral-600 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-neutral-950"
                  />
                  <Label
                    htmlFor="remember-me"
                    className="text-sm font-normal text-neutral-300 cursor-pointer leading-snug"
                  >
                    Remember me on this device
                  </Label>
                </div>
                <p className="text-xs text-neutral-600 pl-7 leading-relaxed">
                  Saves your email and keeps you signed in longer. Your password is never stored here; use your
                  browser or password manager to fill it securely.
                </p>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-white text-[15px] font-semibold text-neutral-950 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] transition-[transform,background-color,box-shadow] hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-60"
                disabled={isLoading || !canSubmit}
              >
                {isLoading ? (
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
                ) : !canSubmit ? (
                  `Try again in ${secondsRemaining}s`
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </div>
        </div>

        <p className="mt-10 text-center text-xs leading-relaxed text-neutral-600">
          &copy; {new Date().getFullYear()} Skillance South Africa. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
