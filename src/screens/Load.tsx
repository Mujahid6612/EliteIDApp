import HeaderLayout from "../components/HeaderLayout"
import JobdetailsHeader from "../components/JobdetailsHeader"
import FormatDateCom from "../components/FormatDateCom"
import {PassengerInfo, LocationDetails} from "../components/LocationDetails"
import Spinner from "../components/Spinner"
//import ButtonsComponent from "../components/ButtonsComponent"
import Popup from "../components/Popup"
import {  useParams } from "react-router-dom";
import { useState } from "react";
import Unauthorized from "./Unauthorized";
import { useSelector, useDispatch } from "react-redux";
import {authenticate } from "../services/apiServices";
import { setAuthState } from "../store/authSlice";
import { RootState } from "../store/store";
import { setCurrentView } from "../store/currentViewSlice";
import { useLastRequestTime } from "../hooks/useLastRequestTime";

const Load = () => {
  const dispatch = useDispatch();
  const { jobId } = useParams<{ jobId: string }>();
  const [isStopAdded, setIsStopAdded] = useState(false);
  const lastRequestTime = useLastRequestTime();
  let action = isStopAdded ? "ADD_STOP" : "END";
  
  const handleAddStop = () => {
    setIsStopAdded(true);
  }

  const { jobData } = useSelector(
    (state: RootState) => state.auth
  );

  const handleAllowLocation = async(action: string) => {
    if (!jobId) return;
      try {
        const res = await authenticate({token: jobId, actionType: action, viewName: "LOAD"});
        dispatch(setAuthState(res))
        let currentView = Array.isArray(res?.JData) &&
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
  const showButtonAccept = headingsData[13][1];
  const showButtonReject = headingsData[14][1];

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
      )}
        {!isStopAdded &&
       /* <ButtonsComponent buttonText="ADD STOP" buttonVariant="primary" functionpassed={handleAddStop}/> */
        <Popup
            triggerOnLoad={false}
            popTitle="Confirmation"
            PopUpButtonOpenText={showButtonAccept}
            popUpText="Are you sure ?"
            PopUpButtonText="Yes"
            popVariantButton="secondary"
            secondButtonText="No"
            popupButtonRedClass="secondaryPopup"
            functionpassed={handleAddStop}
          />
       } 
        <div className="mb-20"></div>
      { /*<ButtonsComponent buttonText={isStopAdded ? "Click to Start Ride" : "Click to End Ride"} buttonVariant="primary" functionpassed={handleAllowLocation(action)}/> */}
      <div style={{textAlign: "center"}}>
       {/*<button style={{width: "70%"}} className="button primary" onClick={() => handleAllowLocation(action)}>{ isStopAdded ? "CLICK TO START RIDE" : showButtonReject}</button> */}
       <Popup
        triggerOnLoad={false}
        popTitle="Confirmation"
        PopUpButtonOpenText={isStopAdded ? "CLICK TO START RIDE" :showButtonReject}
        popUpText="Are you sure ?"
        PopUpButtonText="Yes"
        popVariantButton="primary"
        secondButtonText="No"
        popupButtonRedClass="secondaryPopup"
        functionpassed={() =>
          handleAllowLocation(action)
        }
      />
       </div>
    </>
  )
}

export default Load