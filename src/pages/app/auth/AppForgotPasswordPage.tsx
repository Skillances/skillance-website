import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

export default function AppForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await post(ApiPaths.auth.forgotPassword, { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message ?? 'Could not send reset email');
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
          <h1 className="text-xl font-semibold mt-6">Reset password</h1>
        </div>

        {sent ? (
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-3" />
            <p className="text-neutral-700">
              If an account exists for that email, you will receive reset instructions shortly.
            </p>
            <Link to="/app/login" className="inline-block mt-6 text-sm font-medium text-neutral-900 hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Button>
            <Link to="/app/login" className="block text-center text-sm text-neutral-500 hover:underline">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
