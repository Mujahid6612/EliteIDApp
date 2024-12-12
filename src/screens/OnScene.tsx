import HeaderLayout from "../components/HeaderLayout";
import JobdetailsHeader from "../components/JobdetailsHeader";
import FormatDateCom from "../components/FormatDateCom";
import { PassengerInfo, LocationDetails } from "../components/LocationDetails";
// import ButtonsComponent from "../components/ButtonsComponent";
import Popup from "../components/Popup";
import { useParams } from "react-router-dom";
import Unauthorized from "./Unauthorized";
import { useSelector, useDispatch } from "react-redux";
import { authenticate } from "../services/apiServices";
import { setJobData } from "../store/authSlice";
import { RootState } from "../store/store";
import { setCurrentRoute } from "../store/currentViewSlice";
import { useLastRequestTime } from "../hooks/useLastRequestTime";
import Spinner from "../components/Spinner";
import { getJobDetails } from "../utils/JobDataVal"; // Import the utility function
import { useEffect } from "react";

const OnScene = ({ islogrestricting }: { islogrestricting: boolean }) => {
  const dispatch = useDispatch();
  const lastRequestTime = useLastRequestTime();
  const { jobId } = useParams<{ jobId: string }>();
  const jobData = useSelector((state: RootState) => state.auth.jobData[jobId || ""]);

  const handleAllowLocation = async () => {
    if (!jobId) return;
    try {
      const res = await authenticate({
        token: jobId,
        actionType: "START",
        viewName: "ONSCENE",
      });
      dispatch(setJobData({ jobId, data: res }));
      let currentView =
        Array.isArray(res?.JData) &&
        Array.isArray(res.JData[0]) &&
        res.JData[0][0] !== undefined
          ? res.JData[0][0]
          : "On-scene";
      dispatch(setCurrentRoute({ jobId, route: currentView }));
    } catch (error) {
      console.error("Error fetching job data", error);
    }
  };

  useEffect(() => {
    if (islogrestricting === true) {
      return window.location.reload();
    }
  }, [islogrestricting]);
  
  
  if (Number(jobData?.JHeader?.ActionCode) > 0 ) {
    return <Unauthorized message={jobData?.JHeader?.Message} />;
  }

  if (!jobData || !jobData.JData || !jobData.JHeader) {
    return <Spinner functionPassed={handleAllowLocation} />;
  }

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
    showButtonStart,
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
      <Popup
        triggerOnLoad={false}
        popTitle="Confirmation"
        PopUpButtonOpenText={showButtonStart}
        popUpText="Are you sure?"
        PopUpButtonText="Yes"
        popVariantButton="primary"
        secondButtonText="No"
        popupButtonRedClass="secondaryPopup"
        functionpassed={handleAllowLocation}
      />
    </>
  )
}

export default OnScene