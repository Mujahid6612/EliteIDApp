export interface AdminVoucher {
    driverId: string;
    rideId: string;
    voucherUrl: string;
    fileName?: string;
  }
  
  /**
   * Fetch vouchers based on date range (default: today to 14 days back)
   * @param startDate - Optional start date in YYYY-MM-DD format
   * @param endDate - Optional end date in YYYY-MM-DD format
   * @returns Array of vouchers within the date range
   */
  export const fetchAdminVouchers = async (startDate?: string, endDate?: string): Promise<AdminVoucher[]> => {
    try {
      let url = "/api/list-vouchers";
      const params = new URLSearchParams();
      
      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch vouchers" }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.vouchers || [];
    } catch (error) {
      console.error("Error fetching admin vouchers:", error);
      throw error;
    }
  };
  
  /**
   * Download voucher image
   * Handles CORS by fetching the image as a blob first
   */
  export const downloadVoucher = async (voucherUrl: string, fileName: string) => {
    try {
      // Fetch the image as a blob to handle CORS
      const response = await fetch(voucherUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "voucher.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading voucher:", error);
      // Fallback: try direct download (may fail due to CORS)
      const link = document.createElement("a");
      link.href = voucherUrl;
      link.download = fileName || "voucher.png";
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };