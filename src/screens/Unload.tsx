import { useState, useEffect, useCallback } from "react";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import HeaderLayout from "../components/HeaderLayout";
import ThemedText from "../components/ThemedText";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import Unauthorized from "./Unauthorized";
import { useParams } from "react-router-dom";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const mapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

const Unload = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const jobData = useSelector(
    (state: RootState) => state.auth.jobData[jobId || ""]
  );
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Get Google Maps API key from environment variable
  const mapsApiKey = import.meta.env.VITE_API_MAPS_KEY;

  // Validate API key is present
  useEffect(() => {
    if (!mapsApiKey) {
      console.warn("VITE_API_MAPS_KEY is not set in environment variables");
      setMapError("Google Maps API key is not configured. Please set VITE_API_MAPS_KEY in your .env file.");
    }
  }, [mapsApiKey]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: mapsApiKey || "",
  });

  // Handle map loading errors
  useEffect(() => {
    if (loadError) {
      console.error("Google Maps loading error:", loadError);
      setMapError("Failed to load Google Maps. Please check your API key configuration.");
    }
  }, [loadError]);

  // Format current date and time to mm/dd/yy hh:mm:ss am/pm format
  const formatCurrentDateTime = (): string => {
    const now = new Date();
    
    // Format date as mm/dd/yy
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const year = String(now.getFullYear()).slice(-2);
    const formattedDate = `${month}/${day}/${year}`;
    
    // Format time as hh:mm:ss am/pm
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, "0");
    const formattedTime = `${formattedHours}:${minutes}:${seconds} ${ampm}`;
    
    return `${formattedDate} ${formattedTime}`;
  };

  // Get user's current location
  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Update location function - hard reloads the page
  const handleUpdateLocation = useCallback(async () => {
    setIsUpdatingLocation(true);
    try {
      // Get current location before reloading
      await getCurrentLocation();
      // Hard reload the page
      window.location.reload();
    } catch (error) {
      console.error("Error getting location:", error);
      setIsUpdatingLocation(false);
      alert("Failed to get your location. Please check your location permissions.");
    }
  }, []);

  // Get initial location on mount (without reloading)
  useEffect(() => {
    if (isLoaded && !userLocation) {
      const fetchInitialLocation = async () => {
        try {
          const location = await getCurrentLocation();
          console.log("Initial location fetched:", location);
          setUserLocation(location);
          
          // Update map center if map is already loaded
          if (map && location) {
            map.setCenter(location);
            map.setZoom(15);
          }
        } catch (error) {
          console.error("Error getting initial location:", error);
        }
      };
      fetchInitialLocation();
    }
  }, [isLoaded, map, userLocation]);

  // Update map center when userLocation changes
  useEffect(() => {
    if (map && userLocation) {
      console.log("Updating map center to:", userLocation);
      map.setCenter(userLocation);
      map.setZoom(15);
    }
  }, [map, userLocation]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    console.log("Map loaded successfully, userLocation:", userLocation); // Debug log
    // If we have a user location, center the map on it
    if (userLocation) {
      mapInstance.setCenter(userLocation);
      mapInstance.setZoom(15);
    }
  }, [userLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!jobData || !jobData?.JData || !jobData?.JHeader) {
    return <Unauthorized message={jobData?.JHeader?.Message} />;
  }

  return (
    <>
      <HeaderLayout 
        screenName="Thanks. Your last job is complete." 
        style={{ marginLeft: "20px", lineHeight: "1.2" }}
      />
      <p className="fs-sm">Last refresh time: {formatCurrentDateTime()}</p>
      
      {/* Page Text on Top */}
      <div
        className="d-flex-cen"
        style={{ flexDirection: "column", gap: "10px", padding: "10px 10px 5px 10px" }}
      >
        <ThemedText
          style={{ fontSize: "26px", fontWeight: "bold", lineHeight: "1.5" }}
          themeText="The dispatcher knows your location and will send you the next job accordingly. Please keep this page open to receive your job."
          classPassed="centertext"
        />
      </div>

      {/* Map Container with Button Overlay */}
      <div style={{ margin: "0 10px 20px 10px", position: "relative" }}>
        {mapError || loadError ? (
          // Fallback: Show static map image if Google Maps fails to load
          <div style={{ position: "relative", ...mapContainerStyle }}>
            {userLocation ? (
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${userLocation.lat},${userLocation.lng}&zoom=15&size=600x400&markers=color:red%7C${userLocation.lat},${userLocation.lng}&key=${mapsApiKey || ""}`}
                alt="Map"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
                onError={() => {
                  // If static map also fails, show error message
                  setMapError("Unable to load map. Please check your internet connection.");
                }}
              />
            ) : (
              <div
                style={{
                  ...mapContainerStyle,
                  backgroundColor: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <p style={{ color: "#d93025", textAlign: "center", padding: "0 20px" }}>
                  {mapError || "Map unavailable"}
                </p>
              </div>
            )}
          </div>
        ) : isLoaded && userLocation ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userLocation}
            zoom={17}
            options={mapOptions}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {/* Default Google Maps red marker at the driver's current location */}
            <MarkerF
              key={`marker-${userLocation.lat}-${userLocation.lng}`}
              position={userLocation}
              title="Your Location"
            />
          </GoogleMap>
        ) : (
          <div
            style={{
              ...mapContainerStyle,
              backgroundColor: "#f0f0f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          >
            <p>Loading map...</p>
          </div>
        )}
        
        {/* Update Location Button as Overlay on Bottom */}
        <button
          type="button"
          className="button"
          onClick={handleUpdateLocation}
          disabled={isUpdatingLocation || !isLoaded}
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 40px)",
            maxWidth: "400px",
            padding: "12px",
            fontSize: "1rem",
            fontWeight: "bold",
            zIndex: 1,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {isUpdatingLocation ? "Updating..." : "Update my location"}
        </button>
      </div>
    </>
  );
};

export default Unload;
