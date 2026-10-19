import { useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Minus } from 'lucide-react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { revealFromTo } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface FAQItem {
  question: string;
  answer: ReactNode;
}

const faqItems: FAQItem[] = [
  {
    question: 'How does Skillance check providers?',
    answer:
      "Before a provider can take bookings, we check their identity document and match it to their profile photo. We don't check trade qualifications or references, so each provider's reviews from customers are an important guide. For work that legally needs a certificate (such as an electrical COC), confirm this with the provider before you book.",
  },
  {
    question: 'What happens if I am not satisfied with a service?',
    answer: 'Your satisfaction is our priority. If you are not happy with a service, contact our support team within 48 hours. We will work with you and the professional to resolve the issue. In eligible cases, we offer refunds or rebooking options.',
  },
  {
    question: 'How do payments work?',
    answer: "Payments aren't live yet. We'll explain exactly how paying works here before bookings open.",
  },
  {
    question: 'Can I cancel or reschedule a booking?',
    answer: 'Yes, you can cancel or reschedule bookings through the app. Cancellations made more than 24 hours before the scheduled time receive a full refund. For cancellations within 24 hours, please check the specific cancellation policy for that service.',
  },
  {
    question: 'What areas does Skillance cover?',
    answer: "We're starting in one area. Tell us your area and we'll let you know if we reach you.",
  },
  {
    question: 'How do I become a provider?',
    answer:
      'Register as a provider, upload your identity document and a clear profile photo, and choose your service categories. Once your ID check is approved, you can start taking bookings. The Skillance app for iOS and Android is coming soon.',
  },
];

const FAQ = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealFromTo('.faq-content', '.faq-content', reducedMotion);
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="py-32 lg:py-40 bg-neutral-900 text-white"
    >
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="faq-content">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-neutral-500 mb-6">
              FAQ
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.1]">
              Questions?{' '}
              <span className="italic">We have answers.</span>
            </h2>
          </div>

          {/* FAQ Items */}
          <div className="space-y-0">
            {faqItems.map((item, index) => (
              <div 
                key={index}
                className="border-t border-neutral-800"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full py-6 flex items-center justify-between text-left group"
                >
                  <span className="font-serif text-xl sm:text-2xl pr-8 group-hover:text-neutral-300 transition-colors">
                    {item.question}
                  </span>
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border border-neutral-700 flex items-center justify-center group-hover:border-neutral-500 transition-colors">
                    {openIndex === index ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </span>
                </button>
                <div 
                  className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                    openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="text-neutral-400 leading-relaxed pr-12">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
            <div className="border-t border-neutral-800" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
