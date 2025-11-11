import fetchClientIP from "../functions/fetchClientIp";
import { fetchDeviceType, getUserAgent } from "../functions/fetchClientDevice";
import getGPSData from "../functions/fetchGeolcationData";
import axios from "axios";

let lastRequestTime: string | null = null;
const isProd = import.meta.env.VITE_ENV === "prod";

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

  // Convert the object to a JSON string with proper escaping
  const finalPayload = JSON.stringify(actualPayload);
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
    //let responseParsed = JSON.parse(response.data);
    let responseParsed;
    if (response.data) {
      responseParsed = JSON.parse(response.data);
    }
    console.log(
      "Response:++++++++++++++++++++++++++++++++++++++++++++++++++++",
      responseParsed
    );
    console.log(
      "Response:++++++++++++++++++++++++++++++++++++++++++++++++++++",
      responseParsed.JHeader?.ActionCode == 0
    );
    if (response.data) {
      return responseParsed;
    }
  } catch (error: unknown) {
    console.error("Error=================================:", error);
  }
};

export const getLastRequestTime = () => {
  return lastRequestTime;
};
