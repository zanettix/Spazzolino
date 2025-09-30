import { UserLogin } from '@/types/userLogin';
import { UserRegistration } from '@/types/userRegistration';
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class AuthValidation {

  static validateLogin(credentials: UserLogin): ValidationResult {
    const errors: string[] = [];

    errors.push(...this.validateEmail(credentials.email));
    errors.push(...this.validatePassword(credentials.password));

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateRegistration(credentials: UserRegistration): ValidationResult {
    const errors: string[] = [];

    errors.push(...this.validateEmail(credentials.email));
    errors.push(...this.validatePassword(credentials.password));
    errors.push(...this.validateNickname(credentials.nickname));

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static validateEmail(email: string): string[] {
    const errors: string[] = [];

     if (!email) {
      errors.push('Email è richiesta');
    } else if (!this.isValidEmail(email)) {
      errors.push('Email non valida');
    }

    return errors;
    }

  private static validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password è richiesta');
    } else if (password.length < 6) {
      errors.push('Password deve essere di almeno 6 caratteri');
    }

    return errors;
  }

  private static validateNickname(nickname: string): string[] {
    const errors: string[] = [];

    if (!nickname) {
      errors.push('Nickname è richiesto');
    } else if (nickname.length < 2) {
      errors.push('Nickname deve essere di almeno 2 caratteri');
    } else if (nickname.length > 30) {
      errors.push('Nickname deve essere massimo 30 caratteri');
    }

    return errors;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}