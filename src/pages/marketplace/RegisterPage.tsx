import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useAuth } from '@/context/AuthContext';
import AuthShell from '@/components/marketplace/AuthShell';
import { MkButton, MkFormError, MkInput, MkSegmented, MkSelect } from '@/components/marketplace/ui';
import { MkCategoryRatePicker, MkPasswordRules, MkPhotoPicker } from '@/components/marketplace/forms';
import { apiErrorMessage, apiFieldErrors } from '@/lib/marketplace/apiHelpers';
import { flattenLeaves, useCategories } from '@/lib/marketplace/categories';
import {
  ageFromDob,
  validateEmail,
  validateHourlyRate,
  validateName,
  validatePassword,
  validatePhone,
} from '@/lib/marketplace/validation';
import PlaceAddressField, { type PlacePick } from '@/components/marketplace/PlaceAddressField';

type Role = 'customer' | 'freelancer';

/** skillance-app lib/core/constants/legal_constants.dart */
const TERMS_VERSION = '4';
const PRIVACY_VERSION = '3';
/** skillance-app AppConstants.defaultServiceRadius (km). */
const DEFAULT_SERVICE_RADIUS_KM = 10;

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

type Errors = Record<string, string | undefined>;

function PasswordField({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className="relative">
        <MkInput
          label="Password"
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-1 top-[28px] inline-flex h-11 w-11 items-center justify-center rounded-full text-mk-text-tertiary transition-colors duration-150 hover:text-mk-text-primary"
          aria-pressed={show}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      <MkPasswordRules value={value} />
    </div>
  );
}

