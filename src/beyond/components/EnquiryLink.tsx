import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { trackBeyond } from '@/beyond/analytics';
import { ENQUIRY_MAILTO } from '@/beyond/content';

type EnquiryLinkProps = {
  /** Where on the page this control sits, for the dataLayer event. */
  ctaLocation: string;
  /** mailto opens the visitor's email app. contact navigates to /beyond/contact. */
  mode?: 'mailto' | 'contact';
  variant?: 'solid' | 'light' | 'ghost' | 'text';
  children: ReactNode;
};

const VARIANT = {
  solid: 'by-btn',
  light: 'by-btn by-btn-light',
  ghost: 'by-btn by-btn-ghost',
  text: 'by-textlink',
} as const;

/**
 * Enquiry control. The mailto path does not submit anything to Skillance.
 * TODO(beyond): Replace mailto with a form only after a backend endpoint and a POPIA notice exist.
 */
export default function EnquiryLink({ ctaLocation, mode = 'mailto', variant = 'solid', children }: EnquiryLinkProps) {
  const className = VARIANT[variant];
  const onClick = () => {
    trackBeyond('beyond_enquiry_click', {
      beyond_cta_location: ctaLocation,
      beyond_cta_type: mode,
    });
  };

  if (mode === 'contact') {
    return (
      <Link to="/beyond/contact" className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <a className={className} href={ENQUIRY_MAILTO} onClick={onClick}>
      {children}
    </a>
  );
}
