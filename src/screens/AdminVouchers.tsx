import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import Spinner from "../components/Spinner";
import ThemedText from "../components/ThemedText";
import { fetchAdminVouchers, downloadVoucher, AdminVoucher } from "../services/adminService";

const AdminVouchers = () => {
  const [searchParams] = useSearchParams();
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Validate current page when vouchers or pageSize changes
  useEffect(() => {
    const totalPages = Math.ceil(vouchers.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [vouchers.length, pageSize, currentPage]);

  // Check authorization
  useEffect(() => {
    const adminKey = import.meta.env.VITE_ADMIN_KEY;
    const providedKey = searchParams.get("key");

    if (!adminKey) {
      console.warn("VITE_ADMIN_KEY is not set in environment variables");
      setIsAuthorized(false);
      setLoading(false);
      return;
    }

    if (providedKey === adminKey) {
      setIsAuthorized(true);
      // Fetch vouchers if authorized
      loadVouchers();
    } else {
      setIsAuthorized(false);
      setLoading(false);
    }
  }, [searchParams]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminVouchers();
      setVouchers(data);
      setCurrentPage(1); // Reset to first page when loading new data
    } catch (err) {
      console.error("Error loading vouchers:", err);
      setError("Failed to load vouchers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (voucher: AdminVoucher) => {
    const fileName = `voucher-${voucher.driverId}-${voucher.rideId}.png`;
    await downloadVoucher(voucher.voucherUrl, fileName);
  };

  // Pagination calculations
  const totalItems = vouchers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentVouchers = vouchers.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Show loading state
  if (loading || isAuthorized === null) {
    return (
      <>
        <HeaderLayout screenName="Admin Vouchers" />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <Spinner />
        </div>
      </>
    );
  }

  // Show access denied
  if (!isAuthorized) {
    return (
      <>
        <HeaderLayout screenName="Access Denied" />
        <div
          className="d-flex-cen"
          style={{ height: "80vh", flexDirection: "column", gap: "30px" }}
        >
          <ThemedText
            themeText="Access Denied"
            classPassed="centertext"
            style={{ fontSize: "2rem", color: "#d32f2f", fontWeight: "bold" }}
          />
          <ThemedText
            themeText="You do not have permission to access this page."
            classPassed="centertext"
          />
          <ThemedText
            themeText="Please provide a valid admin key."
            classPassed="centertext"
          />
          <div className="divider"></div>
        </div>
      </>
    );
  }

  // Show vouchers table
  return (
    <>
      <HeaderLayout screenName="Admin Vouchers" />
      <div className="ml-10 mr-10" style={{ marginBottom: "30px" }}>
        <ThemedText
          themeText="Vouchers List"
          classPassed="lefttext"
          style={{ marginBottom: "20px", fontSize: "1.5rem", fontWeight: "bold" }}
        />

        {error && (
          <div className="location-container" style={{ backgroundColor: "#ffebee", marginBottom: "20px" }}>
            <ThemedText themeText={`Error: ${error}`} classPassed="lefttext" />
          </div>
        )}

        {vouchers.length === 0 && !error && !loading && (
          <div className="location-container">
            <ThemedText
              themeText="No vouchers found."
              classPassed="centertext"
            />
          </div>
        )}

        {vouchers.length > 0 && (
          <>
            <div className="table-container">
              <table className="antd-style-table">
                <thead>
                  <tr>
                    <th>Driver ID</th>
                    <th>Ride ID</th>
                    <th>Voucher</th>
                    <th style={{ textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentVouchers.map((voucher, index) => (
                    <tr key={`${voucher.driverId}-${voucher.rideId}-${index}`}>
                      <td>{voucher.driverId}</td>
                      <td>{voucher.rideId}</td>
                      <td>
                        <img
                          src={voucher.voucherUrl}
                          alt={`Voucher ${voucher.rideId}`}
                          className="voucher-image"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/80/cccccc/666666?text=No+Image";
                          }}
                        />
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => handleDownload(voucher)}
                          className="download-btn"
                          title="Download Voucher"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 15.577l-3.539-3.538 1.415-1.414L11 12.586V3h2v9.586l1.124-1.125 1.415 1.414L12 15.577zM3 18v2h18v-2H3z"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="antd-pagination">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
              </div>
              <div className="pagination-controls">
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="page-size-select"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                  <option value={100}>100 / page</option>
                </select>
                
                <div className="pagination-buttons">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>
                  
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      className={`pagination-btn ${page === currentPage ? "active" : ""} ${page === "..." ? "ellipsis" : ""}`}
                      onClick={() => typeof page === "number" && handlePageChange(page)}
                      disabled={page === "..."}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminVouchers;

