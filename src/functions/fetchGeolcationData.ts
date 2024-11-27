interface GPSData {
    GPSLatitude: number;
    GPSLongitude: number;
    GPSSpeed: number;
    GPSBearing: number;
  }
  
const getGPSData = async (): Promise<GPSData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        return reject("Geolocation is not supported by this browser.");
      }
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude || 0;
          const longitude = position.coords.longitude || 0;
          const speed = position.coords.speed || 0; // (0 if unavailable)
          const bearing = position.coords.heading || 0; 
  
          // Return the GPS data
          resolve({
            GPSLatitude: latitude,
            GPSLongitude: longitude,
            GPSSpeed: speed,
            GPSBearing: bearing,
          });
        },
        (error) => {
          reject(`Error getting geolocation: ${error.message}`);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };
  
  export default getGPSData;
  