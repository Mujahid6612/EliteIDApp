export const voucherFileNameGenerator = (dirverId: string, job_id: string) => {
  return `${dirverId || "unknown"}-${job_id || "unknown"}-voucher`;
};
