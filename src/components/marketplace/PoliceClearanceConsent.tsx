import { useState } from 'react';
import { POLICE_CLEARANCE_NOTICE, POLICE_CLEARANCE_TEXT } from '@/lib/policeClearanceConsent';

/** Separate from the Terms checkbox. Unticked until the parent records a grant. */
export default function PoliceClearanceConsent({
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
          id="police-clearance-consent"
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-black"
        />
        <div className="text-[14px] leading-relaxed text-mk-text-primary">
          <label htmlFor="police-clearance-consent">{POLICE_CLEARANCE_TEXT}</label>{' '}
          <button
            type="button"
            className="underline underline-offset-4"
            aria-expanded={open}
            aria-controls="police-clearance-notice"
            onClick={() => setOpen((v) => !v)}
          >
            Learn more
          </button>
        </div>
      </div>
      {open && (
        <div id="police-clearance-notice" className="space-y-3 rounded-xl bg-mk-muted p-4 text-[13px] leading-relaxed text-mk-text-secondary">
          {POLICE_CLEARANCE_NOTICE.map((section) => (
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
