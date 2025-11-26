import Logo from "../components/Logo";
import MainMessage from "../components/MainMessage";
import ThemedText from "../components/ThemedText";
import ButtonsComponent from "../components/ButtonsComponent";
import LocationImage from "../assets/images/locationImage.jpg";

interface LocationPermissionInstructionsProps {
  onContinue: () => void;
}

const LocationPermissionInstructions = ({ onContinue }: LocationPermissionInstructionsProps) => {
  return (
    <div>
      <Logo logoWidth="full-logo" />
      <MainMessage title="Location Permission Required" />
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <img
          src={LocationImage}
          alt="location permission"
          style={{ width: "300px", margin: "auto", textAlign: "center" }}
        />
      </div>
      <ThemedText
        classPassed="centertext"
        themeText="On the next screen, you will be asked to allow location permissions. Please click 'Allow' when prompted to proceed with the app."
      />
      <ThemedText
        classPassed="centertext"
        themeText="Location access is required for this app to function properly and provide you with job notifications."
      />
      <div style={{ marginTop: "10vh" }}>
        <ButtonsComponent
          buttonText="CONTINUE"
          functionpassed={onContinue}
          buttonVariant="primary"
        />
      </div>
    </div>
  );
};

export default LocationPermissionInstructions;

