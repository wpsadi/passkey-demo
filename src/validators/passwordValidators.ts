import { z } from "zod";

// Validation messages
const MESSAGES = {
  LENGTH: "Password must be between 8 and 64 characters",
  UPPERCASE: "Password must contain at least one uppercase letter",
  LOWERCASE: "Password must contain at least one lowercase letter",
  NUMBER: "Password must contain at least one number",
  SPECIAL: "Password must contain at least one special character (!@#$%^&*_-+=)",
  WHITESPACE: "Password cannot contain whitespace",
  SEQUENTIAL: "Password cannot contain sequential characters (e.g., '123', 'abc')"
} as const;

// Helper functions for password validation
const containsSequential = (password: string): boolean => {
  const sequences = ['123', '234', '345', '456', '567', '678', '789', 
                    'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 
                    'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop',
                    'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw',
                    'vwx', 'wxy', 'xyz'];
  
  const lowerPass = password.toLowerCase();
  return sequences.some(seq => lowerPass.includes(seq));
};

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, MESSAGES.LENGTH)
  .max(64, MESSAGES.LENGTH)
  .regex(/[A-Z]/, MESSAGES.UPPERCASE)
  .regex(/[a-z]/, MESSAGES.LOWERCASE)
  .regex(/[0-9]/, MESSAGES.NUMBER)
  .regex(/[!@#$%^&*_\-+=]/, MESSAGES.SPECIAL)
  .refine(
    (password) => !/\s/.test(password),
    MESSAGES.WHITESPACE
  )
  .refine(
    (password) => !containsSequential(password),
    MESSAGES.SEQUENTIAL
  );



// Function to check password strength (optional utility)
const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  try {
    passwordSchema.parse(password);
    
    // Calculate additional strength metrics
    const hasExtraSpecial = (password.match(/[!@#$%^&*_\-+=]/g) || []).length > 1;
    const hasExtraNumbers = (password.match(/[0-9]/g) || []).length > 1;
    const isLong = password.length >= 12;
    
    if (isLong && hasExtraSpecial && hasExtraNumbers) {
      return 'strong';
    }
    return 'medium';
  } catch {
    return 'weak';
  }
};

export { passwordSchema, getPasswordStrength };