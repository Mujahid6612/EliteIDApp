import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import Popup from "../components/Popup";
import ThemedText from "../components/ThemedText";
import JobdetailsHeader from "../components/JobdetailsHeader";
import FormatDateCom from "../components/FormatDateCom";
import { PassengerInfo, LocationDetails } from "../components/LocationDetails";
//import ButtonsComponent from "../components/ButtonsComponent";
import Logo from "../components/Logo";
import MainMessage from "../components/MainMessage";
import ThemedList from "../components/ThemedList";
import Unauthorized from "./Unauthorized";
import { useSelector, useDispatch } from "react-redux";
import { authenticate } from "../services/apiServices";
import { setAuthState } from "../store/authSlice";
import { RootState } from "../store/store";
import { setCurrentView } from "../store/currentViewSlice";
//import { SwipeableButton } from "react-swipeable-button";
import { useLastRequestTime } from "../hooks/useLastRequestTime";
import Spinner from "../components/Spinner";


[];
const JobOffer: React.FC = () => {
  const dispatch = useDispatch();
  const lastRequestTime = useLastRequestTime();
  const { jobId } = useParams<{ jobId: string }>();

  const [isJobCame, setIsJobCame] = useState(false);
  const [permissionBlockedRes, setPermissionBlockedRes] = useState(false);
  const [titleToPass, setTitleToPass] = useState(
    "Please Allow location permissions for this app on the next page"
  );
  const { jobData } = useSelector((state: RootState) => state.auth);

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
      dispatch(setAuthState(res));
      let currentViwe = res.JData?.[0]?.[0];
      console.log("currentViwe", currentViwe);
      dispatch(setCurrentView(currentViwe));
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
      //dispatch(setAuthState(res))
      let currentViwe = res.JData?.[0]?.[0];
      dispatch(setCurrentView(currentViwe));
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
  const dropoffAddress = jobDetails[5];
  const passengerName = jobDetails[6];
  const passengerPhone = jobDetails[7];
  const passerngerNameHeading = headingsData[6][1];
  const passengerPhoneHeading = headingsData[7][1];
  const showButtonAccept = headingsData[8][1];
  const showButtonReject = headingsData[9][1];

    //  [The above Part can be reused in all components if we make a helper function] 

  if (permissionBlockedRes) {
    return (
      <div>
        <Logo logoWidth="full-logo" />
        <MainMessage title={titleToPass} />
        <ThemedText
          classPassed="lefttext"
          themeText="Sorry. You blocked the location permission. Please follow the steps below to remove the block. Otherwise, you won't be able to use this app."
        />
         <ThemedList list={["Go to settings.", "Locate this app.", "Enable location access."]} />
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
          <HeaderLayout screenName={String(JobOffer)} />
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
            passerngerNameHeading={passerngerNameHeading}
            passengerPhoneHeading={passengerPhoneHeading}
          />
            {lastRequestTime ? (
        <p className="fs-sm">Refresh: {lastRequestTime}</p>
      ) : (
        <p className="fs-sm">Refresh time : Loading...</p>
      )}
          {/* <SwipeableButton /> 
          <div style={{ marginTop: "20px", marginBottom: "50px" , width: "70%", margin: "0 auto"}}>
            <SwipeableButton
              onSuccess={onSuccess}
              onFailure={onFailure}
              text={showButtonAccept}
              text_unlocked="Loading..."
              sliderColor="#003182"
              textColor="#fff"
              sliderTextColor="#fff"
              sliderIconColor="#fff"
              background_color="#418cfe"
              borderRadius={30}
              autoWidth
              disabled={false}
              name="Button comp"
            /> 
          </div>
          */}
          {/*
          <ButtonsComponent
            buttonText={showButtonAccept}
            buttonVariant="primary"
            functionpassed={handleAllowLocation}
          />
          */}
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
            themeText="We are unable to find a job recommended for you at this time. Please keep this app open. Dispatcher might sign you off if swtch screens."
            classPassed="centertext"
          />
        </div>
        
      )}
    </div>
  );
};

export default JobOffer;
