import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import Spinner from "../components/Spinner";
import ThemedText from "../components/ThemedText";
import { addTimestampParam } from "../utils/addTimestampParam";

interface Voucher {
  id: string;
  url: string;
  fileName: string;
}

const VoucherList = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVoucher = async () => {
      if (!jobId) {
        setError("Job ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Construct the voucher URL using the pattern: 123-[job-id]-voucher
        const fileName = `123-${jobId}-voucher`;
        const voucherUrl = `https://oqe0yrdozbhh0ljn.public.blob.vercel-storage.com/uploads/${fileName}`;

        // Check if the voucher exists by trying to load the image
        const img = new Image();
        img.onload = () => {
          // Image loaded successfully, voucher exists
          setVouchers([
            {
              id: fileName,
              url: voucherUrl,
              fileName: fileName,
            },
          ]);
          setLoading(false);
        };
        img.onerror = () => {
          // Image failed to load, voucher doesn't exist
          setVouchers([]);
          setLoading(false);
        };
        img.src = voucherUrl;
      } catch (err) {
        console.error("Error fetching voucher:", err);
        setVouchers([]);
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [jobId]);

  const handleSelectVoucher = (voucher: Voucher) => {
    // Store selected voucher in sessionStorage or pass via state
    sessionStorage.setItem("selectedVoucher", JSON.stringify(voucher));
    // Navigate back to CompleteJob screen
    navigate(addTimestampParam(`/${jobId}`));
  };


  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <HeaderLayout screenName="Voucher List" />
      <div className="ml-10 mr-10">
        <ThemedText
          themeText="Select a voucher from the list below:"
          classPassed="lefttext"
          style={{ marginBottom: "20px" }}
        />

        {error && (
          <div className="location-container" style={{ backgroundColor: "#ffebee" }}>
            <ThemedText
              themeText={`Error: ${error}`}
              classPassed="lefttext"
            />
          </div>
        )}

        {vouchers.length === 0 && !error && (
          <div className="location-container">
            <ThemedText
              themeText="No vouchers found. Please upload a voucher first."
              classPassed="centertext"
            />
          </div>
        )}

        {vouchers.map((voucher) => (
          <div
            key={voucher.id}
            className="location-container"
            style={{
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onClick={() => handleSelectVoucher(voucher)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            <div className="d-flex-sb">
              <div style={{ flex: 1 }}>
                <p className="secoundaru-text">{voucher.fileName}</p>
                <p className="fs-sm" style={{ color: "#666" }}>
                  Click to select this voucher
                </p>
              </div>
              <div style={{ marginLeft: "10px" }}>
                <img
                  src={voucher.url}
                  alt={voucher.fileName}
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "5px",
                  }}
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          </div>
        ))}

        <div className="d-flex-cen mt-10">
          <button
            className="button primary"
            onClick={() => navigate(addTimestampParam(`/${jobId}`))}
            style={{ marginTop: "20px" }}
          >
            Back to Job
          </button>
        </div>
      </div>
    </>
  );
};

export default VoucherList;

