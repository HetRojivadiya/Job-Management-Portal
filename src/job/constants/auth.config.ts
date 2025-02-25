
export class AuthConfig {

  static readonly ADMIN = 'Admin';
  static readonly CANDIDATE = 'Candidate';


  static readonly REQUIRED_ROLE = 'requiredRole';

  
  static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  static readonly JWT_EXPIRATION = '24h';

  
  static readonly ACCESS_TOKEN = 'ACCESS_TOKEN';
  static readonly REFRESH_TOKEN = 'REFRESH_TOKEN';
  static readonly EMAIL_VERIFICATION_TOKEN = 'EMAIL_VERIFICATION_TOKEN';
  static readonly PASSWORD_RESET_TOKEN = 'PASSWORD_RESET_TOKEN';
}


export const AuthErrorMessages = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account has been locked due to too many failed attempts',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  PASSWORD_TOO_WEAK: 'Password does not meet security requirements',
  ACCOUNT_NOT_FOUND: 'Account not found',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_RESET_TOKEN: 'Invalid or expired password reset token',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  ROLE_REQUIRED: 'Role is required',
  INVALID_ROLE: 'Invalid role specified',
  SESSION_EXPIRED: 'Your session has expired. Please login again',
};


export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  sub?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface VerificationToken {
  token: string;
  expiresAt: Date;
}
