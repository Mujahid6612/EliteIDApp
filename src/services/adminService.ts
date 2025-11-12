export interface AdminVoucher {
  driverId: string;
  rideId: string;
  voucherUrl: string;
}

/**
 * Dummy API function to fetch admin vouchers list
 * Replace this with actual API call when backend is ready
 */
export const fetchAdminVouchers = async (): Promise<AdminVoucher[]> => {
  // TODO: Replace with actual API call
  // For now, return dummy data
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          driverId: "DRV001",
          rideId: "RIDE12345",
          voucherUrl: "https://picsum.photos/200/120?random=1",
        },
        {
          driverId: "DRV002",
          rideId: "RIDE12346",
          voucherUrl: "https://picsum.photos/200/120?random=2",
        },
        {
          driverId: "DRV003",
          rideId: "RIDE12347",
          voucherUrl: "https://picsum.photos/200/120?random=3",
        },
        {
          driverId: "DRV004",
          rideId: "RIDE12348",
          voucherUrl: "https://picsum.photos/200/120?random=4",
        },
        {
          driverId: "DRV005",
          rideId: "RIDE12349",
          voucherUrl: "https://picsum.photos/200/120?random=5",
        },
        {
          driverId: "DRV006",
          rideId: "RIDE12350",
          voucherUrl: "https://picsum.photos/200/120?random=6",
        },
        {
          driverId: "DRV007",
          rideId: "RIDE12351",
          voucherUrl: "https://picsum.photos/200/120?random=7",
        },
        {
          driverId: "DRV008",
          rideId: "RIDE12352",
          voucherUrl: "https://picsum.photos/200/120?random=8",
        },
        {
          driverId: "DRV009",
          rideId: "RIDE12353",
          voucherUrl: "https://picsum.photos/200/120?random=9",
        },
        {
          driverId: "DRV010",
          rideId: "RIDE12354",
          voucherUrl: "https://picsum.photos/200/120?random=10",
        },
        {
          driverId: "DRV011",
          rideId: "RIDE12355",
          voucherUrl: "https://picsum.photos/200/120?random=11",
        },
        {
          driverId: "DRV012",
          rideId: "RIDE12356",
          voucherUrl: "https://picsum.photos/200/120?random=12",
        },
      ]
      );
    }, 500); // Simulate API delay
  });

  // Actual API call (commented out for now):
  /*
  try {
    const response = await axios.get(API_ROUTES.ADMIN_VOUCHERS);
    return response.data;
  } catch (error) {
    console.error("Error fetching admin vouchers:", error);
    throw error;
  }
  */
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

