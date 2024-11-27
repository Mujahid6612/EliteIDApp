const fetchDeviceType = async () => {
    const userAgent = navigator.userAgent || ""; 
  
    // Check if the userAgent contains Apple device identifiers
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return "Apple"; // iOS devices
    }
  
    // Check if the userAgent contains Android identifiers
    if (/Android/i.test(userAgent)) {
      return "Android"; // Android devices
    }
  
    // Check if the userAgent contains Windows identifiers
    if (/Windows NT/i.test(userAgent)) {
      return "Windows"; // Windows devices
    }
  
    return "Unknown"; // If no match is found, return Unknown
  };
  

  

  const getUserAgent = () => {
    return navigator.userAgent || "Unknown"; // Return the userAgent string or "Unknown" if it's undefined
  };
  
  export { fetchDeviceType, getUserAgent };

  