import HeaderLayout from "../components/HeaderLayout";
import JobdetailsHeader from "../components/JobdetailsHeader";
import ThemedText from "../components/ThemedText";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
//import { useEffect, useState } from "react";
//import { persistor } from "../store/store";
//import { useDispatch } from "react-redux";
//import { setAuthState } from "../store/authSlice";
import Unauthorized from "./Unauthorized";
import { useLastRequestTime } from "../hooks/useLastRequestTime";
import { getJobDetails, getDisplayTitle } from "../utils/JobDataVal"; // Import the utility function
import { useParams } from "react-router-dom";

const RideRejected = () => {
  //const dispatch = useDispatch();
  const { jobId } = useParams<{ jobId: string }>();
  const lastRequestTime = useLastRequestTime();
  const jobData = useSelector((state: RootState) => state.auth.jobData[jobId || ""]);

  if (Number(jobData?.JHeader?.ActionCode) > 0 ) {
    return <Unauthorized message={jobData?.JHeader?.Message} />;
  }
  
  if (!jobData || !jobData?.JData || !jobData?.JHeader) {
    return <Unauthorized message={jobData?.JHeader?.Message} />;
  }

  const { jobOffer, jobIdFromRes, jobNumber } = getJobDetails(jobData);

  return (
    <>
      <HeaderLayout screenName={getDisplayTitle(String(jobOffer))} />
      <JobdetailsHeader JobidPassed={String(jobIdFromRes)} jobNumber={String(jobNumber)} />
      {lastRequestTime ? (
        <p className="fs-sm">Refresh: {lastRequestTime}</p>
      ) : (
        <p className="fs-sm">Refresh time: Loading...</p>
      )}
      <div className="d-flex-cen " style={{ height: "80vh", flexDirection: "column", gap: "30px" }}>
        <ThemedText themeText="The ride has been rejected. You may close this window now." classPassed="centertext" />
        <div className="divider"></div>
      </div>
    </>
  );
};

export default RideRejected;
