import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { BEYOND_EMAIL } from '@/beyond/content';
import { trackBeyond } from '@/beyond/analytics';

type CopyEmailButtonProps = {
  ctaLocation: string;
  variant?: 'solid' | 'light' | 'ghost';
};

export default function CopyEmailButton({ ctaLocation, variant = 'ghost' }: CopyEmailButtonProps) {
  const className =
    variant === 'light'
      ? 'by-btn by-btn-light by-btn-copy'
      : variant === 'solid'
        ? 'by-btn by-btn-copy'
        : 'by-btn by-btn-ghost by-btn-copy';

  const onCopy = async () => {
    trackBeyond('beyond_copy_email', { beyond_cta_location: ctaLocation });
    try {
      await navigator.clipboard.writeText(BEYOND_EMAIL);
      toast.success('Email address copied');
    } catch {
      toast.error('Could not copy. Use the address on screen.');
    }
  };

  return (
    <button type="button" className={className} onClick={onCopy}>
      <Copy className="by-btn-icon" aria-hidden="true" />
      Copy email
    </button>
  );
}
