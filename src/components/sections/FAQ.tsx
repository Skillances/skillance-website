import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Minus } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: 'How does Skillance verify professionals?',
    answer: 'Every professional on our platform undergoes a thorough verification process including identity verification, background checks, and skill assessment. We verify their qualifications, check references, and ensure they meet our quality standards before they can offer services.',
  },
  {
    question: 'What happens if I am not satisfied with a service?',
    answer: 'Your satisfaction is our priority. If you are not happy with a service, contact our support team within 48 hours. We will work with you and the professional to resolve the issue. In eligible cases, we offer refunds or rebooking options.',
  },
  {
    question: 'How do payments work?',
    answer: 'Payments are processed securely through our platform. When you book a service, the payment is held securely until the service is completed. Once you confirm satisfaction, the payment is released to the professional. This ensures both parties are protected.',
  },
  {
    question: 'Can I cancel or reschedule a booking?',
    answer: 'Yes, you can cancel or reschedule bookings through the app. Cancellations made more than 24 hours before the scheduled time receive a full refund. For cancellations within 24 hours, please check the specific cancellation policy for that service.',
  },
  {
    question: 'What areas does Skillance cover?',
    answer: 'Currently, Skillance operates in major cities across South Africa including Cape Town, Johannesburg, Pretoria, and Durban. We are rapidly expanding to more locations. Sign up for notifications to be informed when we launch in your area.',
  },
  {
    question: 'How do I become a Skillancer?',
    answer: 'To join as a Skillancer, download our app and complete the registration process. You will need to provide proof of identity, relevant qualifications or experience, and pass our background check. Once approved, you can start offering your services.',
  },
];

const FAQ = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.faq-content',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.faq-content',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

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
                  className={`overflow-hidden transition-all duration-500 ease-out ${
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
