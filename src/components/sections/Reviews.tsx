import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { get, post } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';
import { useFormRateLimit } from '@/hooks/useFormRateLimit';
import { toast } from 'sonner';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { revealFromTo } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface Review {
  id: string;
  name: string;
  role: 'client' | 'skillancer';
  rating: number;
  comment: string;
  isAnonymous: boolean;
  location: string;
  createdAt: string;
}

const Reviews = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  
  const [userRole, setUserRole] = useState<'client' | 'skillancer'>('client');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { canSubmit, secondsRemaining, startCooldown, startCooldownFromRetryAfter } = useFormRateLimit(60_000);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    get(ApiPaths.public.reviews)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setReviews(res.data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealFromTo('.reviews-content', '.reviews-content', reducedMotion);
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0 && comment && location && canSubmit) {
      setIsSubmitting(true);
      try {
        await post(ApiPaths.public.reviews, {
          name: isAnonymous ? 'Anonymous' : name || 'Valued User',
          role: userRole,
          rating,
          comment,
          isAnonymous,
          location,
        });

        setIsSubmitted(true);
        startCooldown();

        setTimeout(() => {
          setIsSubmitted(false);
          setRating(0);
          setName('');
          setLocation('');
          setComment('');
          setIsAnonymous(false);
        }, 3000);
      } catch (err: any) {
        if (err?.statusCode === 429 || err?.retryAfter) {
          toast.error(err?.message || 'Too many attempts. Please try again later.');
          if (err?.retryAfter) startCooldownFromRetryAfter(err.retryAfter);
          else startCooldown();
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="py-32 lg:py-40 bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="reviews-content">
          {/* Section Header */}
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-neutral-500 mb-6">
              Reviews
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-black leading-[1.1] mb-6">
              Share your{' '}
              <span className="italic">experience.</span>
            </h2>
          </div>

          <div className={`${reviews.length === 0 ? 'max-w-2xl mx-auto' : 'grid lg:grid-cols-2 gap-12 lg:gap-16'}`}>
            {/* Review Form */}
            <div className={`bg-neutral-50 rounded-3xl p-8 md:p-10 ${reviews.length === 0 ? 'w-full' : ''}`}>
              <h3 className={`font-serif text-2xl text-black mb-6 ${reviews.length === 0 ? 'text-center' : ''}`}>Write a Review</h3>
              
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="font-serif text-xl text-black mb-2">Thank you!</h4>
                  <p className="text-neutral-600">Your review has been submitted.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={`space-y-6 ${reviews.length === 0 ? 'max-w-md mx-auto' : ''}`}>
                  {/* Role Selection */}
                  <div className={`${reviews.length === 0 ? 'text-center' : ''}`}>
                    <label className="block text-sm font-medium text-neutral-700 mb-3">
                      I used Skillance as a
                    </label>
                    <div className="flex gap-3">
                      {(['client', 'skillancer'] as const).map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setUserRole(role)}
                          className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium motion-ui motion-press ${
                            userRole === role
                              ? 'border-black bg-black text-white'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className={`${reviews.length === 0 ? 'flex flex-col items-center' : ''}`}>
                    <label className={`block text-sm font-medium text-neutral-700 mb-3 ${reviews.length === 0 ? 'text-center' : ''}`}>
                      Your Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="w-10 h-10 flex items-center justify-center transition-transform hover:scale-110"
                          aria-label={`Rate ${star} stars`}
                        >
                          <svg 
                            className={`w-8 h-8 transition-colors ${
                              star <= (hoverRating || rating)
                                ? 'fill-black text-black'
                                : 'fill-neutral-200 text-neutral-200'
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className={`block text-sm font-medium text-neutral-700 mb-2 ${reviews.length === 0 ? 'text-center' : ''}`}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Cape Town, Johannesburg"
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  {/* Anonymous Toggle */}
                  <div className={`flex items-center gap-3 ${reviews.length === 0 ? 'justify-center' : ''}`}>
                    <button
                      type="button"
                      onClick={() => setIsAnonymous(!isAnonymous)}
                      className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isAnonymous ? 'bg-black border-black' : 'border-neutral-300'
                      }`}
                      aria-label={isAnonymous ? 'Post anonymously (on)' : 'Post anonymously (off)'}
                    >
                      {isAnonymous && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <span className="text-sm text-neutral-600">Post anonymously</span>
                  </div>

                  {/* Name (if not anonymous) */}
                  {!isAnonymous && (
                    <div>
                      <label className={`block text-sm font-medium text-neutral-700 mb-2 ${reviews.length === 0 ? 'text-center' : ''}`}>
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {/* Comment */}
                  <div>
                    <label className={`block text-sm font-medium text-neutral-700 mb-2 ${reviews.length === 0 ? 'text-center' : ''}`}>
                      Your Review
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={rating === 0 || comment === '' || location === '' || isSubmitting || !canSubmit}
                    className="w-full bg-black text-white py-4 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : !canSubmit ? `Try again in ${secondsRemaining}s` : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>

            {/* Recent Reviews */}
            {reviews.length > 0 && (
              <div>
                <h3 className="font-serif text-2xl text-black mb-6">Recent Reviews</h3>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-neutral-50 rounded-2xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-medium text-black">
                            {review.isAnonymous ? 'Anonymous' : review.name}
                          </p>
                          <p className="text-xs text-neutral-500 capitalize">{review.role} · {review.location} · {new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-0.5 mb-3">
                        {[...Array(review.rating)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 fill-black text-black" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      
                      <p className="text-neutral-600 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
