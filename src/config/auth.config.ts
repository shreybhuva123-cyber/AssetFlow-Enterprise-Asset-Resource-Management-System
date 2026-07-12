export const authConfig = {
  session: {
    cookieName: 'assetflow-session',
    maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },

  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: true,
  },

  rateLimit: {
    loginMaxAttempts: 5,
    loginWindowMs: 15 * 60 * 1000,      // 15 minutes
    passwordResetMaxAttempts: 3,
    passwordResetWindowMs: 60 * 60 * 1000, // 1 hour
    apiMaxRequestsPerMinute: 60,
  },

  token: {
    accessTokenExpirySeconds: 3_600,    // 1 hour
    refreshTokenExpirySeconds: 604_800, // 7 days
  },

  redirects: {
    afterLogin: '/dashboard',
    afterLogout: '/login',
    afterRegister: '/onboarding',
    loginPage: '/login',
    unauthorizedPage: '/unauthorized',
  },

  providers: {
    emailPassword: true,
    magicLink: false,
    oauth: {
      google: false,
      github: false,
    },
  },

  mfa: {
    enabled: false,
    totpIssuer: 'AssetFlow',
  },
} as const;

export type AuthConfig = typeof authConfig;
