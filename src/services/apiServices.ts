import fetchClientIP from "../functions/fetchClientIp";
import { fetchDeviceType, getUserAgent } from "../functions/fetchClientDevice";
import getGPSData from "../functions/fetchGeolcationData";
import axios from "axios";

let lastRequestTime: string | null = null;
const isProd = import.meta.env.VITE_ENV === "prod";
const jobAcknowledgedMessage = "Sorry. You can not view this job: Job acknowledged. You may close this browser window now.";
 
/**
 * Sanitizes error messages to replace technical/server errors with user-friendly messages
 */
const sanitizeErrorMessage = (errorMessage: string): string => {
  // List of technical error patterns that should be replaced with user-friendly messages
  const technicalErrorPatterns = [
    {
      pattern: /Value cannot be null/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Parameter name:/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /An error has occurred/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /Invalid response from server/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      pattern: /No data received from server/i,
      replacement: jobAcknowledgedMessage,
    },
    {
      // Handles server-side file locking issues like:
      // "The process cannot access the file ... because it is being used by another process"
      pattern: /process cannot access the file/i,
      replacement: jobAcknowledgedMessage,
    },
  ];

  // Check if the error message matches any technical error pattern
  for (const { pattern, replacement } of technicalErrorPatterns) {
    if (pattern.test(errorMessage)) {
      return replacement;
    }
  }

  // If it's a generic server error or unknown error, return user-friendly message
  if (
    errorMessage.includes("error") ||
    errorMessage.includes("Error") ||
    errorMessage.includes("failed") ||
    errorMessage.includes("Failed") ||
    errorMessage.toLowerCase().includes("exception")
  ) {
    return jobAcknowledgedMessage;
  }

  // Return the original message if it seems user-friendly already
  return jobAcknowledgedMessage;
};

interface ApiProps {
  token: string;
  actionType: string;
  viewName: string;
  dropOfLocationSer?: string; // Optional
  cityStateSer?: string; // Optional
  passegerNameInputSer?: string; // Optional
}

