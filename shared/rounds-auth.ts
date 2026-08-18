export type RoundsAccountInput = { name: string; email: string; password: string };

export function normalizeRoundsEmail(value: string) {
  return value.trim().toLowerCase();
}

export function accountProblem(input: RoundsAccountInput): string | null {
  const name = input.name.trim().replace(/\s+/g, " ");
  const email = normalizeRoundsEmail(input.email);
  if (name.length < 2 || name.length > 80) return "Enter a name between 2 and 80 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) return "Enter a valid email address.";
  if (input.password.length < 10 || input.password.length > 128) return "Use a password with 10 to 128 characters.";
  return null;
}

export function signInProblem(email: string, password: string): string | null {
  if (!normalizeRoundsEmail(email) || !password) return "Enter your email and password.";
  return null;
}

export function sessionIsExpired(expiresAt: Date, now = new Date()) {
  return expiresAt.getTime() <= now.getTime();
}
