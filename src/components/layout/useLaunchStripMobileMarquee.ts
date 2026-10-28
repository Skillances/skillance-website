import { useEffect, useState } from 'react';

export const LAUNCH_STRIP_MOBILE_MARQUEE_QUERY = '(max-width: 767px)';

export function useLaunchStripMobileMarquee(): boolean {
  const [mobileMarquee, setMobileMarquee] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(LAUNCH_STRIP_MOBILE_MARQUEE_QUERY);
    const update = () => setMobileMarquee(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return mobileMarquee;
}
