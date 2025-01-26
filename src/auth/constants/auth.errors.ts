export const AuthErrors = {
  USER_VERIFICATION_FAILED: 'Error verifying user',
  INVALID_ROLE: 'Invalid role',
  USER_CREATION_FAILED: 'User creation failed',
  USER_NOT_FOUND: 'User not found',
  JWT_SECRET_UNDEFINED: 'JWT secret is not defined',
  ENV_VARIABLE_UNDEFINED: 'is not defined in the environment variables',
  PASSWORD_COMPARISON_FAILED: 'Password comparison failed',
  VERIFICATION_FAILED: 'Verification failed',
} as const;
