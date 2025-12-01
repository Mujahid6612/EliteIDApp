export interface AdminVoucher {
    driverId: string;
    rideId: string;
    voucherUrl: string;
  }
  
  /**
   * Fetch vouchers for a specific driver
   * @param driverId - The driver ID to fetch vouchers for
   * @returns Array of vouchers for the driver
   */
  export const fetchAdminVouchers = async (driverId: string): Promise<AdminVoucher[]> => {
    if (!driverId || driverId.trim() === "") {
      throw new Error("driverId is required");
    }

    try {
      const response = await fetch(`/api/list-vouchers?driverId=${encodeURIComponent(driverId)}`);
      
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