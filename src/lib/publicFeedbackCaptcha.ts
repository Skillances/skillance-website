/**
 * Bot check for any remaining public feedback POST (AC-D).
 *
 * The homepage review form is removed (D7 default on this draft), so nothing
 * on the marketing site posts feedback. If a public POST is added later, it
 * must call `authorizePublicFeedbackPost` and must not send the request when
 * `allowed` is false.
 *
 * Site keys are build-time env only. This module does not create a vendor
 * account and does not enable CAPTCHA in production by itself.
 * `VITE_TURNSTILE_SITE_KEY` wins when both are set. With neither key, or
 * without a token, the decision is fail closed.
 */

export type CaptchaProvider = 'turnstile' | 'hcaptcha';

export type CaptchaEnv = {
  VITE_TURNSTILE_SITE_KEY?: string;
  VITE_HCAPTCHA_SITE_KEY?: string;
};

export type PublicFeedbackDecision = {
  allowed: boolean;
  reason: 'missing_captcha_config' | 'missing_token' | 'ok';
  provider: CaptchaProvider | null;
};

export function captchaSiteConfig(env: CaptchaEnv): { provider: CaptchaProvider; siteKey: string } | null {
  const turnstile = env.VITE_TURNSTILE_SITE_KEY?.trim();
  if (turnstile) return { provider: 'turnstile', siteKey: turnstile };
  const hcaptcha = env.VITE_HCAPTCHA_SITE_KEY?.trim();
  if (hcaptcha) return { provider: 'hcaptcha', siteKey: hcaptcha };
  return null;
}

export function authorizePublicFeedbackPost(token: string | null | undefined, env: CaptchaEnv): PublicFeedbackDecision {
  const config = captchaSiteConfig(env);
  if (!config) return { allowed: false, reason: 'missing_captcha_config', provider: null };
  if (!token?.trim()) return { allowed: false, reason: 'missing_token', provider: config.provider };
  return { allowed: true, reason: 'ok', provider: config.provider };
}

/** Reads Vite env. Tests should pass an explicit env into the functions above. */
export function authorizePublicFeedbackFromRuntime(token: string | null | undefined): PublicFeedbackDecision {
  const env = import.meta.env as CaptchaEnv;
  return authorizePublicFeedbackPost(token, {
    VITE_TURNSTILE_SITE_KEY: env.VITE_TURNSTILE_SITE_KEY,
    VITE_HCAPTCHA_SITE_KEY: env.VITE_HCAPTCHA_SITE_KEY,
  });
}
