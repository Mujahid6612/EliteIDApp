import HeaderLayout from "../components/HeaderLayout";
import JobdetailsHeader from "../components/JobdetailsHeader";
import FormatDateCom from "../components/FormatDateCom";
import { PassengerInfo, LocationDetails } from "../components/LocationDetails";
// import ButtonsComponent from "../components/ButtonsComponent";
import Spinner from "../components/Spinner";
import { useParams } from "react-router-dom";
import Unauthorized from "./Unauthorized";
import { useSelector, useDispatch } from "react-redux";
import { authenticate } from "../services/apiServices";
import { setJobData } from "../store/authSlice";
import { RootState } from "../store/store";
import { setCurrentRoute } from "../store/currentViewSlice";
import Popup from "../components/Popup";
import { useLastRequestTime } from "../hooks/useLastRequestTime";
import { getJobDetails } from "../utils/JobDataVal"; // Assuming you import this utility
import { useEffect } from "react";
import { textMapper } from "../functions/text-mapper";

interface Props {
  islogrestricting: boolean;
}
const EnRoute = ({ islogrestricting }: Props) => {
  const dispatch = useDispatch();
  const { jobId } = useParams<{ jobId: string }>();
  const lastRequestTime = useLastRequestTime();
  const jobData = useSelector(
    (state: RootState) => state.auth.jobData[jobId || ""]
  );

  const handleAllowLocation = async () => {
    if (!jobId) return;
    try {
      const res = await authenticate({
        token: jobId,
        actionType: "ARRIVE",
        viewName: "ARRIVE",
      });
      dispatch(setJobData({ jobId, data: res }));
      const currentView = res.JData?.[0]?.[0];
      dispatch(setCurrentRoute({ jobId, route: currentView }));
    } catch (error) {
      console.error("Error fetching job data", error);
    }
  };

  if (Number(jobData?.JHeader?.ActionCode) > 0) {
    return <Unauthorized message={jobData?.JHeader?.Message} />;
  }

  if (!jobData || !jobData.JData || !jobData.JHeader) {
    return <Spinner functionPassed={handleAllowLocation} />;
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (islogrestricting === true) {
      return window.location.reload();
    }
  }, [islogrestricting]);
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
    showButtonArrive,
  } = getJobDetails(jobData);

  console.log("showButtonArrive", showButtonArrive);

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
      {/* <ButtonsComponent buttonText="Click to Arrive" buttonVariant="primary" functionPassed={handleAllowLocation} /> */}
      <Popup
        triggerOnLoad={false}
        popTitle="Confirmation"
        PopUpButtonOpenText={textMapper(String(showButtonArrive))}
        popUpText="Are you sure?"
        PopUpButtonText="Yes"
        popVariantButton="primary"
        secondButtonText="No"
        popupButtonRedClass="secondaryPopup"
        functionpassed={handleAllowLocation}
      />
    </>
  );
};

export default EnRoute;
