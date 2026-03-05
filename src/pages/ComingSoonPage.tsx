import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Smartphone, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoonPage = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log('Email submitted:', email);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-neutral-600 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-5xl lg:text-6xl font-serif text-black mb-6">
              Ready to find your <span className="text-blue-600">perfect match</span>?
            </h1>
            <p className="text-xl text-neutral-600 leading-relaxed max-w-2xl mx-auto">
              Join thousands who've discovered trusted local experts through Skillance. Be the first to know when we launch.
            </p>
          </motion.div>

          {/* Email Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl p-8 shadow-xl mb-12 max-w-md mx-auto"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 border border-neutral-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-full font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Notify Me
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </form>
          </motion.div>

          {/* App Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <p className="text-lg text-neutral-600 mb-8">
              Available for iOS and Android soon
            </p>

            {/* App Store Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-black text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-neutral-800 transition-colors cursor-not-allowed">
                <Smartphone className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs opacity-75">GET IT ON</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </div>

              <div className="bg-black text-white px-8 py-4 rounded-2xl flex items-center gap-3 hover:bg-neutral-800 transition-colors cursor-not-allowed">
                <Play className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs opacity-75">GET IT ON</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </div>
            </div>

            <p className="text-sm text-neutral-500 mt-4">
              Download on the App Store and Google Play Store
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;