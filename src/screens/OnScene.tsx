
import HeaderLayout from "../components/HeaderLayout"
import JobdetailsHeader from "../components/JobdetailsHeader"
import FormatDateCom from "../components/FormatDateCom"
import {PassengerInfo, LocationDetails} from "../components/LocationDetails"
//import ButtonsComponent from "../components/ButtonsComponent"
import Popup from "../components/Popup"
import {  useParams } from "react-router-dom";
import Unauthorized from "./Unauthorized";
import { useSelector, useDispatch } from "react-redux";
import {authenticate } from "../services/apiServices";
import { setAuthState } from "../store/authSlice";
import { RootState } from "../store/store";
import { setCurrentView } from "../store/currentViewSlice";
import { useLastRequestTime } from "../hooks/useLastRequestTime";
import Spinner from "../components/Spinner";

const OnScene = () => {
  const dispatch = useDispatch();
  const lastRequestTime = useLastRequestTime();
  const { jobId } = useParams<{ jobId: string }>();
  const { jobData } = useSelector(
    (state: RootState) => state.auth
  );

  const handleAllowLocation = async() => {
    if (!jobId) return;
      try {
        const res = await authenticate({token: jobId, actionType: 'START', viewName: 'ONSCENE'});
        dispatch(setAuthState(res))
        let currentView = Array.isArray(res?.JData) &&
                  Array.isArray(res.JData[0]) &&
                  res.JData[0][0] !== undefined
                  ? res.JData[0][0]
                  : "On-scene";
        dispatch(setCurrentView(currentView));
      } catch (error) {
        console.error("Error fetching job data", error);
      }
  };

  if(jobData?.JHeader?.Message =="Sorry, you cannot view this job. Please ensure you are authorized and accessing it while the job is active. You may close this window now."){
    return <Unauthorized message={jobData?.JHeader.Message} />
  }

  if (!jobData || !jobData.JData || !jobData.JHeader) {
    return <Spinner functionPassed={handleAllowLocation} />;
  }
   
  const jobDetails = jobData.JData?.[0]
  const headingsData = jobData.JMetaData?.Headings;
  const JobOffer = jobDetails[0];
  const jobIdFromRes = jobDetails[1];
  const jobNumber = jobDetails[2] || "";
  const reservationDateTime = jobDetails[3];
  const pickupAddress = jobDetails[4];
  const dropoffAddress = jobDetails[5];
  const passengerName = jobDetails[6];
  const passengerPhone = jobDetails[7];
  const passerngerNameHeading = headingsData[6][1];
  const passengerPhoneHeading = headingsData[7][1];
  const showButtonAccept = headingsData[12][1];
 // const showButtonReject = headingsData[9][1];

  return (
    <>
         <HeaderLayout screenName={String(JobOffer)} />
          <JobdetailsHeader JobidPassed={String(jobIdFromRes)} jobNumber={String(jobNumber)} />
        <div className="ml-10">
        <FormatDateCom datePassed={String(reservationDateTime)} />
        </div> 
        <LocationDetails pickupAddress={String(pickupAddress)} dropoffAddress={String(dropoffAddress)}/>
          <PassengerInfo  passengerName={String(passengerName)} passengerPhone={String(passengerPhone)} passerngerNameHeading={passerngerNameHeading} passengerPhoneHeading={passengerPhoneHeading} />
          {lastRequestTime ? (
        <p className="fs-sm">Refresh: {lastRequestTime}</p>
      ) : (
        <p className="fs-sm">Refresh time : Loading...</p>
      ) }
       {/*<ButtonsComponent buttonText="Click to Start Ride" buttonVariant="primary" functionpassed={handleAllowLocation}/> */}
       <Popup
            triggerOnLoad={false}
            popTitle="Confirmation"
            PopUpButtonOpenText={showButtonAccept}
            popUpText="Are you sure ?"
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