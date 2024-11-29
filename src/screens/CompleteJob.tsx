import { useEffect, useState } from "react";
import HeaderLayout from "../components/HeaderLayout";
import JobdetailsHeader from "../components/JobdetailsHeader";
import FormatDateCom from "../components/FormatDateCom";
import {
  PassengerInfoInput,
  LocationDetailsInput,
} from "../components/LocationDetails";
import Popup from "../components/Popup";
import { useParams } from "react-router-dom";
import UploadImage from "../components/UploadImage";
import Unauthorized from "./Unauthorized";
import { useSelector, useDispatch } from "react-redux";
import { authenticate } from "../services/apiServices";
import { setAuthState } from "../store/authSlice";
import { RootState } from "../store/store";
import { setCurrentView } from "../store/currentViewSlice";
import { useLastRequestTime } from "../hooks/useLastRequestTime";
import Spinner from "../components/Spinner";

interface PropsforLocation {
  dropOfLocation: string;
  cityState: string;
  passegerNameInput: string;
}

const CompleteJob = () => {
  const dispatch = useDispatch();
  const { jobId } = useParams<{ jobId: string }>();
  const { jobData } = useSelector((state: RootState) => state.auth);
  const lastRequestTime = useLastRequestTime();

  // State for input fields
  const [dropOfLocation, setDropOfLocation] = useState("");
  const [cityState, setCityState] = useState("");
  const [passegerNameInput, setPassengerNameInput] = useState("");

  // State for validation popup
  const [showValidationPopup, setShowValidationPopup] = useState(false);

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
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_API_MAPS_KEY}`  
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
    // Validation
    if (!dropOfLocation.trim() || !cityState.trim()) {
      setShowValidationPopup(true); // Show the popup if validation fails
      return;
    }

    if (!jobId) return;

    try {
      const res = await authenticate({
        token: jobId,
        actionType: "SAVE",
        viewName: "COMPLETE",
        dropOfLocationSer: dropOfLocation,
        cityStateSer: cityState,
        passegerNameInputSer: passegerNameInput,
      });
      dispatch(setAuthState(res));
      let currentViwe = res.JData?.[0]?.[0];
      dispatch(setCurrentView(currentViwe));
    } catch (error) {
      console.error("Error fetching job data", error);
    }
  };

  if(jobData?.JHeader?.ActionCode == 1){
    return <Unauthorized message={jobData?.JHeader.Message} />
  }
  // Handle the case where no job data is found [This Part can be reused in all components if we make a helper function] 
  if (!jobData || !jobData.JData || !jobData.JHeader) {
    return <Spinner functionPassed={handleAllowLocation} />;  
  }

  const jobDetails = jobData.JData?.[0];
  const headingsData = jobData.JMetaData?.Headings;
  const JobOffer = jobDetails[0];
  const jobIdFromRes = jobDetails[1];
  const jobNumber = jobDetails[2] || "";
  const reservationDateTime = jobDetails[3];
  const pickupAddress = jobDetails[4];
  const passengerName = jobDetails[6];
  const showButtonAccept = headingsData[15][1];

  return (
    <>
      <HeaderLayout screenName={String(JobOffer)} />
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
      {lastRequestTime ? (
        <p className="fs-sm">Refresh: {lastRequestTime}</p>
      ) : (
        <p className="fs-sm">Refresh time : Loading...</p>
      )}
      {/* <UploadImage /> */}
      {!showValidationPopup && (
        <Popup
          triggerOnLoad={false}
          popTitle="Confirmation"
          PopUpButtonOpenText={showButtonAccept}
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
        />
      )}
      {showValidationPopup && (
        <Popup
          triggerOnLoad={true}
          popTitle="Validation Error"
          popUpText="Voucher and Drop off location fields are required. Please complete the fields before proceeding."
          PopUpButtonText="Ok"
          functionpassed={() => setShowValidationPopup(false)} // Close popup on "Ok"
          popupButtonRedClass="secondaryPopup"
        />
      )}
    </>
  );
};

export default CompleteJob;



