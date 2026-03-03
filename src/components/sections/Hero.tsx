import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';


gsap.registerPlugin(ScrollTrigger);

// Custom inline word rotate
const InlineWordRotate = ({ words }: { words: string[] }) => {
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [words]);
  
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={words[index]}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="italic"
        style={{ width: '100%', display: 'inline-block' }}
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax effect on hero image
      gsap.to(imageRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Text reveal animation
      gsap.fromTo(textRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          delay: 2, // Wait for loader to finish
        }
      );

      // Scroll Indicator Logic
      let idleTimeout: any;
      const indicator = document.querySelector('.scroll-indicator');
      
      const showIndicator = () => {
        const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
        if (!isAtBottom) {
          gsap.to(indicator, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
        }
      };

      const hideIndicator = () => {
        gsap.to(indicator, { opacity: 0, y: 20, duration: 0.5, ease: 'power3.in' });
        clearTimeout(idleTimeout);
        idleTimeout = setTimeout(showIndicator, 3000); // Appear after 3s of idle
      };

      window.addEventListener('scroll', hideIndicator);
      idleTimeout = setTimeout(showIndicator, 4000); // Initial appearance

      return () => {
        window.removeEventListener('scroll', hideIndicator);
        clearTimeout(idleTimeout);
      };
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <div 
        ref={imageRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
      >
        <picture className="w-full h-full block">
          <source 
            media="(max-width: 1023px)" 
            srcSet="/hero-image-portrait.jpg" 
          />
          <img
            src="/hero-image.jpg"
            alt="Skillance"
            className="w-full h-full object-cover"
          />
        </picture>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content - Minimal like Hinge */}
      <div 
        ref={textRef}
        className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6"
      >
        <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white leading-[1.1] max-w-4xl flex flex-col items-center">
          <div className="flex items-baseline">
            <span>The</span>
            <span style={{ width: '9ch' }}>
              <InlineWordRotate words={['marketplace', 'platform', 'community', 'network', 'ecosystem']} />
            </span>
          </div>
          <span className="italic mt-4">designed for trust.</span>
        </h1>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 z-10 opacity-0 transform translate-y-5">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-white/50">Scroll</span>
          <div className="w-px h-12 bg-white/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-4 bg-white animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};


export default Hero;
