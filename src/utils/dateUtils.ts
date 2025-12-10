// Utility functions for date handling

/**
 * Generate weekdays for a given date range
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns Array of dates representing each day in the range
 */
export const generateWeekdaysForRange = (
  startDate: Date,
  endDate: Date
): Date[] => {
  const weekdays: Date[] = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);
  const endDateNormalized = new Date(endDate);
  endDateNormalized.setHours(0, 0, 0, 0);

  while (currentDate <= endDateNormalized) {
    weekdays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekdays;
};

/**
 * Get the first day of the month
 * @param date - Date to get the month from
 * @returns First day of the month
 */
export const getMonthStart = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

/**
 * Get the last day of the month
 * @param date - Date to get the month from
 * @returns Last day of the month
 */
export const getMonthEnd = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
};

/**
 * Get month name from date
 * @param date - Date to get the month name from
 * @returns Month name
 */
export const getMonthName = (date: Date): string => {
  return date.toLocaleString("default", { month: "long" });
};

/**
 * Get year from date
 * @param date - Date to get the year from
 * @returns Year
 */
export const getYear = (date: Date): number => {
  return date.getFullYear();
};

/**
 * Format date range as string
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns Formatted date range string
 */
export const formatDateRange = (startDate: Date, endDate: Date): string => {
  const startStr = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const endStr = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} - ${endStr}`;
};

/**
 * Check if two dates are in the same month
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are in the same month
 */
export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth()
  );
};
