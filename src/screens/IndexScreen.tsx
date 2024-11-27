import  { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../store/store";
import { setAuthState } from "../store/authSlice";
import { setCurrentView } from "../store/currentViewSlice";
import { authenticate } from "../services/apiServices";
import JobOffer from "./JobOffer";
import EnRoute from "./EnRoute";
import OnScene from "./OnScene";
import Load from "./Load";
import Unload from "./Unload";
import CompleteJob from "./CompleteJob";
import RideRejected from "./RideRejected";
import { useAuthRefresh } from "../hooks/useAuthRefresh";
import LocationRequest from "./LocationRequest";
import Spinner from "../components/Spinner";
import Unauthorized from "./Unauthorized";

const IndexScreen = () => {
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt" | null>(null);
  const { jobId } = useParams<{ jobId: string }>();
  const dispatch = useDispatch();
  const { isAuthenticated, jobData  } = useSelector((state: RootState) => state.auth);
  const { currentRoute } = useSelector((state: RootState) => state.currentView);  
  let currentViwe = jobData?.JData?.[0]?.[0]


  useAuthRefresh();

  // Check the location permission status on mount
  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: "geolocation" });
        setLocationPermission(result.state);
      } catch (error) {
        console.error("Error checking geolocation permissions:", error);
      }
    };
    checkLocationPermission();
  }, []);

  const fetchJobData = async () => {
    if (!jobId) return;
    try {
      const res = await authenticate({ token: jobId, actionType: "AUTH", viewName: "AUTH" });
      if (res) {
        dispatch(setAuthState(res));
      }
    } catch (error) {
      console.error("Error fetching job data", error);
    }
  };

  // Fetch job data if necessary, but only after location permission is granted
  useEffect(() => {
    if (locationPermission === "granted" && !isAuthenticated) {
      fetchJobData();
    }
  }, [jobId, isAuthenticated, dispatch, locationPermission]);

  useEffect(() => {
    if (isAuthenticated && currentViwe) {
      //@ts-ignore
      if (currentRoute === currentViwe || currentRoute === "/") {
        //@ts-ignore
        dispatch(setCurrentView(currentViwe));
      }
    }
  }, [isAuthenticated, currentViwe, currentRoute, dispatch]);

  // Location request handler - only called when user clicks the button
  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => setLocationPermission("granted"),
      () => setLocationPermission("denied")
    );
  };

  if (locationPermission === "denied") {
    return <LocationRequest permissionBlockedRes={true} onRequestLocation={requestLocation} />;
  }

  if (locationPermission === "prompt") {
    return <LocationRequest permissionBlockedRes={false} onRequestLocation={requestLocation} />;
  }

  if(jobData?.JHeader?.Message =="Sorry, you cannot view this job. Please ensure you are authorized and accessing it while the job is active. You may close this window now."){
    return <Unauthorized message={jobData?.JHeader.Message} />
  }

  if (!isAuthenticated || jobData?.JHeader == null) {
    return <Spinner functionPassed={fetchJobData} />;
  }
  const getComponentForStatus = (status: string) => {
    switch (status) {
      case "/": return <JobOffer />;
      case "Job Offer": return <JobOffer />;
      case "En-route": return <EnRoute />;
      case "On-scene": return <OnScene />;
      case "Load": return <Load />;
      case "Complete Job": return <CompleteJob />;
      case "Unload": return <Unload />;
      case "Ride Rejected": return <RideRejected />;
      default: return <JobOffer />;
    }
  };

  return getComponentForStatus(currentRoute);
};

export default IndexScreen;



// || jobData?.JHeader == null