function TermsCheckbox({ checked, onChange, error }: { checked: boolean; onChange: (v: boolean) => void; error?: string }) {
  return (
    <div>
      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[14px] leading-relaxed text-mk-text-secondary">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'terms-error' : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 accent-mk-primary"
        />
        <span>
          I agree to the{' '}
          <Link to="/terms" target="_blank" className="font-semibold text-mk-text-primary underline underline-offset-2">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy-policy" target="_blank" className="font-semibold text-mk-text-primary underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      {error && (
        <p id="terms-error" role="alert" className="mt-1 text-[13px] text-mk-error">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[16px]">{title}</h2>
      {children}
    </section>
  );
}

export default function RegisterPage() {
  const [params, setParams] = useSearchParams();
  const role: Role = params.get('role') === 'freelancer' ? 'freelancer' : 'customer';
  const navigate = useNavigate();
  const { startSession, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);

  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [rates, setRates] = useState<Record<string, string>>({});
  const [place, setPlace] = useState<PlacePick | null>(null);

  const [errors, setErrors] = useState<Errors>({});
  const [rateErrors, setRateErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = useCategories();
  const leaves = useMemo(() => flattenLeaves(categories.data ?? []), [categories.data]);
  const age = dob ? ageFromDob(dob) : null;

  const clear = (key: string) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));

  const validate = (): boolean => {
    const next: Errors = {
      firstName: validateName(firstName, 'First') ?? undefined,
      lastName: validateName(lastName, 'Last') ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      phoneNumber: validatePhone(phone) ?? undefined,
      termsAccepted: terms ? undefined : 'You must accept the Terms of Service and Privacy Policy to create an account.',
    };
    const nextRates: Errors = {};
    if (role === 'freelancer') {
      if (!dob) next.age = 'Please select your date of birth';
      else if (age == null) next.age = 'Enter a valid date of birth';
      else if (age < 18) next.age = 'You must be at least 18 years old to register';
      else if (age > 100) next.age = 'Age cannot exceed 100';
      if (!gender) next.gender = 'Please select your gender';
      if (selected.length === 0) next.categories = 'Please select at least one service category';
      for (const p of selected) {
        const msg = validateHourlyRate(rates[p] ?? '');
        if (msg) nextRates[p] = msg;
      }
    }
    setErrors(next);
    setRateErrors(nextRates);
    return Object.values(next).every((v) => !v) && Object.keys(nextRates).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    // Validation guarantees the box is ticked; the flag is still only added when it is.
    if (!terms) return;

    const base: Record<string, unknown> = {
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phoneNumber: phone.replace(/\s+/g, ''),
      termsAccepted: true,
      termsVersion: TERMS_VERSION,
      privacyVersion: PRIVACY_VERSION,
    };
    if (photo) base.profilePhoto = photo;

    let endpoint: string = ApiPaths.marketplace.registerCustomer;
    if (role === 'freelancer') {
      endpoint = ApiPaths.marketplace.registerFreelancer;
      Object.assign(base, {
        gender,
        age,
        categories: selected,
        categoryRates: selected.map((p) => ({ categoryId: p, hourlyRate: Number(rates[p]) })),
        serviceRadius: DEFAULT_SERVICE_RADIUS_KM,
      });
      if (place) {
        base.serviceLocationAddress = place.address;
        if (place.city) base.serviceLocationCity = place.city;
        base.serviceLocationLabel = 'Primary';
        base.serviceLocationRadius = DEFAULT_SERVICE_RADIUS_KM;
        if (place.latitude != null && place.longitude != null) {
          base.serviceLocationLatitude = place.latitude;
          base.serviceLocationLongitude = place.longitude;
        }
      }
    }

    setSubmitting(true);
    try {
      const res = await post(endpoint, base);
      const data = res?.data as { accessToken?: string } | undefined;
      if (!res?.success || !data) throw res;
      if (!data.accessToken) {
        navigate('/login', { replace: true, state: { notice: 'Account created. Sign in to continue.' } });
        return;
      }
      startSession(data);
      // Register responses omit customer/freelancer ids; /users/me fills them in.
      await refreshUser().catch(() => null);
      navigate(role === 'freelancer' ? '/work' : '/home', { replace: true });
    } catch (err) {
      const fields = apiFieldErrors(err);
      const mapped: Errors = {};
      for (const [k, v] of Object.entries(fields)) {
        const key = k.startsWith('categoryRates') ? 'categories' : k;
        mapped[key] = mapped[key] ?? v;
      }
      const known = ['firstName', 'lastName', 'email', 'password', 'phoneNumber', 'termsAccepted', 'age', 'gender', 'categories', 'profilePhoto'];
      const placed = Object.keys(mapped).some((k) => known.includes(k));
      setErrors((prev) => ({ ...prev, ...mapped }));
      setFormError(placed ? null : apiErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title={role === 'freelancer' ? 'Offer your skills' : 'Find trusted help'}
      subtitle={
        role === 'freelancer'
          ? 'Create a freelancer account to get booked for your services.'
          : 'Create a customer account to book skilled freelancers near you.'
      }
      wide={role === 'freelancer'}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-mk-text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="mb-6">
        <MkSegmented<Role>
          label="Account type"
          value={role}
          onChange={(v) => {
            setErrors({});
            setFormError(null);
            setParams({ role: v }, { replace: true });
          }}
          options={[
            { value: 'customer', label: 'Customer' },
            { value: 'freelancer', label: 'Freelancer' },
          ]}
        />
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-8">
        <Section title="Your details">
          <MkPhotoPicker value={photo} onChange={setPhoto} name={`${firstName} ${lastName}`} error={errors.profilePhoto} />
          <div className="grid gap-4 sm:grid-cols-2">
            <MkInput
              label="First name"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                clear('firstName');
              }}
              error={errors.firstName}
            />
            <MkInput
              label="Last name"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                clear('lastName');
              }}
              error={errors.lastName}
            />
          </div>
          <MkInput
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clear('email');
            }}
            error={errors.email}
          />
          <MkInput
            label="Phone number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0821234567"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              clear('phoneNumber');
            }}
            error={errors.phoneNumber}
            hint="South African number, starting with 0 or +27"
          />
          <PasswordField
            value={password}
            onChange={(v) => {
              setPassword(v);
              clear('password');
            }}
            error={errors.password}
          />
        </Section>

        {role === 'freelancer' && (
          <>
            <Section title="About you">
              <div className="grid gap-4 sm:grid-cols-2">
                <MkInput
                  label="Date of birth"
                  type="date"
                  value={dob}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => {
                    setDob(e.target.value);
                    clear('age');
                  }}
                  error={errors.age}
                  hint={age != null ? `Age: ${age}${age < 18 || age > 100 ? ' (must be 18 to 100)' : ''}` : 'You must be at least 18'}
                />
                <MkSelect
                  label="Gender"
                  value={gender}
                  onChange={(e) => {
                    setGender(e.target.value);
                    clear('gender');
                  }}
                  error={errors.gender}
                >
                  <option value="" disabled>
                    Select your gender
                  </option>
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </MkSelect>
              </div>
            </Section>

            <Section title="Services you offer">
              <MkCategoryRatePicker
                leaves={leaves}
                loading={categories.isLoading}
                selected={selected}
                onSelectedChange={(v) => {
                  setSelected(v);
                  clear('categories');
                }}
                rates={rates}
                onRatesChange={(r) => {
                  setRates(r);
                  setRateErrors({});
                }}
                rateErrors={rateErrors}
                error={
                  errors.categories ??
                  (categories.isError ? apiErrorMessage(categories.error, 'Could not load service categories.') : null)
                }
              />
              {categories.isError && (
                <MkButton variant="secondary" size="sm" onClick={() => void categories.refetch()}>
                  Try loading categories again
                </MkButton>
              )}
            </Section>

            <Section title="Where you work">
              <PlaceAddressField
                label="Service area address"
                value={place}
                onChange={setPlace}
                hint={`Optional. Customers within ${DEFAULT_SERVICE_RADIUS_KM} km will find you first. You can add more areas later.`}
              />
            </Section>
          </>
        )}

        <div className="space-y-4">
          <TermsCheckbox
            checked={terms}
            onChange={(v) => {
              setTerms(v);
              clear('termsAccepted');
            }}
            error={errors.termsAccepted}
          />
          <MkFormError message={formError} />
          <div className="sticky bottom-0 -mx-4 bg-mk-background px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:static sm:mx-0 sm:p-0">
            <MkButton type="submit" block loading={submitting} className="h-12">
              {role === 'freelancer' ? 'Create freelancer account' : 'Create account'}
            </MkButton>
          </div>
        </div>
      </form>
    </AuthShell>
  );
}
