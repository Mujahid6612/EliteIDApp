import { useEffect, useState } from "react";
import { authenticate } from "../services/apiServices";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { setJobData } from "../store/authSlice";
import type { JobApiResponse } from "../types";

export const useAuthRefresh = () => {
  const dispatch = useDispatch();
  const { jobId } = useParams<{ jobId: string }>();
  const [responseFromLog, setResponseFromLog] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    const refreshAuth = async () => {
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
        }
      } catch (error) {
        console.error("Error refreshing authentication", error);
      } 
    };

    refreshAuth(); // Initial call

    const intervalId = setInterval(() => {
      refreshAuth();
    }, 50000); // Call every 60 seconds

    return () => clearInterval(intervalId);
  }, [jobId, dispatch]);

  return responseFromLog;
};