// Converts a database Date into YYYY-MM-DD.
export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// Converts YYYY-MM-DD into a Date at UTC midnight.
export function fromDateString(dateString: string): Date {
  return new Date(`${dateString}T00:00:00.000Z`);
}

// Returns today's date in the given timezone as YYYY-MM-DD.
export function todayInTz(timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Could not calculate today's date");
  }

  return `${year}-${month}-${day}`;
}