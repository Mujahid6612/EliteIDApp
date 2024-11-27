const extractJobData = (jobData: any) => {
  if (!jobData || !jobData.JData || !jobData.JHeader) {
    return { isValid: false, message: jobData?.JHeader?.Message };
  }

  const jobDetails = jobData.JData[0];
  const headingsData = jobData.JMetaData.Headings;

  return {
    isValid: true,
    jobDetails,
    headingsData,
    JobOffer: jobDetails[0],
    jobIdFromRes: jobDetails[1],
    jobNumber: jobDetails[2] || "",
    reservationDateTime: jobDetails[3],
    pickupAddress: jobDetails[4],
    dropoffAddress: jobDetails[5],
    passengerName: jobDetails[6],
    passengerPhone: jobDetails[7],
    passerngerNameHeading: headingsData[6][1],
    passengerPhoneHeading: headingsData[7][1],
  };
};

export default extractJobData;