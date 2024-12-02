
import HeaderLayout from "../components/HeaderLayout";
import JobdetailsHeader from "../components/JobdetailsHeader";
import ThemedText from "../components/ThemedText";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Unauthorized from "./Unauthorized";
import { useLastRequestTime } from "../hooks/useLastRequestTime";
import { getJobDetails } from "../utils/JobDataVal"; // Import the utility function


const Unload = () => {
  const { jobData } = useSelector((state: RootState) => state.auth);
  const lastRequestTime = useLastRequestTime();

  if (!jobData || !jobData?.JData || !jobData?.JHeader) {
    return <Unauthorized message={jobData?.JHeader?.Message} />;
  }
  const { jobOffer, jobIdFromRes, jobNumber } = getJobDetails(jobData);
  return (
    <>
      <HeaderLayout screenName={String(jobOffer)} />
      <JobdetailsHeader JobidPassed={String(jobIdFromRes)} jobNumber={String(jobNumber)} />
      {lastRequestTime ? (
        <p className="fs-sm">Refresh: {lastRequestTime}</p>
      ) : (
        <p className="fs-sm">Refresh time: Loading...</p>
      )}
      <div
        className="d-flex-cen"
        style={{ height: "80vh", flexDirection: "column", gap: "30px" }}
      >
        <ThemedText
          themeText={
            jobData?.JHeader?.Message || "Please keep this window open till you receive your next job from the dispatcher."
          }
          classPassed="centertext"
        />
        <div className="divider"></div>
      </div>
    </>
  );
};

export default Unload;
