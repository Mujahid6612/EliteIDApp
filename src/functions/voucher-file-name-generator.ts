/**
 * Generate voucher file name with format: {DriverId}-{ReservationNumber}-{dateString}-voucher
 * @param reservationNumber - The reservation number (jobId)
 * @param driverId - The driver ID (optional)
 * @returns Formatted voucher file name (without extension)
 */
export const voucherFileNameGenerator = (reservationNumber: string, driverId?: string): string => {
  // Get current date in DD-MM-YYYY format
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0'); // DD with leading zero
  const month = String(now.getMonth() + 1).padStart(2, '0'); // MM with leading zero (getMonth() is 0-indexed)
  const year = now.getFullYear(); // YYYY
  const dateString = `${day}-${month}-${year}`; // DD-MM-YYYY format
  
  // Include driver ID if provided, otherwise use "unknown"
  const driverIdPart = driverId && driverId.trim() ? driverId.trim() : "unknown";
  
  return `${driverIdPart}-${reservationNumber || "unknown"}-${dateString}-voucher`;
};
