import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const BackgroundBlobs = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blobs = containerRef.current?.querySelectorAll('.blob');
    if (!blobs) return;

    blobs.forEach((blob, index) => {
      gsap.to(blob, {
        x: `random(-50, 50)`,
        y: `random(-50, 50)`,
        scale: `random(0.9, 1.1)`,
        duration: 10 + index * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    return () => {
      blobs.forEach((blob) => {
        gsap.killTweensOf(blob);
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Blob 1 - Top Left */}
      <div
        className="blob absolute -top-20 -left-20 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: '0s' }}
      />
      
      {/* Blob 2 - Top Right */}
      <div
        className="blob absolute top-40 -right-20 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: '5s' }}
      />
      
      {/* Blob 3 - Center Left */}
      <div
        className="blob absolute top-1/2 -left-40 w-72 h-72 bg-teal-300/20 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: '10s' }}
      />
      
      {/* Blob 4 - Bottom Right */}
      <div
        className="blob absolute bottom-20 right-10 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: '15s' }}
      />
      
      {/* Blob 5 - Bottom Left */}
      <div
        className="blob absolute -bottom-20 left-1/4 w-64 h-64 bg-teal-100/40 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: '8s' }}
      />
    </div>
  );
};

export default BackgroundBlobs;
