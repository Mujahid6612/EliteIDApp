import { addTimestampParam } from "../utils/addTimestampParam";

const fetchClientIP = async () => {
    try {
      const response = await fetch(addTimestampParam("https://api.ipify.org?format=json"));
      const data = await response.json();
      return data.ip || "Unknown IP"; 
    } catch (error) {
      console.error("Error fetching client IP", error);
    }
  };
  
  export default fetchClientIP;
  

  