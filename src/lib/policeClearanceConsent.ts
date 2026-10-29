import { sha256Hex } from '@/lib/idBiometricConsent';

/** Checkbox sentence. Hashed as wording for consent_type police_clearance. */
export const POLICE_CLEARANCE_TEXT =
  'I agree that Skillance may collect and check my police clearance certificate, and show clients a "police cleared" badge on my profile. A police clearance certificate is information about criminal behaviour.';

export const POLICE_CLEARANCE_VERSION = 'police_clearance_v1.0_en';

export const POLICE_CLEARANCE_NOTICE: { heading: string; body: string }[] = [
  {
    heading: 'What we collect',
    body: 'The image of your police clearance certificate. Its status (pending, verified or not verified) and its dates.',
  },
  {
    heading: 'Why',
    body: 'To show clients a "police cleared" badge on your profile. To help keep clients safe. We use it only for this. We do not sell it. We do not use it for marketing.',
  },
  {
    heading: 'Who sees it',
    body: 'A small group of named Skillance admin staff (Rimitso Management Services (Pty) Ltd). The public sees only the badge. The public never sees your document.',
  },
  {
    heading: 'How long we keep it',
    body: 'The document is deleted within 30 days after we decide. We keep only the status, the date and the expiry date.',
  },
  {
    heading: 'Your rights',
    body: 'You can ask to see your information. You can ask us to fix or delete it. You can object. You can complain to the Information Regulator (inforegulator.org.za).',
  },
  {
    heading: 'If you say no',
    body: 'You get no police cleared badge. You can still work on Skillance, unless a category you want requires police clearance.',
  },
  {
    heading: 'Changing your mind',
    body: 'You can withdraw this consent at any time. We will then delete your document and remove your badge now. Withdrawing does not undo processing we already did.',
  },
];

export async function policeClearanceConsentBody(action: 'granted' | 'withdrawn') {
  return {
    consent_type: 'police_clearance' as const,
    action,
    wording_version: POLICE_CLEARANCE_VERSION,
    text_hash: await sha256Hex(POLICE_CLEARANCE_TEXT),
    language: 'en' as const,
    channel: 'web' as const,
  };
}
