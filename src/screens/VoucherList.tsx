import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import Spinner from "../components/Spinner";
import ThemedText from "../components/ThemedText";
import { fetchAdminVouchers, downloadVoucher, AdminVoucher } from "../services/adminService";

const VoucherList = () => {
  const [searchParams] = useSearchParams();
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  
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

  const loadVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const driverId = searchParams.get("driverId");
      
      // Check if driverId is provided
      if (!driverId || driverId.trim() === "") {
        setError("Driver ID is required. Please provide a valid driverId in the URL (e.g., /admin/vouchers?driverId=YOUR_DRIVER_ID)");
        setVouchers([]);
        setLoading(false);
        return;
      }

      const data = await fetchAdminVouchers(driverId);
      setVouchers(data);
      setSelectedJobId("all"); // Reset filter when loading new data
      setCurrentPage(1); // Reset to first page when loading new data
      
      // If no vouchers found, show a message
      if (data.length === 0) {
        setError(`No vouchers found for driver ID: ${driverId}`);
      }
    } catch (err) {
      console.error("Error loading vouchers:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load vouchers. Please try again later.";
      setError(errorMessage);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Load vouchers based on driverId from query params
  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  const handleDownload = async (voucher: AdminVoucher) => {
    const fileName = `voucher-${voucher.driverId}-${voucher.rideId}.png`;
    await downloadVoucher(voucher.voucherUrl, fileName);
  };

  // Extract unique job IDs (rideId) from vouchers
  const uniqueJobIds = Array.from(new Set(vouchers.map(v => v.rideId))).sort();

  // Filter vouchers based on selected job ID
  const filteredVouchers = selectedJobId === "all" 
    ? vouchers 
    : vouchers.filter(voucher => voucher.rideId === selectedJobId);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedJobId]);

  // Pagination calculations based on filtered vouchers
  const totalItems = filteredVouchers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentVouchers = filteredVouchers.slice(startIndex, endIndex);

  const handleJobIdFilterChange = (jobId: string) => {
    setSelectedJobId(jobId);
  };

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
  if (loading) {
    return (
      <>
        <HeaderLayout screenName="Driver Vouchers" />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <Spinner />
        </div>
      </>
    );
  }

  // Show vouchers table
  const driverId = searchParams.get("driverId");
  
  return (
    <>
      <HeaderLayout screenName="Driver Vouchers" />
      <div className="ml-10 mr-10" style={{ marginBottom: "30px" }}>
        <ThemedText
          themeText={"Vouchers List"}
          classPassed="lefttext"
          style={{ marginBottom: "20px", fontSize: "1.5rem", fontWeight: "bold" }}
        />

        {error && (
          <div className="location-container" style={{ backgroundColor: "#ffebee", marginBottom: "20px", padding: "20px" }}>
            <ThemedText 
              themeText={error} 
              classPassed="centertext"
              style={{ color: "#d32f2f", fontSize: "1.1rem" }}
            />
          </div>
        )}

        {vouchers.length === 0 && !error && !loading && (
          <div className="location-container" style={{ padding: "40px" }}>
            <ThemedText
              themeText={`No vouchers found for driver ID: ${driverId || "unknown"}`}
              classPassed="centertext"
              style={{ fontSize: "1.1rem", color: "#666" }}
            />
          </div>
        )}

        {vouchers.length > 0 && (
          <>
            {/* Job ID Filter */}
            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <label htmlFor="jobIdFilter" style={{ fontWeight: "500", fontSize: "1rem" }}>
                Filter by Job ID:
              </label>
              <select
                id="jobIdFilter"
                value={selectedJobId}
                onChange={(e) => handleJobIdFilterChange(e.target.value)}
                style={{
                  padding: "8px 12px",
                  fontSize: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  minWidth: "200px",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value="all">All Job IDs ({vouchers.length})</option>
                {uniqueJobIds.map((jobId) => {
                  const count = vouchers.filter(v => v.rideId === jobId).length;
                  return (
                    <option key={jobId} value={jobId}>
                      {jobId} ({count})
                    </option>
                  );
                })}
              </select>
              {selectedJobId !== "all" && (
                <button
                  onClick={() => handleJobIdFilterChange("all")}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.9rem",
                    backgroundColor: "#f5f5f5",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* Show filtered count */}
            {selectedJobId !== "all" && (
              <div style={{ marginBottom: "15px", color: "#666", fontSize: "0.95rem" }}>
                Showing {filteredVouchers.length} of {vouchers.length} vouchers for Job ID: <strong>{selectedJobId}</strong>
              </div>
            )}

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

export default VoucherList;