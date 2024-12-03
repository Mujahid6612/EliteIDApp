import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../store/store";
import { setJobData } from "../store/authSlice";
import { setCurrentRoute } from "../store/currentViewSlice";
import { setTokenForJob } from "../store/tokenSlice";
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
  const [retryFailed, setRetryFailed] = useState(false);
  const dispatch = useDispatch();
  const [islogrestricting, setIsLogRestricting] = useState(false);

  // Using job-specific selectors 
  const jobData = useSelector((state: RootState) => state.auth.jobData[jobId || ""]);
  const currentRoute = useSelector((state: RootState) => state.currentView.currentRoutes[jobId || ""]);
  let resfromlogView = useAuthRefresh();
  const [responseFromLog, setResponseFromLog] = useState(resfromlogView);
  useEffect(() => {
    if (resfromlogView) {
      setResponseFromLog(resfromlogView); // Update responseFromLog state
      //@ts-ignore
      responseFromLog?.JHeader?.ActionCode === 1 ? setIsLogRestricting(true) : setIsLogRestricting(false);
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
      const token = jobId; 
      dispatch(setTokenForJob({ jobId, token }));
      const res = await authenticate({ token, actionType: "AUTH", viewName: "AUTH" });
        dispatch(setJobData({ jobId, data: res }));
    } catch (error) {
      console.error("Error fetching job data", error);
    }
  };

  useEffect(() => {
    if (locationPermission === "granted" && !jobData) {
      fetchJobData();
    }
  }, [jobId, jobData, locationPermission, dispatch]);

  useEffect(() => {
    //@ts-ignore
    if (jobData?.JData?.[0]?.[0] && currentRoute !== jobData.JData[0][0]) {
      //@ts-ignore
      dispatch(setCurrentRoute({ jobId: jobId || "", route: jobData.JData[0][0] }));
    }
  }, [jobData, currentRoute, dispatch, jobId]);
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

  if (retryFailed) {
    throw new Error("Unable to fetch job data after multiple attempts.");
  }

  if (jobData?.JHeader?.ActionCode === 1) {
    return <Unauthorized message={jobData?.JHeader?.Message} />;
  }
  //@ts-ignore
  if (responseFromLog?.JHeader?.ActionCode === 1) {
    //@ts-ignore
    return <Unauthorized message={responseFromLog?.JHeader?.Message} />;
  }

  if (!jobData || !jobData.JHeader) {
    return <Spinner functionPassed={fetchJobData} retryInterval={3000} onMaxRetries={() => setRetryFailed(true)} />;
  }

  const getComponentForStatus = (status: string) => {
    switch (status) {
      case "/": return <JobOffer />;
      case "Job Offer": return <JobOffer islogrestricting={islogrestricting}    />;
      case "Job Accepted": return <EnRoute islogrestricting={islogrestricting} />;
      case "On-scene": return <OnScene islogrestricting={islogrestricting} />;
      case "Load": return <Load islogrestricting={islogrestricting} />;
      case "Unload": return <CompleteJob islogrestricting={islogrestricting} />;
      case "Completed": return <Unload />;
      case "Ride Rejected": return <RideRejected  />;
      default: return <JobOffer />;
    }
  };

  return getComponentForStatus(currentRoute || "/");
};

export default IndexScreen;



//import { persistor } from "../store/store";
  /*
  const clearPersistedStateAndResetAuth = () => {
    persistor.purge();
    if (jobId) {
      dispatch(setJobData({ jobId, data: null }));
      dispatch(setCurrentRoute({ jobId, route: "/" }));
    }
  };
  */