import { useState, useEffect } from "react";
import Logo from "../components/Logo";
import MainMessage from "../components/MainMessage";
import ThemedText from "../components/ThemedText";
import ThemedList from "../components/ThemedList";
import ButtonsComponent from "../components/ButtonsComponent";
import LocationImage from "../assets/images/locationImage.jpg";
import { fetchDeviceType } from "../functions/fetchClientDevice";

interface LocationRequestProps {
  permissionBlockedRes: boolean;
  onRequestLocation: () => void;
}

const LocationRequest = ({ permissionBlockedRes, onRequestLocation }: LocationRequestProps) => {
  const [deviceType, setDeviceType] = useState<string>("Unknown");
  const [instructionList, setInstructionList] = useState<string[]>([]);
  console.log("LocationRequest deviceType.", deviceType);
  
  const refreshwindow = () => {
    window.location.reload();
  }

  // Automatically trigger location request when component mounts (if not blocked)
  useEffect(() => {
    if (!permissionBlockedRes) {
      // Automatically prompt for location permission when this screen appears
      onRequestLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    // Fetch device type and update state
    const getDeviceType = async () => {
      const type = await fetchDeviceType();
      setDeviceType(type);
    
      // Update instruction list based on device type
      let instructions: string[] = [];
      if (type === "Android") {
        instructions = [
          "Open the browser app you're using (e.g., Chrome, Firefox).",
          "Tap the three-dot menu (usually in the top-right corner).",
          "Select *Settings* from the dropdown.",
          "Scroll down and tap on *Site Settings*.",
          "Tap *Location* and check if *Elite* is listed under blocked sites.",
          "If blocked, tap on *Elite* and change the permission to *Allow*.",
          "Refresh the Elite website or click on continue to apply the changes."
        ];
      } else if (type === "Apple") {
        instructions = [
          "Open the browser app you're using (e.g., Safari, Chrome).",
          "For Safari: Open the device *Settings* app and scroll down to *Safari*.",
          "Tap on *Location* under the *Settings for Websites* section.",
          "Look for *Elite* in the list of websites. Change the permission to *Allow* or *Ask Every Time*.",
          "For Chrome: Tap the three-dot menu, go to *Settings*, then *Site Settings*.",
          "Tap *Location* and ensure *Elite* is not blocked. Change it to *Allow*.",
          "Reload the Elite website in your browser or click on continue to apply the changes."
        ];
      } else if (type === "Windows") {
        instructions = [
          "Open the browser you're using (e.g., Edge, Chrome, Firefox).",
          "Go to the browser's settings (e.g., Chrome: three-dot menu > *Settings*).",
          "In the settings, locate *Privacy and Security* and then select *Site Settings*.",
          "Scroll down to *Location* and look for *Elite* under blocked sites.",
          "If blocked, click on *Elite* and change the permission to *Allow*.",
          "Refresh the Elite website to update location permissions or click on continue."
        ];
      } else {
        instructions = [
          "Open your browser and navigate to its *Settings* or *Preferences*.",
          "Locate the section for *Privacy*, *Security*, or *Permissions*.",
          "Find and select *Location* settings.",
          "Check if *Elite* is listed under blocked sites and unblock it.",
          "Reload the Elite website to activate the changes or click on continue."
        ];
      }
      setInstructionList(instructions);
    };
    

    getDeviceType();
  }, []);

  const handleButtonClick = () => {
    // Retry location request
    onRequestLocation();
  };

  return (
    <div>
      <Logo logoWidth="full-logo" />
      <MainMessage title="Please Allow the location permission" />
      {!permissionBlockedRes && (
        <>
          <div style={{ textAlign: "center" }}>
            <img
              src={LocationImage}
              alt="locationImage"
              style={{ width: "300px", margin: "auto", textAlign: "center", marginTop: "10px" }}
            />
          </div>
          <div style={{ marginTop: "10vh" }}>
            <ButtonsComponent
              buttonText="CONTINUE"
              functionpassed={handleButtonClick}
              buttonVariant="primary"
            />
          </div>
        </>
      )}
      {permissionBlockedRes && (
        <>
          <ThemedText
            classPassed="lefttext"
            themeText="Sorry. You blocked the location permission. Please follow the steps below to remove the block. Otherwise, you won't be able to use this app."
          />
          <ThemedList list={instructionList} />
          <div style={{ marginTop: "15vh" }}>
          <ButtonsComponent
            buttonText="CONTINUE"
            functionpassed={refreshwindow}
            buttonVariant="primary"
          />
          </div>
        </>
      )}
    </div>
  );
};

export default LocationRequest;
