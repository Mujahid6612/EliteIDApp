import { useEffect, useState } from "react";
import { authenticate } from "../services/apiServices";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { setJobData } from "../store/authSlice";
import type { JobApiResponse } from "../types";

// `enablePolling` controls when LOG polling should start.
// This allows IndexScreen to delay LOG calls until after AUTH has succeeded
// and initial job data has been loaded.
export const useAuthRefresh = (enablePolling: boolean) => {
  const dispatch = useDispatch();
  const { jobId } = useParams<{ jobId: string }>();
  const [responseFromLog, setResponseFromLog] = useState(null);

  useEffect(() => {
    if (!jobId || !enablePolling) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;
    let stopPolling = false; // stop further LOG calls after a hard error

    const refreshAuth = async () => {
      if (stopPolling) {
        return;
      }

      try {
        console.log("Refreshing authentication...");
        const response = await authenticate({
          token: jobId,
          actionType: "LOG",
          viewName: "LIVESCREENCALL",
        });

        console.log("[useAuthRefresh] LOG response =", response);
        setResponseFromLog(response);

        // If LOG call succeeds, treat its payload as the canonical job data
        // so screens like JobOffer can render from up-to-date JData even if
        // the initial AUTH call failed or returned an error.
        const actionCode = Number(response?.JHeader?.ActionCode ?? 0);
        console.log("[useAuthRefresh] LOG response ActionCode =", actionCode);
        if (actionCode === 0 && jobId) {
          console.log(
            "[useAuthRefresh] Updating Redux jobData from LOG response for jobId",
            jobId
          );
          dispatch(
            setJobData({
              jobId,
              data: response as JobApiResponse,
            })
          );
        } else if (actionCode > 0) {
          // Hard error (e.g., invalid/expired token, job acknowledged, etc.)
          // No value in continuing to poll LOG – stop the interval.
          console.log(
            "[useAuthRefresh] Stopping LOG polling due to error ActionCode",
            actionCode,
            "message:",
            response?.JHeader?.Message
          );
          stopPolling = true;
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error("Error refreshing authentication", error);
      } 
    };

    refreshAuth(); // Initial call

    intervalId = setInterval(() => {
      refreshAuth();
    }, 50000); // Call every 60 seconds

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      stopPolling = true;
    };
  }, [jobId, dispatch, enablePolling]);

  return responseFromLog;
};