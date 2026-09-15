/**
 * Formats a doctor's name to ensure it has exactly one "Dr. " prefix.
 * Handles null/undefined/empty string, trims whitespace, and detects
 * existing title prefixes (e.g. Dr., dr, DR) case-insensitively.
 * 
 * @param name The doctor's name string to format.
 * @returns The formatted name starting with exactly "Dr. ".
 */
export function formatDoctorName(name: string | null | undefined): string {
  if (!name) return 'Dr. ';
  
  const trimmed = name.trim();
  const drRegex = /^dr\.?\s*/i;
  const cleaned = trimmed.replace(drRegex, '');
  
  if (!cleaned) return 'Dr. ';
  
  return `Dr. ${cleaned}`;
}
