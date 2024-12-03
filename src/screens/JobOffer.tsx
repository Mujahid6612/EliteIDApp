import  { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import Popup from "../components/Popup";
import ThemedText from "../components/ThemedText";
import JobdetailsHeader from "../components/JobdetailsHeader";
import FormatDateCom from "../components/FormatDateCom";
import { PassengerInfo, LocationDetails } from "../components/LocationDetails";
import Logo from "../components/Logo";
import MainMessage from "../components/MainMessage";
import ThemedList from "../components/ThemedList";
import Unauthorized from "./Unauthorized";
import { useSelector, useDispatch } from "react-redux";
import { authenticate } from "../services/apiServices";
import { setJobData } from "../store/authSlice";
import { RootState } from "../store/store";
import { setCurrentRoute } from "../store/currentViewSlice";
import { useLastRequestTime } from "../hooks/useLastRequestTime";
import Spinner from "../components/Spinner";
import { getJobDetails } from "../utils/JobDataVal";

interface Props {
  islogrestricting?: boolean;
}
const JobOffer= ({ islogrestricting }: Props) => {
  const dispatch = useDispatch();
  const lastRequestTime = useLastRequestTime();
  const { jobId } = useParams<{ jobId: string }>();

  const [isJobCame, setIsJobCame] = useState(false);
  const [permissionBlockedRes, setPermissionBlockedRes] = useState(false);
  const [titleToPass, setTitleToPass] = useState(
    "Please Allow location permissions for this app on the next page"
  );
  // Use job-specific selectors
  const jobData = useSelector((state: RootState) => state.auth.jobData[jobId || ""]);

  // Automatically request location on component mount
  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (!permissionBlockedRes) {
      setIsJobCame(true);
    }
  }, [permissionBlockedRes]);

  const handleAllowLocation = async () => {
    if (!jobId) return;
    try {
      const res = await authenticate({
        token: jobId,
        actionType: "ACCEPT",
        viewName: "OFFER",
      });
      
      dispatch(setJobData({ jobId, data: res }));
      let currentViwe = res.JData?.[0]?.[0];
      console.log("currentViwe-----------------------------", currentViwe);
      dispatch(setCurrentRoute({ jobId, route: currentViwe }));
    } catch (error) {
      console.error("Error fetching job data", error);
    }
  };

  const handleRejectJob = async () => {
    if (!jobId) return;
    try {
      const res = await authenticate({
        token: jobId,
        actionType: "REJECT",
        viewName: "OFFER",
      });
      if(res){
      let currentViwe = res.JData?.[0]?.[0];
      console.log("currentViwe-----------------------------", currentViwe);
      dispatch(setJobData({ jobId, data: res }));
      dispatch(setCurrentRoute({ jobId, route: currentViwe }));
      }
    } catch (error) {
      console.error("Error fetching job data", error);
    }
  };

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Location granted:", position);
      },
      (error) => {
        console.error("Location permission denied:", error);
        setPermissionBlockedRes(true);
        setTitleToPass("Welcome to Driver App");
      }
    );
  };

  useEffect(() => {
    if (islogrestricting === true) {
      return window.location.reload();
    }
  }, [islogrestricting]);

  if(jobData?.JHeader?.ActionCode === 1 || jobData?.JHeader?.ActionCode === 5){
    return <Unauthorized message={jobData?.JHeader.Message} />
  }

  // Handle the case where no job data is found
  if (!jobData || !jobData.JData || !jobData.JHeader) {
    return <Spinner functionPassed={handleAllowLocation} />;
  }

  // Fetch job details using the utility function to avoid hard-coded indexes
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
    showButtonAccept,
    showButtonReject,
  } = getJobDetails(jobData);

  if (permissionBlockedRes) {
    return (
      <div>
        <Logo logoWidth="full-logo" />
        <MainMessage title={titleToPass} />
        <ThemedText
          classPassed="lefttext"
          themeText="Sorry. You blocked the location permission. Please follow the steps below to remove the block. Otherwise, you won't be able to use this app."
        />
        <ThemedList
          list={[
            "Go to settings.",
            "Locate this app.",
            "Enable location access.",
          ]}
        />
        <Popup
          triggerOnLoad={true}
          popTitle="Welcome to Driver App"
          popUpText="Thanks. Please keep this app open at all times to get jobs notification. Dispatcher might sign you off if job notifications cannot reach you."
          PopUpButtonText="Ok"
        />
      </div>
    );
  }
  return (
    <div>
      {isJobCame ? (
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
            passerngerNameHeading={String(passengerNameHeading)}
            passengerPhoneHeading={String(passengerPhoneHeading)}
          />

          {lastRequestTime ? (
            <p className="fs-sm">Refresh: {lastRequestTime}</p>
          ) : (
            <p className="fs-sm">Refresh time : Loading...</p>
          )}
          <Popup
            triggerOnLoad={false}
            popTitle="Confirmation"
            PopUpButtonOpenText={showButtonAccept}
            popUpText="Are you sure, you want to accept the ride ?"
            PopUpButtonText="Yes"
            popVariantButton="primary"
            secondButtonText="No"
            popupButtonRedClass="secondaryPopup"
            functionpassed={handleAllowLocation}
          />
          <Popup
            triggerOnLoad={false}
            popTitle="Confirmation"
            PopUpButtonOpenText={showButtonReject}
            popUpText="Are you sure, you want to reject the ride ?"
            PopUpButtonText="Yes"
            popVariantButton="secondary"
            secondButtonText="No"
            popupButtonRedClass="secondaryPopup"
            functionpassed={handleRejectJob}
          />
          <Popup
            triggerOnLoad={true}
            popTitle="Welcome to Driver App"
            popUpText="Thanks. Please keep this app open at all times to get jobs notification. Dispatcher might sign you off if job notifications cannot reach you."
            PopUpButtonText="Ok"
          />
        </>
      ) : (
        <div>
          <h1>Waiting for job offer to arrive</h1>
          <ThemedText
            themeText="We are unable to find a job recommended for you at this time. Please keep this app open. Dispatcher might sign you off if you switch screens."
            classPassed="centertext"
          />
        </div>
      )}
    </div>
  );
};

export default JobOffer;
