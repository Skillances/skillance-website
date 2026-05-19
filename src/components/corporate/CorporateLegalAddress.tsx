import {
  CORPORATE_LEGAL_ADDRESS_LINES,
  CORPORATE_LEGAL_ADDRESS_ONE_LINE,
  CORPORATE_LEGAL_NAME,
} from '../../constants/corporate';

type CorporateLegalAddressProps = {
  showCompanyName?: boolean;
  className?: string;
  lineClassName?: string;
};

/** Multi-line registered office address for RMS / Skillance legal pages. */
export function CorporateLegalAddress({
  showCompanyName = false,
  className = '',
  lineClassName = '',
}: CorporateLegalAddressProps) {
  return (
    <address className={`not-italic ${className}`.trim()}>
      {showCompanyName ? (
        <span className={`block font-medium text-black ${lineClassName}`.trim()}>
          {CORPORATE_LEGAL_NAME}
        </span>
      ) : null}
      {CORPORATE_LEGAL_ADDRESS_LINES.map((line) => (
        <span key={line} className={`block ${lineClassName}`.trim()}>
          {line}
        </span>
      ))}
    </address>
  );
}

/** Single-line registered address for inline legal copy. */
export function CorporateLegalAddressInline({
  className = '',
}: {
  className?: string;
}) {
  return <span className={className}>{CORPORATE_LEGAL_ADDRESS_ONE_LINE}</span>;
}
