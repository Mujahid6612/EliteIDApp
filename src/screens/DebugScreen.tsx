import React, { useState } from "react";
import axios from "axios";
import { addTimestampParam } from "../utils/addTimestampParam";

interface DebugResponse {
  actionType: string;
  payload: string;
  response: unknown;
  responseStringified: string;
  actionCode: number | null;
  timestamp: string;
}

const DebugScreen: React.FC = () => {
  const [jobId, setJobId] = useState<string>("");
  const [param1, setParam1] = useState<string>("");
  const [param2, setParam2] = useState<string>("");
  const [param3, setParam3] = useState<string>("");
  const [param4, setParam4] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);
  const [responses, setResponses] = useState<DebugResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<DebugResponse | null>(null);

  const isProd = import.meta.env.VITE_ENV === "prod";

  // Separate function to fetch client IP
  const fetchClientIP = async (): Promise<string> => {
    try {
      const response = await fetch(addTimestampParam("https://api.ipify.org?format=json"));
      const data = await response.json();
      return data.ip || "Unknown IP";
    } catch (error) {
      console.error("Error fetching client IP", error);
      return "Unknown IP";
    }
  };

  // Separate function to get device type
  const getDeviceType = (): string => {
    const userAgent = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return "Apple";
    }
    if (/Android/i.test(userAgent)) {
      return "Android";
    }
    if (/Windows NT/i.test(userAgent)) {
      return "Windows";
    }
    return "Unknown";
  };

  // Separate function to get user agent
  const getUserAgent = (): string => {
    return navigator.userAgent || "Unknown";
  };

  // Separate function to get GPS data
  const getGPSData = async () => {
    return new Promise<{
      GPSLatitude: number;
      GPSLongitude: number;
      GPSSpeed: number;
      GPSBearing: number;
    }>((resolve) => {
      if (!navigator.geolocation) {
        return resolve({
          GPSLatitude: 0,
          GPSLongitude: 0,
          GPSSpeed: 0,
          GPSBearing: 0,
        });
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            GPSLatitude: position.coords.latitude || 0,
            GPSLongitude: position.coords.longitude || 0,
            GPSSpeed: position.coords.speed || 0,
            GPSBearing: position.coords.heading || 0,
          });
        },
        () => {
          // Return default values on error
          resolve({
            GPSLatitude: 0,
            GPSLongitude: 0,
            GPSSpeed: 0,
            GPSBearing: 0,
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // Separate function to build payload
  const buildPayload = async (
    actionType: string,
    viewName: string,
    token: string,
    param1?: string,
    param2?: string,
    param3?: string,
    param4?: string
  ) => {
    const clientIP = await fetchClientIP();
    const deviceType = getDeviceType();
    const userAgent = getUserAgent();
    const gpsData = await getGPSData();

    const basePayload = {
      ActionCode: isProd ? "S.ID.ACTION.P" : "S.ID.ACTION",
      ViewName: viewName,
      ClientIP: clientIP,
      JsonReq: {
        JHeader: {
          Client: "ELITE",
          Source: "WebApp",
          Target: "DBAPI",
          DeviceType: deviceType,
          DeviceInfo: userAgent,
          DeviceID: "ABCDEF12-34567890ABCDEF12",
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
          GPSLatitude: gpsData.GPSLatitude,
          GPSLongitude: gpsData.GPSLongitude,
          GPSSpeed: gpsData.GPSBearing, // Note: swapped as per original code
          GPSBearing: gpsData.GPSSpeed, // Note: swapped as per original code
        },
        JMetaData: {},
        JData: {
          p_ACTION: actionType,
          p_AUTH_TOKEN: token,
        },
      },
      Notes: "Debug Test",
    };

    // Add optional params if provided
    if (param1 || param2 || param3 || param4) {
      const jData = basePayload.JsonReq.JData as Record<string, string | undefined>;
      jData.p_PARAM_1 = param1 || undefined;
      jData.p_PARAM_2 = param2 || undefined;
      jData.p_PARAM_3 = param3 || undefined;
      jData.p_PARAM_4 = param4 || undefined;
    }

    // Serialize twice as required by backend
    const objectAsJsonString = JSON.stringify(basePayload);
    const finalPayload = JSON.stringify(objectAsJsonString);

    return { basePayload, finalPayload };
  };

  // Separate function to make API call
  const callProcessRequestAPI = async (
    actionType: string,
    viewName: string,
    token: string,
    param1?: string,
    param2?: string,
    param3?: string,
    param4?: string
  ) => {
    try {
      const { basePayload, finalPayload } = await buildPayload(
        actionType,
        viewName,
        token,
        param1,
        param2,
        param3,
        param4
      );

      const apiUrl = isProd
        ? "https://idapi.eliteny.com/Web/DBAPI/ProcessRequest"
        : "https://dev-idapi.eliteny.com/Web/DBAPI/ProcessRequest";
      const response = await axios.post(
        addTimestampParam(apiUrl),
        finalPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let responseData = response.data;
      if (typeof responseData === "string") {
        try {
          responseData = JSON.parse(responseData);
        } catch {
          // Keep as string if parsing fails
        }
      }

      const actionCode =
        responseData?.JHeader?.ActionCode !== undefined
          ? Number(responseData.JHeader.ActionCode)
          : null;

      return {
        actionType,
        payload: JSON.stringify(basePayload, null, 2),
        response: responseData,
        responseStringified: JSON.stringify(responseData, null, 2),
        actionCode,
        timestamp: new Date().toLocaleString(),
      };
    } catch (error: unknown) {
      let errorResponse: unknown = {
        error: true,
        message: error instanceof Error ? error.message : "Unknown error",
      };

      if (axios.isAxiosError(error) && error.response) {
        errorResponse = error.response.data || errorResponse;
        if (typeof errorResponse === "string") {
          try {
            errorResponse = JSON.parse(errorResponse);
          } catch {
            errorResponse = { error: true, message: errorResponse };
          }
        }
      }

      const actionCode =
        errorResponse &&
        typeof errorResponse === "object" &&
        "JHeader" in errorResponse &&
        errorResponse.JHeader &&
        typeof errorResponse.JHeader === "object" &&
        "ActionCode" in errorResponse.JHeader
          ? Number((errorResponse.JHeader as { ActionCode?: number }).ActionCode)
          : null;

      return {
        actionType,
        payload: JSON.stringify(
          await buildPayload(actionType, viewName, token, param1, param2, param3, param4).then(
            (p) => p.basePayload
          ),
          null,
          2
        ),
        response: errorResponse,
        responseStringified: JSON.stringify(errorResponse, null, 2),
        actionCode,
        timestamp: new Date().toLocaleString(),
      };
    }
  };

  // Handler for action button clicks
  const handleActionClick = async (
    actionType: string,
    viewName: string,
    needsParams: boolean = false
  ) => {
    if (!jobId.trim()) {
      alert("Please enter a Job ID (Token)");
      return;
    }

    setLoading(actionType);
    try {
      const result = await callProcessRequestAPI(
        actionType,
        viewName,
        jobId,
        needsParams ? param1 : undefined,
        needsParams ? param2 : undefined,
        needsParams ? param3 : undefined,
        needsParams ? param4 : undefined
      );

      setResponses((prev) => [result, ...prev]);
      setSelectedResponse(result);
    } catch (error) {
      console.error("Error calling API:", error);
      alert("Error calling API. Check console for details.");
    } finally {
      setLoading(null);
    }
  };

  const actionButtons = [
    { action: "AUTH", viewName: "AUTH", needsParams: false },
    { action: "LOG", viewName: "LIVESCREENCALL", needsParams: false },
    { action: "ACCEPT", viewName: "OFFER", needsParams: false },
    { action: "REJECT", viewName: "OFFER", needsParams: false },
    { action: "ARRIVE", viewName: "ARRIVE", needsParams: false },
    { action: "START", viewName: "ONSCENE", needsParams: false },
    { action: "ADD_STOP", viewName: "LOAD", needsParams: false },
    { action: "END", viewName: "LOAD", needsParams: false },
    { action: "SAVE", viewName: "COMPLETE", needsParams: true },
  ];

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "20px" }}>ProcessRequest API Debug Tool</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Test all ProcessRequest API endpoints. Enter Job ID and click any action button.
      </p>

      {/* Input Form */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Input Parameters</h2>
        <div style={{ display: "grid", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Job ID (Token) *:
            </label>
            <input
              type="text"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              placeholder="Enter job token"
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Param 1 (p_PARAM_1) - Optional:
            </label>
            <input
              type="text"
              value={param1}
              onChange={(e) => setParam1(e.target.value)}
              placeholder="e.g., city/state for SAVE"
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Param 2 (p_PARAM_2) - Optional:
            </label>
            <input
              type="text"
              value={param2}
              onChange={(e) => setParam2(e.target.value)}
              placeholder="e.g., drop-off location for SAVE"
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Param 3 (p_PARAM_3) - Optional:
            </label>
            <input
              type="text"
              value={param3}
              onChange={(e) => setParam3(e.target.value)}
              placeholder="e.g., passenger name for SAVE"
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Param 4 (p_PARAM_4) - Optional:
            </label>
            <input
              type="text"
              value={param4}
              onChange={(e) => setParam4(e.target.value)}
              placeholder="e.g., tolls for SAVE"
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: "30px" }}>
        <h2>Action Buttons</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "10px",
          }}
        >
          {actionButtons.map((btn) => (
            <button
              key={btn.action}
              onClick={() => handleActionClick(btn.action, btn.viewName, btn.needsParams)}
              disabled={loading !== null}
              style={{
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: "bold",
                backgroundColor: loading === btn.action ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading === btn.action ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
            >
              {loading === btn.action ? "Loading..." : btn.action}
            </button>
          ))}
        </div>
      </div>

      {/* Response History */}
      {responses.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <h2>Response History ({responses.length})</h2>
          <div style={{ border: "1px solid #ddd", borderRadius: "6px", overflow: "hidden" }}>
            {responses.map((resp, index) => (
              <div
                key={index}
                style={{
                  borderBottom: index < responses.length - 1 ? "2px solid #ddd" : "none",
                  backgroundColor: selectedResponse === resp ? "#e3f2fd" : "white",
                }}
              >
                <div
                  onClick={() => setSelectedResponse(resp)}
                  style={{
                    padding: "15px",
                    cursor: "pointer",
                    backgroundColor: selectedResponse === resp ? "#e3f2fd" : "#f8f9fa",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontWeight: "bold", fontSize: "16px" }}>{resp.actionType}</span>
                      <span style={{ fontSize: "12px", color: "#666", marginLeft: "10px" }}>
                        {resp.timestamp}
                      </span>
                    </div>
                    <span
                      style={{
                        color: resp.actionCode === 0 ? "green" : resp.actionCode !== null ? "red" : "gray",
                        fontWeight: "bold",
                        fontSize: "16px",
                      }}
                    >
                      ActionCode: {resp.actionCode !== null ? resp.actionCode : "N/A"}
                    </span>
                  </div>
                </div>
                {/* Show response data preview for each call */}
                <div style={{ padding: "15px", backgroundColor: "white", borderTop: "1px solid #eee" }}>
                  <div style={{ marginBottom: "10px" }}>
                    <strong style={{ color: "#28a745" }}>Response Data:</strong>
                  </div>
                  <pre
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "10px",
                      borderRadius: "4px",
                      overflow: "auto",
                      maxHeight: "200px",
                      fontSize: "11px",
                      border: "1px solid #ddd",
                      margin: 0,
                    }}
                  >
                    {resp.responseStringified}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Response Details */}
      {selectedResponse && (
        <div>
          <h2>Detailed View - {selectedResponse.actionType}</h2>
          <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#fff3cd", borderRadius: "6px" }}>
            <strong>Action Code: </strong>
            <span
              style={{
                color: selectedResponse.actionCode === 0 ? "green" : "red",
                fontWeight: "bold",
                fontSize: "20px",
                marginLeft: "10px",
              }}
            >
              {selectedResponse.actionCode !== null ? selectedResponse.actionCode : "N/A"}
            </span>
            {selectedResponse.actionCode === 0 && (
              <span style={{ color: "green", marginLeft: "15px", fontSize: "16px" }}>✓ Success</span>
            )}
            {selectedResponse.actionCode !== null && selectedResponse.actionCode > 0 && (
              <span style={{ color: "red", marginLeft: "15px", fontSize: "16px" }}>✗ Error</span>
            )}
            <div style={{ marginTop: "5px", fontSize: "12px", color: "#666" }}>
              Timestamp: {selectedResponse.timestamp}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Payload */}
            <div>
              <h3 style={{ marginTop: 0, color: "#007bff" }}>
                Request Payload (Stringified JSON)
              </h3>
              <pre
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "6px",
                  overflow: "auto",
                  maxHeight: "600px",
                  fontSize: "12px",
                  border: "1px solid #ddd",
                }}
              >
                {selectedResponse.payload}
              </pre>
            </div>

            {/* Response */}
            <div>
              <h3 style={{ marginTop: 0, color: "#28a745" }}>
                API Response Data (Stringified JSON)
              </h3>
              <pre
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "6px",
                  overflow: "auto",
                  maxHeight: "600px",
                  fontSize: "12px",
                  border: "1px solid #ddd",
                }}
              >
                {selectedResponse.responseStringified}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Environment Info */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#fff3cd",
          borderRadius: "6px",
          fontSize: "12px",
        }}
      >
        <strong>Environment:</strong> {isProd ? "Production" : "Development"} |{" "}
        <strong>API URL:</strong>{" "}
        {isProd
          ? "https://idapi.eliteny.com/Web/DBAPI/ProcessRequest"
          : "https://dev-idapi.eliteny.com/Web/DBAPI/ProcessRequest"}
      </div>
    </div>
  );
};

export default DebugScreen;

