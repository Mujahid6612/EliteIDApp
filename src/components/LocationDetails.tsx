import locationIcon from "../assets/images/location.jpg";
import Arrow from "../components/Arrow";
import TextField from "../components/TextField";
interface LocationDetailsProps {
  pickupAddress: string;
  dropoffAddress: string;
}
interface PassengerInfoProps {
  passerngerNameHeading: string;
  passengerPhoneHeading: string;
  passengerName: string;
  passengerPhone: string;
}
const LocationDetails = ({
  pickupAddress,
  dropoffAddress,
}: LocationDetailsProps) => {
  return (
    <div className="location-container">
      <div className="location">
        <img src={locationIcon} alt="location-icon" className="location-icon" />
        <div style={{ lineHeight: "1.5" }} className="secoundaru-text">
          {pickupAddress}
        </div>
      </div>
      <Arrow />
      <div className="location">
        <img src={locationIcon} alt="location-icon" className="location-icon" />
        <div style={{ lineHeight: "1.5" }} className="secoundaru-text">
          {dropoffAddress}
        </div>
      </div>
    </div>
  );
};

interface LocationDetailsInputProps {
  pickupAddress: string;
  onDropOfLocationChange: (value: string) => void;
  onCityStateChange: (value: string) => void;
  prefilledDropOfLocation: string;
}

const LocationDetailsInput = ({
  pickupAddress,
  onDropOfLocationChange,
  onCityStateChange,
  prefilledDropOfLocation,
}: LocationDetailsInputProps) => {
  return (
    <div className="location-container">
      <p className="secoundaru-text ">Pickup Address:</p>
      <div className="location">
        <img src={locationIcon} alt="location-icon" className="location-icon" />
        <div style={{ lineHeight: "1.5" }} className="secoundaru-text">
          {pickupAddress}
        </div>
      </div>
      <Arrow />
      <div className="location">
        <img src={locationIcon} alt="location-icon" className="location-icon" />
        <div style={{ flexGrow: 1 }}>
          <p className="secoundaru-text ">Voucher:</p>
          <TextField
            placeHolderTextInput="Voucher"
            valueTrue={false}
            onChange={(e) => onCityStateChange(e.target.value)}
          />
          <p className="secoundaru-text ">Drop Off Address:</p>
          <TextField
            placeHolderTextInput={prefilledDropOfLocation}
            valueTrue={true}
            onChange={(e) => onDropOfLocationChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

const PassengerInfo = ({
  passengerName,
  passengerPhone,
  passerngerNameHeading,
  passengerPhoneHeading,
}: PassengerInfoProps) => {
  return (
    <div className="location-container">
      <div className="d-flex-sb mr-10">
        <p className="secoundaru-text ">{passerngerNameHeading}</p>
        <p className="secoundaru-text fs-sm">{passengerName}</p>
      </div>
      <div className="d-flex-sb mr-10">
        <p className="secoundaru-text">{passengerPhoneHeading}</p>
        <a href="tel:432-123-4455" className="fs-sm">
          {passengerPhone}
        </a>
      </div>
    </div>
  );
};

interface PassengerInfoInputProps {
  passengerName: string;
  onPassengerNameChange: (value: string) => void;
}
const PassengerInfoInput = ({
  passengerName,
  onPassengerNameChange,
}: PassengerInfoInputProps) => {
  return (
    <div className="location-container">
      <div style={{ flexGrow: 1 }}>
        <p className="secoundaru-text ">Passenger Name:</p>
        <TextField
          onChange={(e) => onPassengerNameChange(e.target.value)}
          valueTrue={false}
          placeHolderTextInput={passengerName || "Enter Passenger Name"}
        />
      </div>
    </div>
  );
};

export {
  LocationDetails,
  PassengerInfo,
  PassengerInfoInput,
  LocationDetailsInput,
};