export const authenticate = async function ({
  token,
  actionType,
  viewName,
  dropOfLocationSer,
  cityStateSer,
  passegerNameInputSer,
}: ApiProps) {
  const currentTime = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (actionType) {
    // Store the last request time, we can assign it in success case but for now i think that is good enough
    lastRequestTime = currentTime;
  }

  const clientIP = await fetchClientIP();
  const deviceType = await fetchDeviceType();
  const userAgent = getUserAgent();
  const gpsData = await getGPSData();
  const gpslat = gpsData.GPSLatitude;
  const gpslong = gpsData.GPSLongitude;
  const gpsbearing = gpsData.GPSBearing;
  const gpsspeed = gpsData.GPSSpeed;
  let actualPayload;

  if (!actionType && !token) {
    return {
      StatusCode: 0,
      Message: "Invalid credentials",
    };
  }
  const inpayload = {
    ActionCode: isProd ? "S.ID.ACTION.P" : "S.ID.ACTION",
    ViewName: viewName,
    ClientIP: clientIP,
    JsonReq: {
      JHeader: {
        Client: "ELITE",
        Source: "WebApp",
        Target: "DBAPI",
        DeviceType: deviceType,
        DeviceInfo: userAgent, //NEED TO BE DYNAMIC
        DeviceID: "ABCDEF12-34567890ABCDEF12", //NEED TO BE DYNAMIC RANDION ID
        ViewName: viewName,
        ActionCode: isProd ? "S.ID.ACTION.P" : "S.ID.ACTION",
        ClientVersion: "1.0.0",
        APIVersion: "1.0.0",
        APILogin: "user@webapis.com",
        APIPassword: "12345",
        RequestedURL: isProd
          ? "https://idapi.eliteny.com/Web/DBAPI/ProcessRequest"
          : "https://dev-idapi.eliteny.com/Web/DBAPI/ProcessRequest",
        Debug: "false",
        GPSLatitude: gpslat,
        GPSLongitude: gpslong,
        GPSSpeed: gpsbearing,
        GPSBearing: gpsspeed,
      },
      JMetaData: {},
      JData: {
        p_ACTION: actionType,
        p_AUTH_TOKEN: token,
      },
    },
    Notes: "Test... by Kazim",
  };
  const inpayloadWithLocation = {
    ActionCode: isProd ? "S.ID.ACTION.P" : "S.ID.ACTION",
    ViewName: viewName,
    ClientIP: clientIP,
    JsonReq: {
      JHeader: {
        Client: "ELITE",
        Source: "WebApp",
        Target: "DBAPI",
        DeviceType: deviceType,
        DeviceInfo: userAgent, //NEED TO BE DYNAMIC
        DeviceID: "ABCDEF12-34567890ABCDEF12", //NEED TO BE DYNAMIC RANDION ID
        ViewName: viewName,
        ActionCode: isProd ? "S.ID.ACTION.P" : "S.ID.ACTION",
        ClientVersion: "1.0.0",
        APIVersion: "1.0.0",
        APILogin: "user@webapis.com",
        APIPassword: "12345",
        RequestedURL: isProd
          ? "https://idapi.eliteny.com/Web/DBAPI/ProcessRequest"
          : "https://dev-idapi.eliteny.com/Web/DBAPI/ProcessRequest",
        Debug: "false",
        GPSLatitude: gpslat,
        GPSLongitude: gpslong,
        GPSSpeed: gpsbearing,
        GPSBearing: gpsspeed,
      },
      JMetaData: {},
      JData: {
        p_ACTION: actionType,
        p_AUTH_TOKEN: token,
        p_PARAM_1: cityStateSer,
        p_PARAM_2: dropOfLocationSer,
        p_PARAM_3: passegerNameInputSer,
      },
    },
    Notes: "Test... by Kazim",
  };

  if (dropOfLocationSer && cityStateSer) {
    actualPayload = inpayloadWithLocation;
  } else {
    actualPayload = inpayload;
  }

  /**
   * IMPORTANT:
   * The backend `ProcessRequest` API expects the ENTIRE JSON object
   * as a single JSON string value, e.g.:
   *
   * "{ \"ActionCode\":\"S.ID.ACTION.P\", ... }"
   *
   * That means:
   *  - First we serialize the object → '{"ActionCode":"S.ID.ACTION.P",...}'
   *  - Then we serialize that string again so the HTTP body is:
   *    "{\"ActionCode\":\"S.ID.ACTION.P\",...}"
   *
   * This matches the exact escaped string format required by the API.
   */
  const objectAsJsonString = JSON.stringify(actualPayload);
  const finalPayload = JSON.stringify(objectAsJsonString);

  console.log(
    "Payload:++++++++++++++++++++++++++++++++++++++++++++++++++++",
    finalPayload
  );
  try {
    const response = await axios.post(
      isProd
        ? "https://idapi.eliteny.com/Web/DBAPI/ProcessRequest"
        : "https://dev-idapi.eliteny.com/Web/DBAPI/ProcessRequest",
      finalPayload,
      {
        headers: {
          "Content-Type": "application/json", // Ensure the content type is set correctly
        },
      }
    );
    
    // Check if response status indicates an error
    if (response.status < 200 || response.status >= 300) {
      const rawErrorMessage = typeof response.data === 'string' 
        ? response.data 
        : (response.data as { Message?: string })?.Message || `Server returned status ${response.status}`;
      // Return in the expected format with JHeader structure, with sanitized error message
      return {
        JHeader: {
          ActionCode: 1,
          Message: sanitizeErrorMessage(rawErrorMessage),
          SysVersion: "",
        },
      };
    }
    
    //let responseParsed = JSON.parse(response.data);
    let responseParsed;
    if (response.data) {
      // Check if response.data is already an object (axios may have auto-parsed it)
      if (typeof response.data === 'string') {
        try {
          responseParsed = JSON.parse(response.data);
        } catch {
          // If parsing fails, it's likely an error message, not JSON
          // Return in the expected format with JHeader structure, with sanitized error message
          const rawMessage = response.data || "Invalid response from server";
          return {
            JHeader: {
              ActionCode: 1,
              Message: sanitizeErrorMessage(rawMessage),
              SysVersion: "",
            },
          };
        }
      } else {
        // Already an object, use it directly
        responseParsed = response.data;
      }
    }
    // Ensure responseParsed exists before accessing properties
    if (!responseParsed) {
      return {
        JHeader: {
          ActionCode: 1,
          Message: sanitizeErrorMessage("No data received from server"),
          SysVersion: "",
        },
      };
    }
    
    console.log(
      "Response:++++++++++++++++++++++++++++++++++++++++++++++++++++",
      responseParsed
    );
    console.log(
      "Response:++++++++++++++++++++++++++++++++++++++++++++++++++++",
      responseParsed?.JHeader?.ActionCode == 0
    );
    
    return responseParsed;
  } catch (error: unknown) {
    console.error("Error=================================:", error);
    
    // Handle AxiosError specifically to extract response data
    if (axios.isAxiosError(error) && error.response) {
      const responseData = error.response.data;
      
      // Try to extract error message from response
      if (typeof responseData === 'string') {
        // If it's a plain string error message (like "Value cannot be null. Parameter name: s")
        return {
          JHeader: {
            ActionCode: 1,
            Message: sanitizeErrorMessage(responseData),
            SysVersion: "",
          },
        };
      } else if (typeof responseData === 'object' && responseData !== null) {
        // If it's already an object (like {"Message": "An error has occurred."})
        const rawErrorMessage = (responseData as { Message?: string }).Message || "An error occurred on the server";
        return {
          JHeader: {
            ActionCode: 1,
            Message: sanitizeErrorMessage(rawErrorMessage),
            SysVersion: "",
          },
        };
      }
    }
    
    // Fallback for other error types
    const fallbackMessage = error instanceof Error ? error.message : "An error occurred";
    return {
      JHeader: {
        ActionCode: 1,
        Message: sanitizeErrorMessage(fallbackMessage),
        SysVersion: "",
      },
    };
  }
};

export const getLastRequestTime = () => {
  return lastRequestTime;
};
