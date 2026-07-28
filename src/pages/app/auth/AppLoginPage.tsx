import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isFirebaseConfigured, signInWithGooglePopup } from '@/lib/firebase';
import { useFormRateLimit } from '@/hooks/useFormRateLimit';

export default function AppLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogleIdToken, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { canSubmit, secondsRemaining, startCooldownFromRetryAfter } = useFormRateLimit(600_000);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;

  useEffect(() => {
    if (!isAuthenticated) return;
    if (isAdmin) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    navigate(from && from.startsWith('/app') ? from : '/app', { replace: true });
  }, [isAuthenticated, isAdmin, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) return;
    setIsLoading(true);
    try {
      const result = await login(email, password, { rememberMe });
      if (result.user.isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from && from.startsWith('/app') ? from : '/app', { replace: true });
      }
    } catch (err: unknown) {
      const e = err as { message?: string; retryAfter?: number };
      setError(e.message ?? 'Login failed');
      if (e.retryAfter) startCooldownFromRetryAfter(e.retryAfter);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (!isFirebaseConfigured()) {
      setError('Google sign-in is not configured yet.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const idToken = await signInWithGooglePopup();
      const result = await loginWithGoogleIdToken(idToken);
      if (result.user.isAdmin) {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from && from.startsWith('/app') ? from : '/app', { replace: true });
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/app" className="font-serif text-2xl text-neutral-900">
            Skillance
          </Link>
          <h1 className="text-xl font-semibold mt-6 text-neutral-900">Welcome back</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to book and manage services</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-neutral-200 rounded-2xl p-6">
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(v) => setRememberMe(v === true)}
            />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
              Remember me
            </Label>
          </div>

          <Button type="submit" className="w-full rounded-full" disabled={isLoading || !canSubmit}>
            {isLoading ? 'Signing in...' : !canSubmit ? `Wait ${secondsRemaining}s` : 'Sign in'}
          </Button>

          {isFirebaseConfigured() && (
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full"
              disabled={isLoading}
              onClick={handleGoogle}
            >
              Continue with Google
            </Button>
          )}

          <div className="text-center text-sm text-neutral-500 space-y-2 pt-2">
            <Link to="/app/forgot-password" className="text-neutral-900 hover:underline block">
              Forgot password?
            </Link>
            <p>
              New here?{' '}
              <Link to="/app/register" className="text-neutral-900 font-medium hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
