import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { queryKeys } from '@/lib/queryKeys';
import type { CategoryNode } from '@/types/product';

function flattenCategories(nodes: CategoryNode[]): CategoryNode[] {
  const out: CategoryNode[] = [];
  const walk = (list: CategoryNode[]) => {
    for (const n of list) {
      out.push(n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

export default function AppRegisterPage() {
  const { registerCustomer, registerFreelancer } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'customer' | 'freelancer'>('customer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    gender: 'prefer_not_to_say',
    age: '25',
    serviceRadius: '25',
    categoryId: '',
    hourlyRate: '',
  });

  const { data: categories = [] } = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: async () => {
      const res = await get(ApiPaths.categories.list);
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      return Array.isArray(data) ? (data as CategoryNode[]) : [];
    },
  });

  const flatCategories = flattenCategories(categories);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!termsAccepted) {
      setError('You must accept the Terms and Privacy Policy.');
      return;
    }
    setIsLoading(true);
    try {
      await registerCustomer({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        termsAccepted: true,
      });
      navigate('/app', { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string; errors?: Array<{ message: string }> };
      setError(e.errors?.[0]?.message ?? e.message ?? 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!termsAccepted) {
      setError('You must accept the Terms and Privacy Policy.');
      return;
    }
    if (!form.categoryId || !form.hourlyRate) {
      setError('Select a category and hourly rate.');
      return;
    }
    setIsLoading(true);
    try {
      await registerFreelancer({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        gender: form.gender,
        age: parseInt(form.age, 10),
        categories: [form.categoryId],
        categoryRates: [{ categoryId: form.categoryId, hourlyRate: parseFloat(form.hourlyRate) }],
        serviceRadius: parseFloat(form.serviceRadius),
        termsAccepted: true,
      });
      navigate('/app/freelancer/dashboard', { replace: true });
    } catch (err: unknown) {
      const e = err as { message?: string; errors?: Array<{ message: string }> };
      setError(e.errors?.[0]?.message ?? e.message ?? 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const fields = (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>First name</Label>
          <Input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Last name</Label>
          <Input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Phone</Label>
        <Input value={form.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Password</Label>
        <Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
        <p className="text-xs text-neutral-500">Min 8 chars, uppercase, number, special character</p>
      </div>
      <div className="flex items-start gap-2">
        <Checkbox checked={termsAccepted} onCheckedChange={(v) => setTermsAccepted(v === true)} id="terms" />
        <Label htmlFor="terms" className="text-sm font-normal leading-snug">
          I accept the{' '}
          <Link to="/terms" className="underline" target="_blank">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy-policy" className="underline" target="_blank">
            Privacy Policy
          </Link>
        </Label>
      </div>
    </>
  );

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <Link to="/app" className="font-serif text-2xl text-neutral-900">
            Skillance
          </Link>
          <h1 className="text-xl font-semibold mt-4">Create your account</h1>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'customer' | 'freelancer')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="freelancer">Freelancer</TabsTrigger>
          </TabsList>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <TabsContent value="customer">
            <form onSubmit={handleCustomer} className="space-y-4 bg-white border border-neutral-200 rounded-2xl p-6">
              {fields}
              <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create customer account'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="freelancer">
            <form onSubmit={handleFreelancer} className="space-y-4 bg-white border border-neutral-200 rounded-2xl p-6">
              {fields}
              <div className="space-y-2">
                <Label>Primary service category</Label>
                <select
                  className="w-full h-10 rounded-md border border-neutral-200 px-3 text-sm"
                  value={form.categoryId}
                  onChange={(e) => update('categoryId', e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {flatCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Hourly rate (ZAR)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.hourlyRate}
                    onChange={(e) => update('hourlyRate', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service radius (km)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.serviceRadius}
                    onChange={(e) => update('serviceRadius', e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create freelancer account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link to="/app/login" className="font-medium text-neutral-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
