export interface SigninResponse {
  token?: string;
  role?: string;
  twoFactorEnabled?: boolean;
  isPopup?: boolean;
  invalidPassword?: boolean;
}
