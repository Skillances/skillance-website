import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';
import { post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import AuthShell from '@/components/marketplace/AuthShell';
import { MkButton, MkFormError, MkInput, MkLinkButton } from '@/components/marketplace/ui';
import { apiErrorMessage, apiFieldErrors } from '@/lib/marketplace/apiHelpers';
import { validateEmail } from '@/lib/marketplace/validation';
import { mkMotion } from '@/lib/marketplace/theme';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const problem = validateEmail(email);
    setFieldError(problem);
    if (problem) return;
    setSubmitting(true);
    try {
      const res = await post(ApiPaths.marketplace.forgotPassword, { email: email.trim().toLowerCase() });
      // The API returns the same message whether or not the account exists.
      setSentMessage(typeof res?.message === 'string' && res.message ? res.message : 'Check your email for a reset link.');
    } catch (err) {
      const fields = apiFieldErrors(err);
      if (fields.email) setFieldError(fields.email);
      else setFormError(apiErrorMessage(err, 'Could not send the reset email. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Forgot your password?"
      subtitle="Enter the email you use for Skillance and we will send you a reset link."
      footer={
        <Link to="/login" className="font-semibold text-mk-text-primary underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {sentMessage ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: mkMotion.control }}
            className="rounded-2xl border border-mk-border p-5"
            role="status"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-mk-muted text-mk-success">
              <MailCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="text-[15px] leading-relaxed">{sentMessage}</p>
            <MkLinkButton to="/login" block className="mt-5 h-12">
              Back to sign in
            </MkLinkButton>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            noValidate
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: mkMotion.control }}
          >
            <MkInput
              label="Email address"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFieldError(null);
              }}
              error={fieldError}
            />
            <MkFormError message={formError} />
            <MkButton type="submit" block loading={submitting} className="h-12">
              Send reset link
            </MkButton>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
