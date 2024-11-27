import { useEffect } from "react";
import { authenticate } from "../services/apiServices";  
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

export const useAuthRefresh = () => {
  const dispatch = useDispatch();
  const { jobId } = useParams<{ jobId: string }>();

  useEffect(() => {
    if (!jobId) return;

    const refreshAuth = async () => {
      try {
        await authenticate({token:  jobId, actionType: 'LOG', viewName:'LIVESCREENCALL'});
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
};
