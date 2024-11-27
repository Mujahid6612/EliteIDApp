import jobidimg from "../assets/images/jobId.jpg"

interface JobdetailsHeaderProps{
    JobidPassed: string
    jobNumber: string
}
const JobdetailsHeader = ({JobidPassed, jobNumber}: JobdetailsHeaderProps) => {
  return (
    <div className="d-flex-sb mt-10">
    <JobIdWithIcon JobidPassed={JobidPassed}/>
    <RoundedJobNumber jobNumber={jobNumber}/>
    </div>
  )
}

interface JobidPassedProps{ 
  JobidPassed: string
}

const JobIdWithIcon = ({JobidPassed}: JobidPassedProps) => {
  return (
    <div className="d-flex-cen">
    <img src={jobidimg} alt="jobid-image" className="jobid-image" />
    <p className="job-id-passed">{JobidPassed}</p>
    </div>
  )
}

interface RoundedJobNumberProps{
  jobNumber: string
}
const RoundedJobNumber = ({jobNumber}: RoundedJobNumberProps) => {
  return (
    <p className="job-id-passed rounded-border">{`Job:${jobNumber}`}</p>
  )
}
export default JobdetailsHeader