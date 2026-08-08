// Event
export const AuthenticationLifecycleEvents = {
  Authenticated: 'authenticated',
  LoggedOut: 'loggedOut',
} as const;

export type AuthenticationLifecycleEvent = typeof AuthenticationLifecycleEvents[keyof typeof AuthenticationLifecycleEvents];

// Model
export interface MeProfile {
  sub?: string;
  username?: string;
  roles?: string[];
  permissions?: string[];
  id?: number | string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  message?: string;
  data?: { accessToken: string } | null;
}
