import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import PageTemplate from '../components/layout/PageTemplate';
import { Send, MapPin, Mail, Phone } from 'lucide-react';
import { post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { apiErrorMessage, apiRateLimit } from '@/lib/marketplace/apiHelpers';
import {
  CONTACT_LIMITS,
  PREFILL_MAX_LENGTH,
  contactFormSchema,
  firstContactError,
  sanitizePrefill,
} from '@/lib/contactForm';
import { useFormRateLimit } from '@/hooks/useFormRateLimit';
import { CorporateLegalAddress } from '../components/corporate/CorporateLegalAddress';

/** UX-only cooldown after a successful send; the backend enforces the real limit. */
const CONTACT_COOLDOWN_MS = 60_000;
/** Bots fill every field; humans never see this one. Must stay empty. */
const HONEYPOT_FIELD = 'company_website';
const SEND_FAILED_MESSAGE = 'We could not send your message. Please try again, or email services@skillance.co.za.';

const ContactPage = () => {
  const [searchParams] = useSearchParams();
  const prefilled = useMemo(() => {
    const subject = sanitizePrefill(searchParams.get('subject'));
    const context = sanitizePrefill(searchParams.get('context'), PREFILL_MAX_LENGTH);
    const message = context.length > 0 ? `I'm interested in: ${context}\n\n` : '';
    return { subject, message };
  }, [searchParams]);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { canSubmit, secondsRemaining, startCooldown, startCooldownFromRetryAfter } =
    useFormRateLimit(CONTACT_COOLDOWN_MS);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || isSending) return;

    const formData = new FormData(e.currentTarget);

    if (formData.get(HONEYPOT_FIELD)) {
      // Bot: report success without sending anything so it learns nothing.
      setIsSubmitted(true);
      return;
    }

    const parsed = contactFormSchema.safeParse({
      name: formData.get('user_name'),
      email: formData.get('user_email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    });
    if (!parsed.success) {
      toast.error(firstContactError(parsed.error));
      return;
    }

    setIsSending(true);
    try {
      // The backend is the single source of truth: only a successful response counts as sent.
      const response = await post(ApiPaths.public.contact, parsed.data);
      if (response?.success === false) throw response;
      setIsSubmitted(true);
      toast.success('Message sent successfully!');
      startCooldown();
    } catch (caught: unknown) {
      const rateLimit = apiRateLimit(caught);
      if (rateLimit) {
        toast.error(rateLimit.message || 'Too many attempts. Please try again later.');
        if (rateLimit.retryAfterSeconds) startCooldownFromRetryAfter(rateLimit.retryAfterSeconds);
        else startCooldown();
      } else {
        toast.error(apiErrorMessage(caught, SEND_FAILED_MESSAGE));
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <PageTemplate title="Get in touch">
      <div className="grid lg:grid-cols-2 gap-20">
        {/* Contact Form */}
        <div>
          {!isSubmitted ? (
            <form key={searchParams.toString()} onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label htmlFor="name" className="text-sm uppercase tracking-widest text-neutral-400 font-semibold">Your Name</label>
                  <input
                    id="name"
                    name="user_name"
                    type="text"
                    required
                    maxLength={CONTACT_LIMITS.name}
                    autoComplete="name"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-5 bg-neutral-50 rounded-2xl text-black text-sm border border-neutral-100 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-4">
                  <label htmlFor="email" className="text-sm uppercase tracking-widest text-neutral-400 font-semibold">Email Address</label>
                  <input
                    id="email"
                    name="user_email"
                    type="email"
                    required
                    maxLength={CONTACT_LIMITS.email}
                    autoComplete="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-5 bg-neutral-50 rounded-2xl text-black text-sm border border-neutral-100 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label htmlFor="subject" className="text-sm uppercase tracking-widest text-neutral-400 font-semibold">Subject</label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  maxLength={CONTACT_LIMITS.subject}
                  placeholder="What is this about?"
                  defaultValue={prefilled.subject}
                  className="w-full px-4 py-5 bg-neutral-50 rounded-2xl text-black text-sm border border-neutral-100 focus:border-black focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-4">
                <label htmlFor="message" className="text-sm uppercase tracking-widest text-neutral-400 font-semibold">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={CONTACT_LIMITS.message}
                  rows={6}
                  placeholder="How can we help you?"
                  defaultValue={prefilled.message}
                  className="w-full px-4 py-5 bg-neutral-50 rounded-2xl text-black text-sm border border-neutral-100 focus:border-black focus:outline-none transition-colors resize-none"
                />
              </div>

              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
                <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <button
                type="submit"
                disabled={isSending || !canSubmit}
                className="group flex items-center justify-center gap-4 w-full py-5 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all hover:scale-[1.02] shadow-xl shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Sending...' : !canSubmit ? `Try again in ${secondsRemaining}s` : 'Send Message'}
                <Send className={`w-4 h-4 transition-transform ${!isSending ? 'group-hover:translate-x-1 group-hover:-translate-y-1' : ''}`} />
              </button>
            </form>
          ) : (
            <div className="bg-neutral-50 rounded-[3rem] p-12 lg:p-20 text-center animate-fade-in">
              <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-8 animate-slide-up">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-3xl lg:text-4xl text-black mb-4">Message received.</h3>
              <p className="text-neutral-500 font-light leading-relaxed">
                Thank you for reaching out. Support hours are Mon-Fri 09:00-17:00.
              </p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="mt-12 text-sm font-semibold underline underline-offset-8 decoration-neutral-200 hover:decoration-black transition-colors"
              >
                Send another message
              </button>
            </div>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-16">
          <div className="space-y-4 max-w-sm">
            <h2 className="font-serif text-4xl text-black mb-8 leading-tight">We're here for <br /><span className="italic">every connection.</span></h2>
            <p className="text-neutral-500 font-light leading-relaxed text-lg">
              Whether you're a professional looking to join or a client seeking a specific skill, we are always ready to assist.
            </p>
          </div>

          <div className="grid gap-10">
            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white group-hover:border-black">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-xl text-black mb-1">Registered office</h4>
                <CorporateLegalAddress
                  showCompanyName
                  className="text-neutral-500 font-light"
                />
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white group-hover:border-black">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-xl text-black mb-1">Inquiries</h4>
                <p className="text-neutral-500 font-light">
                  <a href="mailto:services@skillance.co.za" className="hover:text-black transition-colors">services@skillance.co.za</a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white group-hover:border-black">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-xl text-black mb-1">Support</h4>
                <p className="text-neutral-500 font-light">
                  <a
                    href="https://wa.me/27648728174"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition-colors"
                  >
                    +27 64 872 8174 (WhatsApp)
                  </a>
                  <br />
                  (Mon-Fri, 9am - 5pm)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default ContactPage;
