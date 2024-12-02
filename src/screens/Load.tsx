import HeaderLayout from "../components/HeaderLayout";
import JobdetailsHeader from "../components/JobdetailsHeader";
import FormatDateCom from "../components/FormatDateCom";
import { PassengerInfo, LocationDetails } from "../components/LocationDetails";
import Spinner from "../components/Spinner";
// import ButtonsComponent from "../components/ButtonsComponent";
import Popup from "../components/Popup";
import { useParams } from "react-router-dom";
import { useState } from "react";
import Unauthorized from "./Unauthorized";
import { useSelector, useDispatch } from "react-redux";
import { authenticate } from "../services/apiServices";
import { setAuthState } from "../store/authSlice";
import { RootState } from "../store/store";
import { setCurrentView } from "../store/currentViewSlice";
import { useLastRequestTime } from "../hooks/useLastRequestTime";
import { getJobDetails } from "../utils/JobDataVal"; // Import the utility function

const Load = () => {
  const dispatch = useDispatch();
  const { jobId } = useParams<{ jobId: string }>();
  const [isStopAdded, setIsStopAdded] = useState(false);
  const lastRequestTime = useLastRequestTime();
  let action = isStopAdded ? "ADD_STOP" : "END";

  const handleAddStop = () => {
    setIsStopAdded(true);
  };

  const { jobData } = useSelector((state: RootState) => state.auth);

  const handleAllowLocation = async (action: string) => {
    if (!jobId) return;
    try {
      const res = await authenticate({
        token: jobId,
        actionType: action,
        viewName: "LOAD",
      });
      dispatch(setAuthState(res));
      let currentView =
        Array.isArray(res?.JData) &&
        Array.isArray(res.JData[0]) &&
        res.JData[0][0] !== undefined
          ? res.JData[0][0]
          : "On-scene";
      setIsStopAdded(false);
      if (currentView) {
        dispatch(setCurrentView(currentView));
      }
    } catch (error) {
      console.error("Error fetching job data", error);
    }
  };

  if (jobData?.JHeader?.ActionCode === 1) {
    return <Unauthorized message={jobData?.JHeader.Message} />;
  }

  if (!jobData || !jobData.JData || !jobData.JHeader) {
    return <Spinner functionPassed={handleAllowLocation} />;
  }

  // Use getJobDetails to extract all job-related data
  const {
    jobOffer,
    jobIdFromRes,
    jobNumber,
    reservationDateTime,
    pickupAddress,
    dropoffAddress,
    passengerName,
    passengerPhone,
    passengerNameHeading,
    passengerPhoneHeading,
    showButtonEnd,
    showButtonAddStop,
    showButtonStart
  } = getJobDetails(jobData);

  return (
    <>
      <HeaderLayout screenName={String(jobOffer)} />
      <JobdetailsHeader JobidPassed={String(jobIdFromRes)} jobNumber={String(jobNumber)} />
      <div className="ml-10">
        <FormatDateCom datePassed={String(reservationDateTime)} />
      </div>
      <LocationDetails
        pickupAddress={String(pickupAddress)}
        dropoffAddress={String(dropoffAddress)}
      />
      <PassengerInfo
        passengerName={String(passengerName)}
        passengerPhone={String(passengerPhone)}
        passerngerNameHeading={passengerNameHeading}
        passengerPhoneHeading={passengerPhoneHeading}
      />
      {lastRequestTime ? (
        <p className="fs-sm">Refresh: {lastRequestTime}</p>
      ) : (
        <p className="fs-sm">Refresh time: Loading...</p>
      )}
      {!isStopAdded && (
        <Popup
          triggerOnLoad={false}
          popTitle="Confirmation"
          PopUpButtonOpenText={showButtonAddStop}
          popUpText="Are you sure?"
          PopUpButtonText="Yes"
          popVariantButton="secondary"
          secondButtonText="No"
          popupButtonRedClass="secondaryPopup"
          functionpassed={handleAddStop}
        />
      )}
      <div className="mb-20"></div>
      <div style={{ textAlign: "center" }}>
        <Popup
          triggerOnLoad={false}
          popTitle="Confirmation"
          PopUpButtonOpenText={isStopAdded ? showButtonStart : showButtonEnd}
          popUpText="Are you sure?"
          PopUpButtonText="Yes"
          popVariantButton="primary"
          secondButtonText="No"
          popupButtonRedClass="secondaryPopup"
          functionpassed={() => handleAllowLocation(action)}
        />
      </div>
    </>
  );
};

export default Load;
