import { ChangeEvent, useEffect, useRef, useState } from "react";
import HeaderLayout from "../components/HeaderLayout";
import JobdetailsHeader from "../components/JobdetailsHeader";
import FormatDateCom from "../components/FormatDateCom";
import {
  LocationDetailsInput,
} from "../components/LocationDetails";
import Popup from "../components/Popup";
import { useParams } from "react-router-dom";
//import UploadImage from "../components/UploadImage";
import Unauthorized from "./Unauthorized";
import { useSelector, useDispatch } from "react-redux";
import { authenticate } from "../services/apiServices";
import { setJobData } from "../store/authSlice";
import { RootState } from "../store/store";
import { setCurrentRoute } from "../store/currentViewSlice";
import { useLastRequestTime } from "../hooks/useLastRequestTime";
import Spinner from "../components/Spinner";
import { getJobDetails, getDisplayTitle } from "../utils/JobDataVal";
import { voucherFileNameGenerator } from "../functions/voucher-file-name-generator";
import { addTimestampParam } from "../utils/addTimestampParam";
import SwipeButton from "../components/SwipeButton";

interface PropsforLocation {
  dropOfLocation: string;
  cityState: string;
  passegerNameInput: string;
}

const CompleteJob = ({ islogrestricting }: { islogrestricting: boolean }) => {
  const dispatch = useDispatch();
  const { jobId } = useParams<{ jobId: string }>();
  // const navigate = useNavigate();
  const jobData = useSelector(
    (state: RootState) => state.auth.jobData[jobId || ""]
  );
  const lastRequestTime = useLastRequestTime();

  // State for input fields
  const [dropOfLocation, setDropOfLocation] = useState("");
  const [cityState, setCityState] = useState("");
  // const [tolls, setTolls] = useState(""); // Commented out - Tolls field is disabled
  const [passegerNameInput, setPassengerNameInput] = useState("");
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState(
    "Voucher attachment and Drop off location are required. Please complete the fields before proceeding."
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // State for validation popup
  const [showValidationPopup, setShowValidationPopup] = useState(false);

  // Check for selected voucher from voucher list
  useEffect(() => {
    const selectedVoucher = sessionStorage.getItem("selectedVoucher");
    if (selectedVoucher) {
      try {
        const voucher = JSON.parse(selectedVoucher);
        // Convert voucher URL to File object if possible, or store URL
        // For now, we'll fetch the image and create a File object
        fetch(voucher.url)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], voucher.fileName, {
              type: blob.type,
            });
            setVoucherFile(file);
            sessionStorage.removeItem("selectedVoucher");
          })
          .catch((err) => {
            console.error("Error loading voucher:", err);
          });
      } catch (err) {
        console.error("Error parsing selected voucher:", err);
        sessionStorage.removeItem("selectedVoucher");
      }
    }
  }, []);

  const handleVoucherChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isSubmitting) return;
    const file = event.target.files?.[0] ?? null;
    setVoucherFile(file);
    setUploadError(null);
  };

  const handleRemoveVoucher = () => {
    if (isSubmitting) return;
    setVoucherFile(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadVoucherFile = async (_jobIdToken: string, actualJobId: string, driverId?: string) => {
    if (!voucherFile) {
      throw new Error("Voucher file is required.");
    }

    // Generate file name with format: {DriverId}-{ReservationNumber}-{dateString}-voucher.{extension}
    const baseFileName = voucherFileNameGenerator(actualJobId, driverId);
    
    // Get file extension from the original file
    const fileExtension = voucherFile.name.split('.').pop() || 'png';
    const fileName = `${baseFileName}.${fileExtension}`;

    const formData = new FormData();
    formData.append("file", voucherFile);
    formData.append("fileName", fileName);

    const response = await fetch(addTimestampParam("/api/upload-file"), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to upload voucher file.");
    }
  };

  useEffect(() => {
    // Only auto-fill if drop-off location is empty
    if (dropOfLocation.trim()) {
      return;
    }

    const fetchCurrentLocation = async () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Try Google Maps Geocoding API first
          const mapsApiKey = import.meta.env.VITE_API_MAPS_KEY;
          if (mapsApiKey) {
            try {
              const response = await fetch(
                addTimestampParam(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${mapsApiKey}`)
              );
              const data = await response.json();

              if (data.results && data.results.length > 0) {
                const address = data.results[0].formatted_address;
                setDropOfLocation(address);
                return; // Success, exit early
              }
            } catch (error) {
              console.error("Error fetching address from Google Maps:", error);
              // Continue to fallback
            }
          }

          // Fallback: Use OpenStreetMap Nominatim API (free, no API key needed)
          try {
            const response = await fetch(
              addTimestampParam(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`),
              {
                headers: {
                  "User-Agent": "EliteIDApp", // Required by Nominatim
                },
              }
            );
            const data = await response.json();

            if (data && data.display_name) {
              setDropOfLocation(data.display_name);
              return; // Success, exit early
            }
          } catch (error) {
            console.error("Error fetching address from OpenStreetMap:", error);
          }

          // If all geocoding fails, show a user-friendly message instead of coordinates
          setDropOfLocation("Address not available. Please enter manually.");
        },
        (error) => {
          console.error("Error fetching location:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    fetchCurrentLocation();
  }, []); // Runs only once on mount

  const handleAllowLocation = async ({
    dropOfLocation,
    cityState,
    passegerNameInput,
  }: PropsforLocation, skipValidation = false) => {
    if (isSubmitting) {
      return;
    }

    if (!skipValidation) {
      const missingFields: string[] = [];
      if (!voucherFile) {
        missingFields.push("Voucher attachment");
      }
      if (!dropOfLocation.trim()) {
        missingFields.push("Drop off location");
      }
      if (!cityState.trim()) {
        missingFields.push("Voucher details");
      }

      if (missingFields.length > 0) {
        const fieldsText = missingFields.join(" and ");
        setValidationMessage(
          `${fieldsText} ${
            missingFields.length > 1 ? "are" : "is"
          } required. Please complete the field${
            missingFields.length > 1 ? "s" : ""
          } before proceeding.`
        );
        setShowValidationPopup(true);
        return;
      }
    }

    // Validation
    if (!jobId) {
      setUploadError(
        "Job details are missing. Please refresh the page and try again."
      );
      return;
    }

    // Extract actual job ID (reservation number) and driver ID from job data
    const { jobIdFromRes, driverId } = getJobDetails(jobData);
    const actualJobId = jobIdFromRes || jobId; // Fallback to token if reservation number not available

    setUploadError(null);
    setIsSubmitting(true);

    try {
      // Only upload voucher if it exists (skip logic allows proceeding without it)
      if (voucherFile) {
        await uploadVoucherFile(jobId, String(actualJobId), driverId ? String(driverId) : undefined);
      }
      
      const res = await authenticate({
        token: jobId,
        actionType: "SAVE",
        viewName: "COMPLETE",
        dropOfLocationSer: dropOfLocation,
        cityStateSer: cityState,
        passegerNameInputSer: passegerNameInput,
        // tollsSer: tolls, // Commented out - requires deeper implementation on Elite side
        tollsSer: "", // Send empty string instead
      });
      dispatch(setJobData({ jobId, data: res }));
      const currentViwe = res.JData?.[0]?.[0];
      dispatch(setCurrentRoute({ jobId, route: currentViwe }));
    } catch (error) {
      console.error("Error fetching job data", error);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (islogrestricting === true) {
      return window.location.reload();
    }
  }, [islogrestricting]);

  if (Number(jobData?.JHeader?.ActionCode) > 0) {
    return <Unauthorized message={jobData?.JHeader?.Message} />;
  }

  // Handle the case where no job data is found [This Part can be reused in all components if we make a helper function]
  if (!jobData || !jobData.JData || !jobData.JHeader) {
    return <Spinner functionPassed={handleAllowLocation} />;
  }

  // Use getJobDetails to extract job-related values
  const {
    jobOffer,
    jobIdFromRes,
    jobNumber,
    reservationDateTime,
    pickupAddress,
    passengerName,
  } = getJobDetails(jobData);

  // showButtonSave -> SAVE JOB INFO
  return (
    <>
      <HeaderLayout screenName={getDisplayTitle(String(jobOffer))} />
      <JobdetailsHeader
        JobidPassed={String(jobIdFromRes)}
        jobNumber={String(jobNumber)}
      />
      <div className="ml-10">
        <FormatDateCom datePassed={String(reservationDateTime)} />
      </div>
      <LocationDetailsInput
        onDropOfLocationChange={setDropOfLocation}
        onCityStateChange={setCityState}
        // onTollsChange={setTolls} // Commented out - requires deeper implementation on Elite side
        onPassengerNameChange={setPassengerNameInput}
        pickupAddress={String(pickupAddress)}
        prefilledDropOfLocation={dropOfLocation}
        cityState={cityState}
        dropOfLocation={dropOfLocation}
        // tolls={tolls} // Commented out - requires deeper implementation on Elite side
        passengerName={String(passengerName)}
        passengerNameValue={passegerNameInput}
      />
      <div className="ml-10 mt-4 location-container">
        <p className="secoundaru-text" style={{ marginBottom: "4px" }}>Attach Voucher Picture</p>
        <div
          className="d-flex-sb mr-10"
          style={{ gap: "1rem", alignItems: "center" }}
        >
          {!voucherFile && (
            <div
              className="d-flex-sb"
              style={{
                gap: "0.75rem",
                alignItems: "center",
                flexGrow: 1,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                {voucherFile ? "Replace File" : "Take Picture"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleVoucherChange}
                disabled={isSubmitting}
              />
            </div>
          )}
          {voucherFile && (
            <div
              className="d-flex-sb"
              style={{
                gap: "0.75rem",
                alignItems: "center",
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                <button
                  type="button"
                  onClick={handleRemoveVoucher}
                  disabled={isSubmitting}
                  className="button"
                  style={{
                    flex: 1,
                    backgroundColor: "#d93025",
                  }}
                >
                  Redo
                </button>
              </div>
              {/* Preview image of the voucher file */}
              <img
                src={URL.createObjectURL(voucherFile)}
                alt="Voucher Preview"
                style={{ width: "100%" }}
              />
            </div>
          )}
        </div>
        {/* <div
          className="d-flex-sb"
          style={{
            gap: "0.75rem",
            alignItems: "center",
            flexGrow: 1,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="button"
            onClick={() => navigate(addTimestampParam(`/${jobId}/vouchers`))}
            disabled={isSubmitting}
            style={{ width: "98%" }}
          >
            View Uploaded Vouchers
          </button>
        </div> */}
        {uploadError && (
          <p
            className="error-text"
            style={{ color: "#d93025", marginTop: "0.5rem" }}
          >
            {uploadError}
          </p>
        )}
      </div>

      {lastRequestTime ? (
        <p className="fs-sm">Refresh: {lastRequestTime}</p>
      ) : (
        <p className="fs-sm">Refresh time : Loading...</p>
      )}
      {/* <UploadImage /> */}
      {!showValidationPopup && (
        <>
          {/* <Popup
            triggerOnLoad={false}
            popTitle="Confirmation"
            PopUpButtonOpenText={showButtonSave}
            popUpText="Are you sure ?"
            PopUpButtonText="Yes"
            popVariantButton="primary"
            secondButtonText="No"
            popupButtonRedClass="secondaryPopup"
            functionpassed={() =>
              handleAllowLocation({
                dropOfLocation,
                cityState,
                passegerNameInput: passegerNameInput,
              })
            }
          /> */}
          <SwipeButton
            text="Save Billing Info"
            onSwipeComplete={() =>
              handleAllowLocation({
                dropOfLocation,
                cityState,
                passegerNameInput: passegerNameInput,
              })
            }
            disabled={!voucherFile && !isSubmitting} // Disabled if no voucher, unless submitting (skip logic below)
            loading={isSubmitting}
          />
        </>
      )}
      {showValidationPopup && (
        <Popup
          triggerOnLoad={true}
          popTitle="Validation Error"
          popUpText={validationMessage}
          PopUpButtonText="Redo"
          secondButtonText="Skip"
          functionpassed={() => setShowValidationPopup(false)}
          functionSecondButton={() => {
             setShowValidationPopup(false);
             handleAllowLocation({
                dropOfLocation,
                cityState,
                passegerNameInput,
             }, true); // Pass skip flag
          }}
          popupButtonRedClass="secondaryPopup"
        />
      )}
    </>
  );
};

export default CompleteJob;
