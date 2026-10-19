/** Checkbox sentence. Hashed as wording for consent_type id_biometric. */
export const ID_BIOMETRIC_TEXT =
  'I agree that Skillance may check my ID and selfie to make sure it is really me. A Skillance staff member compares my face with my ID photo. My face photo is biometric information.';

export const ID_BIOMETRIC_VERSION = 'id_biometric_v1.0_en';

export const ID_BIOMETRIC_NOTICE: { heading: string; body: string }[] = [
  {
    heading: 'What we collect',
    body: 'Your ID number. A photo of your ID book, ID card, passport or permit (front and back). A selfie photo. We do not use a computer face-matching tool. A person compares the photos.',
  },
  {
    heading: 'Why',
    body: 'To check that you are a real person. To check that your face matches your ID and your profile photo. To keep clients safe and stop fake accounts. We use it only for this. We do not sell it. We do not use it for marketing.',
  },
  {
    heading: 'Who works with it',
    body: 'Skillance (Rimitso Management Services (Pty) Ltd). A small group of named Skillance admin staff. Our cloud host stores the files for us under a written contract, in South Africa. We do not send your ID or selfie to any verification company. Your ID number is checked for the correct format. It is not checked with Home Affairs.',
  },
  {
    heading: 'How long we keep it',
    body: 'ID photos and selfie: deleted within 30 days after we decide. We keep only the result: "verified" or "not verified", the date and a reference number.',
  },
  {
    heading: 'Your rights',
    body: 'You can ask to see your information. You can ask us to fix or delete it. You can object or complain to the Information Regulator (inforegulator.org.za). If we cannot match you, we tell you why. You can send new photos or tell us your side.',
  },
  {
    heading: 'If you say no',
    body: 'You cannot be verified. This means you cannot take bookings on Skillance. You can still keep a client account.',
  },
  {
    heading: 'Changing your mind',
    body: 'You can withdraw this consent at any time. We will then delete your ID images that we still have, and remove your verified status. You will not be able to take bookings. Withdrawing does not undo checks we already did.',
  },
];

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function idBiometricConsentBody(action: 'granted' | 'withdrawn') {
  return {
    consent_type: 'id_biometric' as const,
    action,
    wording_version: ID_BIOMETRIC_VERSION,
    text_hash: await sha256Hex(ID_BIOMETRIC_TEXT),
    language: 'en' as const,
    channel: 'web' as const,
  };
}
