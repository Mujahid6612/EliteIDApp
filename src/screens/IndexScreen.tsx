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
import { persistor } from "../store/store";


const IndexScreen = () => {
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt" | null>(null);
  const { jobId } = useParams<{ jobId: string }>();
  const [retryFailed, setRetryFailed] = useState(false);
  const dispatch = useDispatch();
  const { isAuthenticated, jobData  } = useSelector((state: RootState) => state.auth);
  const { currentRoute } = useSelector((state: RootState) => state.currentView);  
  let currentViwe = jobData?.JData?.[0]?.[0]

  let resfromlogView = useAuthRefresh();

  // Initialize responseFromLog in state
  const [responseFromLog, setResponseFromLog] = useState(resfromlogView);
  console.log("responseFromLog", responseFromLog);

  const clearPersistedStateAndResetAuth = () => {
    console.log("Clearing persisted state...");
    persistor.purge();
    dispatch(setAuthState(null));
    dispatch(setCurrentView("/"));
  };

  useEffect(() => {
    if (resfromlogView) {
      setResponseFromLog(resfromlogView); // Update responseFromLog state
      //@ts-ignore
      responseFromLog?.JHeader?.ActionCode === 1 && clearPersistedStateAndResetAuth();
    }
  }, [resfromlogView, responseFromLog]);

  
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

   // Handle when Spinner exceeds retries
   const handleRetryFailure = () => {
    setRetryFailed(true); // Mark retry as failed
  };

  if (retryFailed) {
    throw new Error("Unable to fetch job data after multiple attempts."); // Throw error for ErrorBoundary
  }

  if(jobData?.JHeader?.ActionCode == 1) {
    return <Unauthorized message={jobData?.JHeader.Message} />
  }
  
  //@ts-ignore
  if(responseFromLog && responseFromLog?.JHeader?.ActionCode == 1) {
    //@ts-ignore
    return <Unauthorized message={responseFromLog?.JHeader.Message} />
  }

  if (!isAuthenticated || jobData?.JHeader == null) {
    return <Spinner
    functionPassed={fetchJobData}
    retryInterval={3000}
    onMaxRetries={handleRetryFailure} // Pass callback to handle max retries
  />;
  }
  console.log("currentRoute", currentRoute);
  const getComponentForStatus = (status: string) => {
    switch (status) {
      case "/": return <JobOffer />;
      case "Job Offer": return <JobOffer />;
      //case "En-route": return <EnRoute />;  /// This was changed thats why it was stuck on same screen and popup was not closing
      case "Job Accepted": return <EnRoute />;
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


