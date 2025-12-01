import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import Spinner from "../components/Spinner";
import ThemedText from "../components/ThemedText";
import {
  fetchAdminVouchers,
  downloadVoucher,
  AdminVoucher,
} from "../services/adminService";

const VoucherList = () => {
  const [searchParams] = useSearchParams();
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Search state - Commented out for now, will be used when driver ID is available from backend
  // const [searchQuery, setSearchQuery] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch vouchers with default date range (today to 14 days back)
      const data = await fetchAdminVouchers();
      setVouchers(data);
      setCurrentPage(1); // Reset to first page when loading new data

      // If no vouchers found, show a message
      if (data.length === 0) {
        setError(
          "No vouchers found for the selected date range (last 14 days)."
        );
      }
    } catch (err) {
      console.error("Error loading vouchers:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load vouchers. Please try again later.";
      setError(errorMessage);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authorization on mount
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
  }, [searchParams, loadVouchers]);

  // Validate current page when vouchers or pageSize changes
  useEffect(() => {
    const totalPages = Math.ceil(vouchers.length / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [vouchers.length, pageSize, currentPage]);

  const handleDownload = async (voucher: AdminVoucher) => {
    const fileName = `voucher-${voucher.driverId}-${voucher.rideId}.png`;
    await downloadVoucher(voucher.voucherUrl, fileName);
  };

  // Filter vouchers based on search query (jobId or voucher name/fileName)
  // Commented out for now, will be used when driver ID is available from backend
  // const filteredVouchers = vouchers.filter((voucher) => {
  //   if (!searchQuery.trim()) {
  //     return true; // Show all if search is empty
  //   }

  //   const query = searchQuery.toLowerCase().trim();
  //   const jobId = voucher.rideId?.toLowerCase() || "";
  //   const fileName = voucher.fileName?.toLowerCase() || "";
  //   const driverId = voucher.driverId?.toLowerCase() || "";

  //   // Search in jobId (rideId), fileName, or driverId
  //   return (
  //     jobId.includes(query) ||
  //     fileName.includes(query) ||
  //     driverId.includes(query)
  //   );
  // });

  // Reset to first page when search changes
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchQuery]);

  // For now, use all vouchers without filtering
  const filteredVouchers = vouchers;

  // Pagination calculations based on filtered vouchers
  const totalItems = filteredVouchers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentVouchers = filteredVouchers.slice(startIndex, endIndex);

  // Search handler - Commented out for now, will be used when driver ID is available from backend
  // const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setSearchQuery(e.target.value);
  // };

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
        <HeaderLayout screenName="Vouchers List" />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <Spinner />
        </div>
      </>
    );
  }

  // Show 404 if not authorized
  if (!isAuthorized) {
    return (
      <>
        <HeaderLayout screenName="404 - Not Found" />
        <div
          className="d-flex-cen"
          style={{ height: "80vh", flexDirection: "column", gap: "30px" }}
        >
          <ThemedText
            themeText="404"
            classPassed="centertext"
            style={{ fontSize: "4rem", color: "#d32f2f", fontWeight: "bold" }}
          />
          <ThemedText
            themeText="Page Not Found"
            classPassed="centertext"
            style={{ fontSize: "1.5rem", fontWeight: "bold" }}
          />
          <ThemedText
            themeText="The page you are looking for does not exist."
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
      <HeaderLayout screenName="Vouchers List" />
      <div className="ml-10 mr-10" style={{ marginBottom: "30px" }}>
        <ThemedText
          themeText="Vouchers List"
          classPassed="lefttext"
          style={{
            marginBottom: "20px",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        />

        {error && (
          <div
            className="location-container"
            style={{
              backgroundColor: "#ffebee",
              marginBottom: "20px",
              padding: "20px",
            }}
          >
            <ThemedText
              themeText={error}
              classPassed="centertext"
              style={{ color: "#d32f2f", fontSize: "1.1rem" }}
            />
          </div>
        )}

        {/* Search Bar - Commented out for now, will be used when driver ID is available from backend */}
        {/* {(!loading && !error) && (
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div style={{ position: "relative", flex: 1, width: "100%" }}>
              <input
                id="searchInput"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by Job ID, Driver ID, or Voucher Name..."
                style={{
                  padding: "8px 35px 8px 12px",
                  fontSize: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  width: "100%",
                  backgroundColor: "#fff",
                  boxSizing: "border-box",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#666",
                  }}
                  title="Clear search"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )} */}

        {/* Show search results count - Commented out for now */}
        {/* {searchQuery && filteredVouchers.length > 0 && (
          <div
            style={{
              marginBottom: "15px",
              color: "#666",
              fontSize: "0.95rem",
            }}
          >
            Showing {filteredVouchers.length} of {vouchers.length} vouchers
            matching "<strong>{searchQuery}</strong>"
          </div>
        )} */}

        {/* Table - Always show when not loading and no error */}
        {!loading && !error && (
          <div className="table-container">
            <table className="antd-style-table">
              <thead>
                <tr>
                  {/* Driver ID column - Commented out for now, will be used when driver ID is available from backend */}
                  {/* <th>Driver ID</th> */}
                  <th style={{ width: "200px" }}>Reservation ID</th>
                  <th>Voucher Image</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "#666",
                        fontSize: "1rem",
                      }}
                    >
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  currentVouchers.map((voucher, index) => (
                    <tr key={`${voucher.driverId}-${voucher.rideId}-${index}`}>
                      {/* Driver ID cell - Commented out for now, will be used when driver ID is available from backend */}
                      {/* <td>{voucher.driverId}</td> */}
                      <td
                        style={{
                          width: "200px",
                          wordWrap: "break-word",
                          wordBreak: "break-all",
                          whiteSpace: "normal",
                        }}
                      >
                        {voucher.rideId}
                      </td>
                      <td>
                        <img
                          src={voucher.voucherUrl}
                          alt={`Voucher ${voucher.rideId}`}
                          className="voucher-image"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/80/cccccc/666666?text=No+Image";
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination - Show only when there are filtered vouchers */}
        {!loading && !error && filteredVouchers.length > 0 && (
          <div className="antd-pagination">
              <div className="pagination-info">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of{" "}
                {totalItems} entries
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
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
                    </svg>
                  </button>

                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      className={`pagination-btn ${
                        page === currentPage ? "active" : ""
                      } ${page === "..." ? "ellipsis" : ""}`}
                      onClick={() =>
                        typeof page === "number" && handlePageChange(page)
                      }
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
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
    </>
  );
};

export default VoucherList;
