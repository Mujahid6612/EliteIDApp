import { useEffect, useState, useRef } from "react";
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
import LocationRequest from "./LocationRequest";
// import LocationPermissionInstructions from "./LocationPermissionInstructions"; // Commented out - instructions screen removed
import IndexScreenLoader from "../components/IndexScreenLoader";
import Unauthorized from "./Unauthorized";
import type { JobApiResponse } from "../types";
import { normalizeErrorMessage } from "../utils/normalizeErrorMessage";

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 3000;
const LOG_POLLING_INTERVAL = 50000;

const NewIndexScreen = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const dispatch = useDispatch();
  
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt" | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authResponse, setAuthResponse] = useState<JobApiResponse | null>(null);
  const [isLogRestricting, setIsLogRestricting] = useState(false);
  
  const hasCalledAuthRef = useRef(false);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logPollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const jobData = useSelector(
    (state: RootState) => state.auth.jobData[jobId || ""]
  );
  const currentRoute = useSelector(
    (state: RootState) => state.currentView.currentRoutes[jobId || ""]
  );

  // Clear job data on mount or when jobId changes
  useEffect(() => {
    if (!jobId) return;

    dispatch(clearJobData(jobId));
    dispatch(clearCurrentRoute(jobId));
    dispatch(clearTokenForJob(jobId));
  }, [jobId, dispatch]);

  // Check location permission on mount
  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        const result = await navigator.permissions.query({
          name: "geolocation",
        });
        setLocationPermission(result.state);
      } catch {
        setLocationPermission("prompt");
      }
    };
    checkLocationPermission();
  }, []);

  // Call AUTH API once when location is granted (debounced)
  useEffect(() => {
    if (!jobId || locationPermission !== "granted" || hasCalledAuthRef.current) {
      return;
    }

    const callAuthAPI = async (): Promise<void> => {
      try {
        dispatch(setTokenForJob({ jobId, token: jobId }));
        
        const response = await authenticate({
          token: jobId,
          actionType: "AUTH",
          viewName: "AUTH",
        });

        if (response?.JHeader) {
          const actionCode = Number(response.JHeader.ActionCode ?? 0);
          
          if (actionCode === 0) {
            // Success - stop loading and set response
            dispatch(setJobData({ jobId, data: response }));
            setAuthResponse(response);
            setIsLoading(false);
            hasCalledAuthRef.current = true;
            
            // Set current route from JData
            const route = response.JData?.[0]?.[0] 
              ? String(response.JData[0][0]) 
              : "/";
            dispatch(setCurrentRoute({ jobId, route }));
          } else {
            // API returned error - retry if attempts remaining
            if (retryCountRef.current < MAX_RETRY_ATTEMPTS - 1) {
              retryCountRef.current += 1;
              retryTimeoutRef.current = setTimeout(() => {
                callAuthAPI();
              }, RETRY_DELAY);
            } else {
              // Max retries reached - show error
              dispatch(setJobData({ jobId, data: response }));
              setAuthResponse(response);
              setIsLoading(false);
              hasCalledAuthRef.current = true;
            }
          }
        } else if (response) {
          // Response without JHeader structure
          const errorResponse: JobApiResponse = {
            JHeader: {
              ActionCode: 1,
              Message: (response as { Message?: string }).Message || "Unknown error occurred",
              SysVersion: "",
            },
            JMetaData: { Headings: [] },
            JData: [],
          };
          
          if (retryCountRef.current < MAX_RETRY_ATTEMPTS - 1) {
            retryCountRef.current += 1;
            retryTimeoutRef.current = setTimeout(() => {
              callAuthAPI();
            }, RETRY_DELAY);
          } else {
            dispatch(setJobData({ jobId, data: errorResponse }));
            setAuthResponse(errorResponse);
            setIsLoading(false);
            hasCalledAuthRef.current = true;
          }
        }
      } catch (error) {
        // Network/request error - retry if attempts remaining
        const errorResponse: JobApiResponse = {
          JHeader: {
            ActionCode: 1,
            Message:  (error as Error)?.message || "An error occurred while fetching job data",
            SysVersion: "",
          },
          JMetaData: { Headings: [] },
          JData: [],
        };

        if (retryCountRef.current < MAX_RETRY_ATTEMPTS - 1) {
          retryCountRef.current += 1;
          retryTimeoutRef.current = setTimeout(() => {
            callAuthAPI();
          }, RETRY_DELAY);
        } else {
          dispatch(setJobData({ jobId, data: errorResponse }));
          setAuthResponse(errorResponse);
          setIsLoading(false);
          hasCalledAuthRef.current = true;
        }
      }
    };

    hasCalledAuthRef.current = true;
    retryCountRef.current = 0;
    callAuthAPI();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
    };
  }, [jobId, locationPermission, dispatch]);

  // Update current route when jobData changes
  useEffect(() => {
    if (jobData?.JData?.[0]?.[0] && currentRoute !== String(jobData.JData[0][0])) {
      dispatch(
        setCurrentRoute({
          jobId: jobId || "",
          route: String(jobData.JData[0][0]),
        })
      );
    }
  }, [jobData, currentRoute, dispatch, jobId]);

  // Start LOG polling after AUTH succeeds (ActionCode === 0)
  useEffect(() => {
    if (!jobId || !authResponse) return;
    
    const actionCode = Number(authResponse?.JHeader?.ActionCode ?? 1);
    if (actionCode !== 0) return;

    const pollLog = async () => {
      try {
        const response = await authenticate({
          token: jobId,
          actionType: "LOG",
          viewName: "LIVESCREENCALL",
        });

        const logActionCode = Number(response?.JHeader?.ActionCode ?? 0);
        
        if (logActionCode === 0 && jobId) {
          dispatch(setJobData({ jobId, data: response as JobApiResponse }));
          setIsLogRestricting(false);
        } else if (logActionCode > 0) {
          setIsLogRestricting(true);
          if (logPollingIntervalRef.current) {
            clearInterval(logPollingIntervalRef.current);
            logPollingIntervalRef.current = null;
          }
        }
      } catch {
        setIsLogRestricting(true);
      }
    };

    pollLog();
    logPollingIntervalRef.current = setInterval(pollLog, LOG_POLLING_INTERVAL);

    return () => {
      if (logPollingIntervalRef.current) {
        clearInterval(logPollingIntervalRef.current);
        logPollingIntervalRef.current = null;
      }
    };
  }, [jobId, authResponse, dispatch]);

  const requestLocation = () => {
    navigator.geolocation.getCurrentPosition(
      () => setLocationPermission("granted"),
      () => setLocationPermission("denied")
    );
  };

  // Show location request screens
  if (locationPermission === "denied") {
    return (
      <LocationRequest
        permissionBlockedRes={true}
        onRequestLocation={requestLocation}
      />
    );
  }

  // Skip instructions screen - go directly to location permission request
  // Show LocationRequest directly when permission is "prompt"
  if (locationPermission === "prompt") {
    return (
      <LocationRequest
        permissionBlockedRes={false}
        onRequestLocation={requestLocation}
      />
    );
  }

  // Show loader while checking location permission or calling API
  if (locationPermission === null || isLoading || !authResponse) {
    return <IndexScreenLoader />;
  }

  // Check if AUTH failed
  // Use jobData from Redux (same as old IndexScreen) instead of authResponse state
  const jobActionCode = Number(jobData?.JHeader?.ActionCode ?? 0);
  if (jobActionCode > 0) {
    // Normalize error message using helper function (same approach as old IndexScreen)
    const normalizedMessage = normalizeErrorMessage(jobData?.JHeader?.Message);
    return <Unauthorized message={normalizedMessage} />;
  }

  // AUTH succeeded - show appropriate screen based on current route
  const getComponentForStatus = (status: string) => {
    switch (status) {
      case "/":
        return <JobOffer />;
      case "Job Offer":
        return <JobOffer islogrestricting={isLogRestricting} />;
      case "Job Accepted":
      case "On Call":
        return <EnRoute islogrestricting={isLogRestricting} />;
      case "On-scene":
      case "On Location":
        return <OnScene islogrestricting={isLogRestricting} />;
      case "Load":
      case "P.O.B":
        return <Load islogrestricting={isLogRestricting} />;
      case "Unload":
        return <CompleteJob islogrestricting={isLogRestricting} />;
      case "Completed":
        return <Unload />;
      case "Ride Rejected":
        return <RideRejected />;
      default:
        return <JobOffer />;
    }
  };

  return getComponentForStatus(currentRoute || "/");
};

export default NewIndexScreen;

