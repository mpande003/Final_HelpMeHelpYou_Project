// Stub for volunteer database operations missing after Supabase migration.
// Required by app/api/public/volunteers/route.ts

export function buildVolunteerSubmissionKey(ip: string): string {
  return `volunteer_submission_${ip}`;
}

export function countRecentVolunteerSubmissionAttempts(key: string, minutes: number): number {
  return 0; // Bypass rate limiting local check
}

export function hasRecentVolunteerDuplicate(params: any): boolean {
  return false; // Bypass local duplicate check
}

export function logVolunteerSubmissionAttempt(key: string): void {
  // Stub
}
