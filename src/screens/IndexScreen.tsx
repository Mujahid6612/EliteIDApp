// Testing NewIndexScreen - rendering the optimized version
import NewIndexScreen from "./NewIndexScreen";

const IndexScreen = () => {
  return <NewIndexScreen />;
};

export default IndexScreen;

/* ============================================
   ORIGINAL INDEXSCREEN CODE (COMMENTED OUT)
   ============================================

import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { RootState } from "../store/store";
import { setJobData, clearJobData } from "../store/authSlice";
import { setCurrentRoute, clearCurrentRoute } from "../store/currentViewSlice";
import { setTokenForJob, clearTokenForJob } from "../store/tokenSlice";
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
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt" | null
  >(null);
  const { jobId } = useParams<{ jobId: string }>();
  const [retryFailed, setRetryFailed] = useState(false);
  const dispatch = useDispatch();
  const [islogrestricting, setIsLogRestricting] = useState(false);
  // Track if AUTH has completed (either success or failure)
  const [authCompleted, setAuthCompleted] = useState(false);

  // Using job-specific selectors
  const jobData = useSelector(
    (state: RootState) => state.auth.jobData[jobId || ""]
  );
  const currentRoute = useSelector(
    (state: RootState) => state.currentView.currentRoutes[jobId || ""]
  );
  // Start LOG polling only after AUTH has succeeded (ActionCode === 0)
  const jobActionCodeForPolling = Number(jobData?.JHeader?.ActionCode ?? 1);
  const shouldStartLogPolling =
    !!jobData && jobActionCodeForPolling === 0;

  const resfromlogView = useAuthRefresh(shouldStartLogPolling);
  const [responseFromLog, setResponseFromLog] = useState(resfromlogView);
  useEffect(() => {
    if (resfromlogView) {
      setResponseFromLog(resfromlogView); // Update responseFromLog state
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      responseFromLog?.JHeader?.ActionCode == 1
        ? setIsLogRestricting(true)
        : setIsLogRestricting(false);
    }
  }, [resfromlogView, responseFromLog]);
  // Check the location permission status on mount
  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        const result = await navigator.permissions.query({
          name: "geolocation",
        });
        setLocationPermission(result.state);
      } catch (error) {
        console.error("Error checking geolocation permissions:", error);
      }
    };
    checkLocationPermission();
  }, []);

  const fetchJobData = useCallback(async () => {
    if (!jobId) return;
    try {
      const token = jobId;
      dispatch(setTokenForJob({ jobId, token }));
      const res = await authenticate({
        token,
        actionType: "AUTH",
        viewName: "AUTH",
      });

      // Always dispatch the response, whether it's success (ActionCode == 0) or error (ActionCode > 0)
      // This ensures error responses are stored and can be displayed by the Unauthorized component
      if (res && res.JHeader) {
        dispatch(setJobData({ jobId, data: res }));
        // Mark AUTH as completed after successful dispatch
        setAuthCompleted(true);
      } else if (res) {
        // If response doesn't have JHeader structure, wrap it
        dispatch(setJobData({ 
          jobId, 
          data: {
            JHeader: {
              ActionCode: 1,
              Message: res.Message || "Unknown error occurred",
              SysVersion: "",
            },
            JMetaData: {
              Headings: [],
            },
            JData: [],
          },
        }));
        setAuthCompleted(true);
      }
    } catch (error) {
      console.error("Error fetching job data", error);
      // Dispatch error response so Unauthorized component can show it
      dispatch(setJobData({ 
        jobId, 
        data: {
          JHeader: {
            ActionCode: 1,
            Message: error instanceof Error ? error.message : "An error occurred while fetching job data",
            SysVersion: "",
          },
          JMetaData: {
            Headings: [],
          },
          JData: [],
        },
      }));
      setAuthCompleted(true);
    }
  }, [jobId, dispatch]);

  // Clear current jobId's data when jobId changes or on mount
  // This ensures fresh data is always fetched and prevents stale data from interfering
  useEffect(() => {
    if (!jobId) return;

    // Clear all data for this jobId from Redux (which will be removed from localStorage on next save)
    dispatch(clearJobData(jobId));
    dispatch(clearCurrentRoute(jobId));
    dispatch(clearTokenForJob(jobId));
    
    // Reset authCompleted to ensure fresh AUTH call
    setAuthCompleted(false);

    console.log(`[IndexScreen] Cleared persisted data for jobId: ${jobId}`);
  }, [jobId, dispatch]);

  useEffect(() => {
    if (locationPermission === "granted" && !jobData && !authCompleted) {
      fetchJobData();
    }
  }, [jobId, jobData, locationPermission, authCompleted, fetchJobData]);

  useEffect(() => {
    if (
      jobData?.JData?.[0]?.[0] &&
      currentRoute !== String(jobData.JData[0][0])
    ) {
      dispatch(
        setCurrentRoute({
          jobId: jobId || "",
          route: String(jobData.JData[0][0]),
        })
      );
    }
  }, [jobData, currentRoute, dispatch, jobId]);
  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => setLocationPermission("granted"),
      () => setLocationPermission("denied")
    );
  };

  if (locationPermission === "denied") {
    return (
      <LocationRequest
        permissionBlockedRes={true}
        onRequestLocation={requestLocation}
      />
    );
  }

  if (locationPermission === "prompt") {
    return (
      <LocationRequest
        permissionBlockedRes={false}
        onRequestLocation={requestLocation}
      />
    );
  }

  if (retryFailed) {
    throw new Error("Unable to fetch job data after multiple attempts.");
  }

  // Normalize AUTH action code - this is the ONLY source of truth for initial screen decision
  const jobActionCode = Number(jobData?.JHeader?.ActionCode ?? 0);

  console.log("[IndexScreen] jobData.JHeader.ActionCode =", jobData?.JHeader?.ActionCode);
  console.log("[IndexScreen] normalized jobActionCode =", jobActionCode);
  console.log("[IndexScreen] authCompleted =", authCompleted);

  // Show loader until AUTH completes (either success or failure)
  if (!authCompleted || !jobData || !jobData.JHeader) {
    return (
      <Spinner
        functionPassed={fetchJobData}
        retryInterval={3000}
        onMaxRetries={() => setRetryFailed(true)}
      />
    );
  }

  // After AUTH completes, decide based ONLY on AUTH result
  // LOG polling is for background updates only, not for initial screen decision
  if (jobActionCode > 0) {
    // AUTH failed - show Unauthorized
    console.log("[IndexScreen] Rendering Unauthorized due to AUTH error", {
      jobActionCode,
      message: jobData?.JHeader?.Message,
    });
    return <Unauthorized message={jobData?.JHeader?.Message} />;
  }

  // AUTH succeeded (ActionCode === 0) - proceed to job screens
  console.log("[IndexScreen] AUTH succeeded; proceeding to job screens.");

  const getComponentForStatus = (status: string) => {
    switch (status) {
      case "/":
        return <JobOffer />;
      case "Job Offer":
        return <JobOffer islogrestricting={islogrestricting} />;
      case "Job Accepted":
      case "On Call":
        return <EnRoute islogrestricting={islogrestricting} />;
      case "On-scene":
      case "On Location":
        return <OnScene islogrestricting={islogrestricting} />;
      case "Load":
      case "P.O.B":
        return <Load islogrestricting={islogrestricting} />;
      case "Unload":
        return <CompleteJob islogrestricting={islogrestricting} />;
      case "Completed":
        return <Unload />;
      case "Ride Rejected":
        return <RideRejected />;
      default:
        return <JobOffer />;
    }
  };

  console.log("currentRoute", currentRoute);

  return getComponentForStatus(currentRoute || "/");
};

export default IndexScreen;
*/

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
