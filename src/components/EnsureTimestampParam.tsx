import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { addTimestampParam } from "../utils/addTimestampParam";

/**
 * Component that ensures the ts parameter is always present in the URL
 * This handles both initial page loads and direct URL navigation
 * Excludes the root "/" path to allow redirects to work properly
 */
const EnsureTimestampParam = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Skip processing for root path - let the Navigate component handle the redirect
    if (location.pathname === "/") {
      return;
    }

    const searchParams = new URLSearchParams(location.search);
    
    // Check if ts parameter already exists
    if (!searchParams.has("ts")) {
      // Build the full URL with pathname and existing search params
      const currentUrl = location.pathname + (location.search || "");
      // Add ts parameter to the current URL
      const newUrl = addTimestampParam(currentUrl);
      // Use replace to avoid adding to history and prevent redirect loops
      navigate(newUrl, { replace: true });
    }
  }, [location.pathname, location.search, navigate]);

  return <>{children}</>;
};

export default EnsureTimestampParam;

