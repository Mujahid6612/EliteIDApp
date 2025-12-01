/**
 * Generate voucher file name with format: {ReservationNumber}-{startDate}-{endDate}-voucher
 * @param reservationNumber - The reservation number (jobId)
 * @param startDate - Start date string in YYYY-MM-DD format (14 days back)
 * @param endDate - End date string in YYYY-MM-DD format (today). If not provided, uses current date
 * @returns Formatted voucher file name
 */
export const voucherFileNameGenerator = (reservationNumber: string, startDate: string, endDate?: string): string => {
  // Use provided end date or current date
  const voucherEndDate = endDate || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  return `${reservationNumber || "unknown"}-${startDate}-${voucherEndDate}-voucher`;
};
