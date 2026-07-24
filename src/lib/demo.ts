// src/lib/demo.ts

const DEMO_EMAILS = new Set([
  "horistics@outlook.com",
  "horistics@gmail.com",
]);

export function isDemoUser(session: any): boolean {
  return !!session?.user?.email && DEMO_EMAILS.has(session.user.email);
}

export function isDemoEmail(email: string): boolean {
  return DEMO_EMAILS.has(email);
}