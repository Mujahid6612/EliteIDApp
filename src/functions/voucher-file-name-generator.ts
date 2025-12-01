/**
 * Generate voucher file name with format: {ReservationNumber}-{dateString}-voucher
 * @param reservationNumber - The reservation number (jobId)
 * @returns Formatted voucher file name (without extension)
 */
export const voucherFileNameGenerator = (reservationNumber: string): string => {
  // Get current date in DD-MM-YYYY format
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0'); // DD with leading zero
  const month = String(now.getMonth() + 1).padStart(2, '0'); // MM with leading zero (getMonth() is 0-indexed)
  const year = now.getFullYear(); // YYYY
  const dateString = `${day}-${month}-${year}`; // DD-MM-YYYY format
  
  return `${reservationNumber || "unknown"}-${dateString}-voucher`;
};
