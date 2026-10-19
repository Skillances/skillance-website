import { useState } from 'react';
import { ID_BIOMETRIC_NOTICE, ID_BIOMETRIC_TEXT } from '@/lib/idBiometricConsent';

/** Separate from the Terms checkbox. Unticked until the parent records a grant. */
export default function IdBiometricConsent({
  checked,
  disabled,
  error,
  onCheckedChange,
}: {
  checked: boolean;
  disabled?: boolean;
  error?: string | null;
  onCheckedChange: (checked: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <input
          id="id-biometric-consent"
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-black"
        />
        <div className="text-[14px] leading-relaxed text-mk-text-primary">
          <label htmlFor="id-biometric-consent">{ID_BIOMETRIC_TEXT}</label>{' '}
          <button
            type="button"
            className="underline underline-offset-4"
            aria-expanded={open}
            aria-controls="id-biometric-notice"
            onClick={() => setOpen((v) => !v)}
          >
            Learn more
          </button>
        </div>
      </div>
      {open && (
        <div id="id-biometric-notice" className="space-y-3 rounded-xl bg-mk-muted p-4 text-[13px] leading-relaxed text-mk-text-secondary">
          {ID_BIOMETRIC_NOTICE.map((section) => (
            <p key={section.heading}>
              <span className="font-semibold text-mk-text-primary">{section.heading}:</span> {section.body}
            </p>
          ))}
        </div>
      )}
      {error && (
        <p role="alert" className="text-[13px] text-mk-error">
          {error}
        </p>
      )}
    </div>
  );
}
