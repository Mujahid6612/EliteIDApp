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

  // Search state
  const [reservationNumber, setReservationNumber] = useState<string>("");
  
  // Date range state with defaults
  const getDefaultDates = () => {
    const today = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    return {
      startDate: twoWeeksAgo.toISOString().split('T')[0], // YYYY-MM-DD format
      endDate: today.toISOString().split('T')[0], // YYYY-MM-DD format
    };
  };
  
  // Get today's date in YYYY-MM-DD format for max date validation
  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };
  
  const [startDate, setStartDate] = useState<string>(getDefaultDates().startDate);
  const [endDate, setEndDate] = useState<string>(getDefaultDates().endDate);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadVouchers = useCallback(async (start?: string, end?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch vouchers with provided date range or defaults
      const data = await fetchAdminVouchers(start, end);
      setVouchers(data);
      setCurrentPage(1); // Reset to first page when loading new data

      // If no vouchers found, show a message
      if (data.length === 0) {
        setError(
          "No vouchers found for the selected date range."
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
      // Fetch vouchers if authorized with default date range
      loadVouchers(startDate, endDate);
    } else {
      setIsAuthorized(false);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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

  // Handle search button click - only triggers on button click, no auto-search or debounce
  const handleSearch = async () => {
    // Call API with date range payload (backend filter)
    // The API will be called with startDate and endDate as query parameters
    await loadVouchers(startDate, endDate);
    // Frontend filter by reservation number will be applied in filteredVouchers
    setCurrentPage(1); // Reset to first page
  };

  // Filter vouchers by reservation number (frontend filter)
  // This filter is applied after API call returns data
  // Only filters when user has clicked Search button
  const filteredVouchers = vouchers.filter((voucher) => {
    if (!reservationNumber.trim()) {
      return true; // Show all if search is empty
    }

    const query = reservationNumber.toLowerCase().trim();
    const rideId = voucher.rideId?.toLowerCase() || "";

    // Search in reservation number (rideId)
    return rideId.includes(query);
  });

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

        {/* Search and Filter Section */}
        {(!loading && !error) && (
          <div className="filter-container">
            {/* Reservation Number Search */}
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#333",
                  marginBottom: "5px",
                }}
              >
                Search by Reservation Number
              </label>
              <input
                type="text"
                value={reservationNumber}
                onChange={(e) => setReservationNumber(e.target.value)}
                placeholder="Enter Reservation Number..."
                className="filter-input"
                style={{
                  padding: "10px 12px",
                  fontSize: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                  boxSizing: "border-box",
                  width: "100%",
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
            </div>

            {/* Date Range Filters */}
            <div className="filter-date-grid">
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                  }}
                >
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="filter-input"
                  style={{
                    padding: "10px 12px",
                    fontSize: "1rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#fff",
                    boxSizing: "border-box",
                    width: "100%",
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <label
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    color: "#333",
                    marginBottom: "5px",
                  }}
                >
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    const today = getTodayDateString();
                    // Prevent selecting future dates
                    if (selectedDate <= today) {
                      setEndDate(selectedDate);
                    }
                  }}
                  max={getTodayDateString()}
                  className="filter-input"
                  style={{
                    padding: "10px 12px",
                    fontSize: "1rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "#fff",
                    boxSizing: "border-box",
                    width: "100%",
                  }}
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="filter-search-button-container">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="filter-search-button"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
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

        {/* Show search results count */}
        {reservationNumber && filteredVouchers.length > 0 && (
          <div
            style={{
              marginBottom: "15px",
              color: "#666",
              fontSize: "0.95rem",
            }}
          >
            Showing {filteredVouchers.length} of {vouchers.length} vouchers
            {reservationNumber && ` matching "<strong>${reservationNumber}</strong>"`}
          </div>
        )}

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
