import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { EASE_OUT } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const InlineWordRotate = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion || paused) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [words, reducedMotion, paused]);

  useEffect(() => {
    if (reducedMotion) return;
    const hero = document.getElementById('home');
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <span className="italic text-center w-full block">{words[0]}</span>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        initial={{ opacity: 0, transform: 'translateY(6px)' }}
        animate={{ opacity: 1, transform: 'translateY(0)' }}
        exit={{ opacity: 0, transform: 'translateY(-4px)' }}
        transition={{ duration: 0.28, ease: EASE_OUT }}
        className="italic text-center w-full block"
      >
        {words[index]}
      </motion.span>
    </AnimatePresence>
  );
};

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!reducedMotion && imageRef.current) {
        gsap.to(imageRef.current, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: reducedMotion ? 0.2 : 0.7,
            ease: 'power3.out',
            delay: reducedMotion ? 0 : 0.15,
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden"
    >
      <div
        ref={imageRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
      >
        <picture className="w-full h-full block">
          <source
            media="(max-width: 1023px)"
            type="image/webp"
            srcSet="/hero-image-portrait.webp"
          />
          <source
            media="(max-width: 1023px)"
            srcSet="/hero-image-portrait.jpg"
          />
          <source type="image/webp" srcSet="/hero-image.webp" />
          <img
            src="/hero-image.jpg"
            alt="Skillance"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.35) 100%)',
          }}
        />
      </div>

      <div
        ref={textRef}
        className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6"
      >
        <h1 className="font-serif text-[2.5rem] sm:text-6xl lg:text-7xl xl:text-8xl text-white leading-[1.1] max-w-4xl flex flex-col items-center gap-2 sm:gap-3">
          <span>The</span>
          <span className="relative flex items-center justify-center min-w-[11ch] h-[1.2em]">
            <InlineWordRotate
              words={['marketplace', 'platform', 'community', 'network', 'ecosystem']}
            />
          </span>
          <span className="italic">designed for trust.</span>
        </h1>
        <Link
          to="/app"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-medium text-black hover:bg-white/90 transition-colors"
        >
          Open Skillance
        </Link>
      </div>
    </section>
  );
};

export default Hero;
