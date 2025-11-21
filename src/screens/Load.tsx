import HeaderLayout from "../components/HeaderLayout";
import JobdetailsHeader from "../components/JobdetailsHeader";
import FormatDateCom from "../components/FormatDateCom";
import { PassengerInfo, LocationDetails } from "../components/LocationDetails";
import Spinner from "../components/Spinner";
// import ButtonsComponent from "../components/ButtonsComponent";
// import Popup from "../components/Popup";
import { useParams } from "react-router-dom";
import { useState } from "react";
import Unauthorized from "./Unauthorized";
import { useSelector, useDispatch } from "react-redux";
import { authenticate } from "../services/apiServices";
import { setJobData } from "../store/authSlice";
import { RootState } from "../store/store";
import { setCurrentRoute } from "../store/currentViewSlice";
import { useLastRequestTime } from "../hooks/useLastRequestTime";
import { getJobDetails, getDisplayTitle } from "../utils/JobDataVal"; // Import the utility function
import { useEffect } from "react";
import SwipeButton from "../components/SwipeButton";

const Load = ({ islogrestricting }: { islogrestricting: boolean }) => {
  const dispatch = useDispatch();
  const { jobId } = useParams<{ jobId: string }>();
  const [isStopAdded, setIsStopAdded] = useState(false);
  const [endingRide, setEndingRide] = useState(false);
  const lastRequestTime = useLastRequestTime();
  //let action = isStopAdded ? "ADD_STOP" : "END";
  const action = "END";

  const handleAddStop = () => {
    setIsStopAdded(true);
    handleAllowLocation("ADD_STOP");
  };

  const jobData = useSelector(
    (state: RootState) => state.auth.jobData[jobId || ""]
  );

  const handleAllowLocation = async (action: string) => {
    setEndingRide(true);
    if (!jobId) return;
    try {
      const res = await authenticate({
        token: jobId,
        actionType: action,
        viewName: "LOAD",
      });
      dispatch(setJobData({ jobId, data: res }));
      const currentView =
        Array.isArray(res?.JData) &&
        Array.isArray(res.JData[0]) &&
        res.JData[0][0] !== undefined
          ? res.JData[0][0]
          : "On-scene";
      setIsStopAdded(false);
      dispatch(setCurrentRoute({ jobId, route: currentView }));
      setEndingRide(false);
    } catch (error) {
      console.error("Error fetching job data", error);
    } finally {
      setEndingRide(false);
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
  } = getJobDetails(jobData);

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
        <SwipeButton
          text="Add stop"
          onSwipeComplete={handleAddStop}
          type="danger"
          showSwipeArrow={true}
        />
      )}
      <div className="mb-20"></div>
      <div style={{ textAlign: "center" }}>
        {/* <Popup
          triggerOnLoad={false}
          popTitle="Confirmation"
          PopUpButtonOpenText={isStopAdded ? showButtonStart : showButtonEnd}
          popUpText="Are you sure?"
          PopUpButtonText="Yes"
          popVariantButton="primary"
          secondButtonText="No"
          popupButtonRedClass="secondaryPopup"
          functionpassed={() => handleAllowLocation(action)}
        /> */}
        <SwipeButton
          text={isStopAdded ? "Start Trip" : "End Trip"}
          onSwipeComplete={() => handleAllowLocation(action)}
          disabled={endingRide}
          loading={endingRide}
        />
      </div>
    </>
  );
};

export default Load;
