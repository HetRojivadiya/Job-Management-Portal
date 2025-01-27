export const AuthRoutes = {
  BASE: 'auth',
  SIGNUP: 'signup',
  LOGIN: 'login',
  VERIFY: 'verify/:token',
  ENABLE_2FA: 'enable-2fa',
  VERIFY_OPT: 'verify-opt',
  ADMIN: 'admin',
  CANDIDATE: 'candidate',
} as const;
