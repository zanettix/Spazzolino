import { AuthState } from "./authState";
import { UserLogin } from "./userLogin";
import { UserRegistration } from "./userRegistration";

export interface AuthContextType extends AuthState {
  signIn: (credentials: UserLogin) => Promise<void>;
  signUp: (credentials: UserRegistration) => Promise<void>;
  signOut: () => Promise<void>;
}