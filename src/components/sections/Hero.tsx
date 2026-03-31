import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';


gsap.registerPlugin(ScrollTrigger);

// Custom inline word rotates
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
            type="image/webp"
            srcSet="/hero-image-portrait.webp"
          />
          <source
            media="(max-width: 1023px)"
            srcSet="/hero-image-portrait.jpg"
          />
          <source
            type="image/webp"
            srcSet="/hero-image.webp"
          />
          <img
            src="/hero-image.jpg"
            alt="Skillance"
            width={1920}
            height={1080}
            className="w-full h-full object-cover"
          />
        </picture>
        {/* Multi-layer overlay for depth and text legibility */}
        <div className="absolute inset-0 bg-black/35" />
        {/* Bottom vignette — makes text pop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        {/* Subtle radial vignette at edges */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.35) 100%)' }} />
      </div>

      {/* Content - Minimal like Hinge */}
      <div 
        ref={textRef}
        className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6"
      >
        <h1 className="font-serif text-[2.5rem] sm:text-6xl lg:text-7xl xl:text-8xl text-white leading-[1.1] max-w-4xl flex flex-col items-center gap-2 sm:gap-3">
          <span>The</span>
          <span className="relative flex items-center justify-center min-w-[11ch] h-[1.2em]">
            <InlineWordRotate words={['marketplace', 'platform', 'community', 'network', 'ecosystem']} />
          </span>
          <span className="italic">designed for trust.</span>
        </h1>
      </div>
    </section>
  );
};


export default Hero;
