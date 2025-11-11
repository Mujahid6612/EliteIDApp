import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import LocationRequest from "./LocationRequest";
import Spinner from "../components/Spinner";
import HeaderLayout from "../components/HeaderLayout";

// Fix for default marker icon in react-leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

// Component to update map center when location changes
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const Ping = () => {
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt" | null
  >(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check location permission and fetch location
  useEffect(() => {
    const fetchLocation = async () => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by this browser.");
        setIsLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocationPermission("granted");

          // Fetch address using reverse geocoding
          let address = "Address not available";

          // Try Google Maps Geocoding API first
          const mapsApiKey = import.meta.env.VITE_API_MAPS_KEY;
          if (mapsApiKey) {
            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${mapsApiKey}`
              );
              const data = await response.json();

              if (data.results && data.results.length > 0) {
                address = data.results[0].formatted_address;
              }
            } catch (error) {
              console.error("Error fetching address from Google Maps:", error);
            }
          }

          // Fallback: Use OpenStreetMap Nominatim API
          if (address === "Address not available") {
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                {
                  headers: {
                    "User-Agent": "EliteIDApp",
                  },
                }
              );
              const data = await response.json();

              if (data && data.display_name) {
                address = data.display_name;
              }
            } catch (error) {
              console.error("Error fetching address from OpenStreetMap:", error);
            }
          }

          setLocationData({
            latitude,
            longitude,
            address,
          });
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationPermission("denied");
          } else {
            setLocationPermission("prompt");
          }
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    fetchLocation();
  }, []);

  const requestLocation = () => {
    setLocationPermission(null);
    setIsLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocationPermission("granted");

        // Fetch address
        let address = "Address not available";
        const mapsApiKey = import.meta.env.VITE_API_MAPS_KEY;
        
        if (mapsApiKey) {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${mapsApiKey}`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              address = data.results[0].formatted_address;
            }
          } catch (error) {
            console.error("Error fetching address from Google Maps:", error);
          }
        }

        if (address === "Address not available") {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              {
                headers: {
                  "User-Agent": "EliteIDApp",
                },
              }
            );
            const data = await response.json();
            if (data && data.display_name) {
              address = data.display_name;
            }
          } catch (error) {
            console.error("Error fetching address from OpenStreetMap:", error);
          }
        }

        setLocationData({
          latitude,
          longitude,
          address,
        });
        setIsLoading(false);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission("denied");
        } else {
          setLocationPermission("prompt");
        }
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Show location request screen if permission not granted
  if (locationPermission === "denied" || locationPermission === "prompt") {
    return (
      <LocationRequest
        permissionBlockedRes={locationPermission === "denied"}
        onRequestLocation={requestLocation}
      />
    );
  }

  // Show loading spinner while fetching location
  if (isLoading || !locationData) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        flexDirection: "column",
        gap: "20px"
      }}>
        <Spinner />
        <p className="secoundaru-text" style={{ marginBottom: "44px" }}>Fetching your location...</p>
      </div>
    );
  }

  // Show error if any
  if (error) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        flexDirection: "column",
        padding: "20px",
        textAlign: "center"
      }}>
        <p className="secoundaru-text" style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  const mapCenter: [number, number] = [locationData.latitude, locationData.longitude];

  return (
    <div 
      style={{ 
        height: "100vh", 
        width: "100%", 
        display: "flex",
        flexDirection: "column",
        margin: 0,
        padding: 0
      }}
    >
      {/* Header */}
      <HeaderLayout screenName="Location" />
      
      {/* Full-screen map */}
      <div style={{ flex: 1, position: "relative", width: "100%" }}>
        <MapContainer
          center={mapCenter}
          zoom={15}
          style={{ height: "100%", width: "100%", zIndex: 1 }}
          scrollWheelZoom={true}
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={mapCenter} />
        <Marker position={mapCenter}>
          <Popup>
            <div>
              <strong>Your Location</strong>
              <br />
              {locationData.address}
              <br />
              <small>
                {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
              </small>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Location info overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          padding: "20px",
          paddingBottom: "max(20px, env(safe-area-inset-bottom))",
          zIndex: 1000,
          boxShadow: "0 -4px 8px rgba(0, 0, 0, 0.1)",
          borderTopLeftRadius: "15px",
          borderTopRightRadius: "15px",
          maxHeight: "40vh",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#666",
              margin: "0 0 5px 0",
              fontWeight: "bold",
            }}
          >
            ADDRESS
          </p>
          <p
            className="secoundaru-text"
            style={{
              fontSize: "1rem",
              margin: 0,
              lineHeight: "1.4",
              wordBreak: "break-word",
            }}
          >
            {locationData.address}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "nowrap",
          }}
        >
          <div style={{ flex: "1" }}>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#666",
                margin: "0 0 5px 0",
                fontWeight: "bold",
              }}
            >
              LATITUDE
            </p>
            <p
              className="secoundaru-text"
              style={{
                fontSize: "1rem",
                margin: 0,
                fontFamily: "monospace",
              }}
            >
              {locationData.latitude.toFixed(6)}
            </p>
          </div>

          <div style={{ flex: "1" }}>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#666",
                margin: "0 0 5px 0",
                fontWeight: "bold",
              }}
            >
              LONGITUDE
            </p>
            <p
              className="secoundaru-text"
              style={{
                fontSize: "1rem",
                margin: 0,
                fontFamily: "monospace",
              }}
            >
              {locationData.longitude.toFixed(6)}
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Ping;

