import { useEffect } from "react";
import { persistor } from "../store/store";
import HeaderLayout from "../components/HeaderLayout";
import JobdetailsHeader from "../components/JobdetailsHeader";
import ThemedText from "../components/ThemedText";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useDispatch } from "react-redux";
import { setAuthState } from "../store/authSlice";
//import { setCurrentView } from "../store/currentViewSlice";
import { useLastRequestTime } from "../hooks/useLastRequestTime";
import { useState } from "react";
import Unauthorized from "./Unauthorized";

type JobApiResponse = {
  JHeader?: { Message: string };
  JData?: any[]; 
};
const Unload = () => {
  const dispatch = useDispatch();
  const { jobData } = useSelector((state: RootState) => state.auth);
  const lastRequestTime = useLastRequestTime();
  const [localJobData, setLocalJobData] = useState<JobApiResponse | null>(null);
  
  

  useEffect(() => {
    // Clear the persisted state when the component mounts
    if (jobData && jobData?.JHeader) {
      setLocalJobData(jobData);
      if (
        jobData?.JHeader?.Message == "Please keep this window open till you receive your next job from the dispatcher.") {
        const clearPersistedState = () => {
          console.log("Clearing persisted state...");
          persistor.purge();
        };

        clearPersistedState();
        dispatch(setAuthState(null))
        //@ts-ignore
         //dispatch(setCurrentView(null));  
         //cleanup on unmount
        return () => {
          console.log("Component unmounted, clearing persisted state...");
          persistor.purge();
        };
      }
    }
  }, []);


  if (!localJobData || !localJobData?.JData || !localJobData?.JHeader) {
    return <Unauthorized message={jobData?.JHeader?.Message} />;
  }

  const jobDetails = localJobData?.JData?.[0];
  const JobOffer = jobDetails[0];
  const jobIdFromRes = jobDetails[1];
  const jobNumber = jobDetails[2] || "";
  console.log('localjobdata', localJobData);


  return (
    <>
      <HeaderLayout screenName={String(JobOffer)} />
          <JobdetailsHeader
            JobidPassed={String(jobIdFromRes)}
            jobNumber={String(jobNumber)}
          />
      {lastRequestTime ? (
        <p className="fs-sm">Refresh: {lastRequestTime}</p>
      ) : (
        <p className="fs-sm">Refresh time : Loading...</p>
      )}
      <div
        className="d-flex-cen"
        style={{ height: "80vh", flexDirection: "column", gap: "30px" }}
      >
        <ThemedText
          themeText={/*jobData?.JHeader?.Message ? jobData?.JHeader?.Message : */"Please keep this window open till you receive your next job from the dispatcher."}
          classPassed="centertext"
        />
        <div className="divider"></div>
      </div>
    </>
  );
};

export default Unload;
