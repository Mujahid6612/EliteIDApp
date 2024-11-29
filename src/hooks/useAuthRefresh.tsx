import { useEffect, useState } from "react";
import { authenticate } from "../services/apiServices";  
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

export const useAuthRefresh = () => {
  const dispatch = useDispatch();
  const { jobId } = useParams<{ jobId: string }>();
  const [responseFromLog, setResponseFromLog] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    const refreshAuth = async () => {
      try {
        console.log("Refreshing authentication...");
        const response = await authenticate({ token: jobId, actionType: 'LOG', viewName: 'LIVESCREENCALL' });
        setResponseFromLog(response);
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