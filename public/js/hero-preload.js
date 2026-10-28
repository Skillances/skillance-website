// Starts the hero image download before the JS bundle runs. Same-origin file for the strict CSP.
// Keep the URLs and the 1023px breakpoint in step with Hero.tsx and BeyondHero.tsx.
(function () {
  var path = location.pathname.replace(/\/+$/, '') || '/';
  var mobile = window.matchMedia('(max-width: 1023px)').matches;
  var href = null;
  if (path === '/') {
    href = mobile ? '/hero-image-portrait.webp' : '/hero-image.webp';
  } else if (path === '/beyond') {
    href = mobile ? '/beyond/new/hero-cinematic-portrait.webp' : '/beyond/new/hero-cinematic.webp';
  }
  if (!href) return;
  var link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = href;
  link.setAttribute('fetchpriority', 'high');
  document.head.appendChild(link);
})();
