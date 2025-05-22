export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  // Trim whitespace
  const trimmedEmail = email.trim();

  // Check if empty
  if (!trimmedEmail) {
    return {
      isValid: false,
      error: 'Email is required'
    };
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }

  // Check email length
  if (trimmedEmail.length > 254) {
    return {
      isValid: false,
      error: 'Email address is too long'
    };
  }

  // Check local part length (before @)
  const localPart = trimmedEmail.split('@')[0];
  if (localPart.length > 64) {
    return {
      isValid: false,
      error: 'Email username is too long'
    };
  }

  // Check for consecutive dots
  if (localPart.includes('..')) {
    return {
      isValid: false,
      error: 'Invalid email format'
    };
  }

  // Check for special characters in local part
  const localPartRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
  if (!localPartRegex.test(localPart)) {
    return {
      isValid: false,
      error: 'Email contains invalid characters'
    };
  }

  return { isValid: true };
};

export const validateEmails = (emails: string[]): ValidationResult[] => {
  const results = emails.map(validateEmail);
  
  // Check for duplicates
  const uniqueEmails = new Set(emails.map(email => email.trim().toLowerCase()));
  if (uniqueEmails.size !== emails.length) {
    results.forEach((result, index) => {
      const email = emails[index].trim().toLowerCase();
      const isDuplicate = emails.findIndex(e => e.trim().toLowerCase() === email) !== index;
      if (isDuplicate) {
        result.isValid = false;
        result.error = 'Duplicate email address';
      }
    });
  }

  return results;
}; 