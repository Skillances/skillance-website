import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { NAV } from '@/beyond/content';
import ExperienceSwitcher from '@/components/experience/ExperienceSwitcher';

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, '');
  if (!id) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tries = 0;
  const run = () => {
    const el = document.getElementById(id);
    if (!el && tries < 8) {
      tries += 1;
      window.requestAnimationFrame(run);
      return;
    }
    el?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };
  run();
}

export default function Header() {
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const menuId = useId();
  const { pathname, hash } = useLocation();
  const open = menuPath === pathname;

  const closeMenu = () => {
    restoreFocus.current = true;
    setMenuPath(null);
  };

  useEffect(() => {
    if (hash) scrollToHash(hash);
  }, [pathname, hash]);

  useEffect(() => {
    if (!open) {
      if (restoreFocus.current) {
        menuBtnRef.current?.focus();
        restoreFocus.current = false;
      }
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    const focusables = () =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')) : [];
    focusables()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        restoreFocus.current = true;
        setMenuPath(null);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1080px)');
    const onChange = () => {
      if (desktop.matches) setMenuPath(null);
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  return (
    <header className="by-header">
      <div className="by-wrap by-header-inner">
        <Link to="/beyond" className="by-brand" aria-label="Skillance Beyond the App, overview">
          <img src="/skillance-tiny-logo-black.png" alt="" width={120} height={24} />
          <span className="by-brand-name">Skillance</span>
          <span className="by-brand-rule" aria-hidden="true" />
          <span className="by-brand-beyond">Beyond</span>
        </Link>

        <nav className="by-nav" aria-label="Beyond the App">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="by-nav-link">
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="by-header-actions">
          <ExperienceSwitcher appearance="studio" />
          <button
            type="button"
            className="by-menu-btn"
            ref={menuBtnRef}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setMenuPath(pathname)}
          >
            <span className="by-sr">Open menu</span>
            <span className="by-burger" aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <div className="by-menu" id={menuId} role="dialog" aria-modal="true" aria-label="Beyond the App menu" ref={panelRef}>
          <div className="by-menu-top">
            <button type="button" className="by-menu-close" onClick={closeMenu}>
              Close
            </button>
          </div>
          <ExperienceSwitcher appearance="studio" />
          <nav aria-label="Beyond the App">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
