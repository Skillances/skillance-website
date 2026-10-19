import { Link, useLocation } from 'react-router-dom';
import { isBeyondPath } from '@/lib/beyond/routes';
import './experience-switch.css';

type Appearance = 'quiet-dark' | 'quiet-light' | 'studio';
type Density = 'compact' | 'comfortable';

/**
 * Moves between the marketplace and Beyond the App.
 *
 * The choice is the URL. There is no cookie and no localStorage entry.
 * An older site stored `skillance-active-section` and swapped both experiences
 * onto the same paths. These two experiences now have their own routes.
 */
export default function ExperienceSwitcher({
  appearance,
  density = 'compact',
}: {
  appearance: Appearance;
  density?: Density;
}) {
  const { pathname } = useLocation();
  const beyond = isBeyondPath(pathname);
  const studio = appearance === 'studio';

  const options = [
    {
      href: '/',
      label: 'Marketplace',
      name: 'Skillance marketplace',
      current: !beyond,
    },
    {
      href: '/beyond',
      label: studio || beyond ? 'Beyond the App' : 'Beyond',
      name: 'Beyond the App',
      current: beyond,
    },
  ] as const;

  const className = studio
    ? 'by-switch'
    : [
        'experience-switch',
        appearance === 'quiet-dark' ? 'experience-switch-dark' : 'experience-switch-light',
        density === 'comfortable' ? 'experience-switch-comfortable' : '',
      ]
        .filter(Boolean)
        .join(' ');

  return (
    <nav aria-label="Skillance experiences" className={className}>
      {options.map((option) => (
        <Link
          key={option.href}
          to={option.href}
          className={studio ? 'by-switch-link' : undefined}
          aria-current={option.current ? 'true' : undefined}
          aria-label={option.name}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
}
