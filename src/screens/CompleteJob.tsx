import { ChangeEvent, useEffect, useRef, useState } from "react";
import HeaderLayout from "../components/HeaderLayout";
import JobdetailsHeader from "../components/JobdetailsHeader";
import FormatDateCom from "../components/FormatDateCom";
import {
  PassengerInfoInput,
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
import { getJobDetails } from "../utils/JobDataVal";
import { voucherFileNameGenerator } from "../functions/voucher-file-name-generator";
import SwipeButton from "../components/SwipeButton";

interface PropsforLocation {
  dropOfLocation: string;
  cityState: string;
  passegerNameInput: string;
}

const CompleteJob = ({ islogrestricting }: { islogrestricting: boolean }) => {
  const dispatch = useDispatch();
  const { jobId } = useParams<{ jobId: string }>();
  const jobData = useSelector(
    (state: RootState) => state.auth.jobData[jobId || ""]
  );
  const lastRequestTime = useLastRequestTime();

  // State for input fields
  const [dropOfLocation, setDropOfLocation] = useState("");
  const [cityState, setCityState] = useState("");
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

  const uploadVoucherFile = async (jobId: string) => {
    if (!voucherFile) {
      throw new Error("Voucher file is required.");
    }

    const fileName = voucherFileNameGenerator("123", jobId);

    const formData = new FormData();
    formData.append("file", voucherFile);
    formData.append("fileName", fileName);

    const response = await fetch("/api/upload-file", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || "Failed to upload voucher file.");
    }
  };

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Use Google Maps Geocoding API for detailed address
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${
                import.meta.env.VITE_API_MAPS_KEY
              }`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted_address;
              setDropOfLocation(address || "Enter Drop Off Location");
            } else {
              console.error("Failed to retrieve location details.");
            }
          } catch (error) {
            console.error("Error fetching detailed address:", error);
          }
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    };

    fetchCurrentLocation();
  }, []); // Runs only once on mount

  const handleAllowLocation = async ({
    dropOfLocation,
    cityState,
    passegerNameInput,
  }: PropsforLocation) => {
    if (isSubmitting) {
      return;
    }

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

    // Validation
    if (!jobId) {
      setUploadError(
        "Job details are missing. Please refresh the page and try again."
      );
      return;
    }

    setUploadError(null);
    setIsSubmitting(true);

    try {
      await uploadVoucherFile(jobId);
      const res = await authenticate({
        token: jobId,
        actionType: "SAVE",
        viewName: "COMPLETE",
        dropOfLocationSer: dropOfLocation,
        cityStateSer: cityState,
        passegerNameInputSer: passegerNameInput,
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
    showButtonSave,
  } = getJobDetails(jobData);

  // showButtonSave -> SAVE JOB INFO
  return (
    <>
      <HeaderLayout screenName={String(jobOffer)} />
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
        pickupAddress={String(pickupAddress)}
        prefilledDropOfLocation={dropOfLocation}
      />
      <PassengerInfoInput
        passengerName={String(passengerName)}
        onPassengerNameChange={setPassengerNameInput}
      />
      <div className="ml-10 mt-4 location-container">
        <p className="secoundaru-text ">Voucher Attachment:</p>
        <div
          className="d-flex-sb mr-10"
          style={{ gap: "1rem", alignItems: "center" }}
        >
          {!voucherFile && (
            <div
              className="d-flex-sb"
              style={{ gap: "0.75rem", alignItems: "center", flexGrow: 1 }}
            >
              <button
                type="button"
                className="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
              >
                {voucherFile ? "Replace File" : "Attach File"}
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
              <button
                type="button"
                onClick={handleRemoveVoucher}
                disabled={isSubmitting}
                style={{ width: "100%" }}
              >
                Remove and Re-select Voucher
              </button>
              {/* Preview image of the voucher file */}
              <img
                src={URL.createObjectURL(voucherFile)}
                alt="Voucher Preview"
                style={{ width: "100%" }}
              />
            </div>
          )}
        </div>
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
            text={showButtonSave}
            onSwipeComplete={() =>
              handleAllowLocation({
                dropOfLocation,
                cityState,
                passegerNameInput: passegerNameInput,
              })
            }
            disabled={isSubmitting}
            loading={isSubmitting}
          />
        </>
      )}
      {showValidationPopup && (
        <Popup
          triggerOnLoad={true}
          popTitle="Validation Error"
          popUpText={validationMessage}
          PopUpButtonText="Ok"
          functionpassed={() => setShowValidationPopup(false)} // Close popup on "Ok"
          popupButtonRedClass="secondaryPopup"
        />
      )}
    </>
  );
};

export default CompleteJob;
