import { useState } from 'react';
import PageTemplate from '../components/layout/PageTemplate';
import { Send, MapPin, Mail, Phone } from 'lucide-react';

const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <PageTemplate title="Get in touch">
      <div className="grid lg:grid-cols-2 gap-20">
        {/* Contact Form */}
        <div>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label htmlFor="name" className="text-sm uppercase tracking-widest text-neutral-400 font-semibold">Your Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full px-8 py-5 bg-neutral-50 rounded-2xl text-black border border-neutral-100 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-4">
                  <label htmlFor="email" className="text-sm uppercase tracking-widest text-neutral-400 font-semibold">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="w-full px-8 py-5 bg-neutral-50 rounded-2xl text-black border border-neutral-100 focus:border-black focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label htmlFor="subject" className="text-sm uppercase tracking-widest text-neutral-400 font-semibold">Subject</label>
                <input
                  id="subject"
                  type="text"
                  required
                  placeholder="What is this about?"
                  className="w-full px-8 py-5 bg-neutral-50 rounded-2xl text-black border border-neutral-100 focus:border-black focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-4">
                <label htmlFor="message" className="text-sm uppercase tracking-widest text-neutral-400 font-semibold">Message</label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  placeholder="How can we help you?"
                  className="w-full px-8 py-5 bg-neutral-50 rounded-2xl text-black border border-neutral-100 focus:border-black focus:outline-none transition-colors resize-none"
                />
              </div>

              <button
                type="submit"
                className="group flex items-center justify-center gap-4 w-full py-5 bg-black text-white rounded-full text-sm font-semibold hover:bg-neutral-800 transition-all hover:scale-[1.02] shadow-xl shadow-black/10"
              >
                Send Message
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>
            </form>
          ) : (
            <div className="bg-neutral-50 rounded-[3rem] p-12 lg:p-20 text-center animate-fade-in">
              <div className="w-20 h-20 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-8 animate-slide-up">
                <Send className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-3xl lg:text-4xl text-black mb-4">Message received.</h3>
              <p className="text-neutral-500 font-light leading-relaxed">
                Thank you for reaching out. A specialist from our team will evaluate your request and respond within 24 hours.
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
                <h4 className="font-serif text-xl text-black mb-1">Our Studio</h4>
                <p className="text-neutral-500 font-light">Cape Town, South Africa <br /> 8001, Central Area</p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white group-hover:border-black">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-xl text-black mb-1">Inquiries</h4>
                <p className="text-neutral-500 font-light">hello@skillance.co.za <br /> support@skillance.co.za</p>
              </div>
            </div>

            <div className="flex items-start gap-6 group">
              <div className="w-14 h-14 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white group-hover:border-black">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-xl text-black mb-1">Support</h4>
                <p className="text-neutral-500 font-light">+27 21 000 0000 <br /> (Mon-Fri, 9am - 5pm)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
};

export default ContactPage;
