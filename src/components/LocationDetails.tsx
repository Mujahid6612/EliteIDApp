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
  onTollsChange: (value: string) => void;
  onPassengerNameChange?: (value: string) => void;
  prefilledDropOfLocation: string;
  cityState: string;
  dropOfLocation: string;
  tolls: string;
  passengerName?: string;
  passengerNameValue?: string;
}

const LocationDetailsInput = ({
  pickupAddress,
  onDropOfLocationChange,
  onCityStateChange,
  onTollsChange,
  onPassengerNameChange,
  prefilledDropOfLocation,
  cityState,
  dropOfLocation,
  tolls,
  passengerName,
  passengerNameValue,
}: LocationDetailsInputProps) => {
  return (
    <div className="location-container">
      <div className="location">
        <img src={locationIcon} alt="location-icon" className="location-icon" />
        <div style={{ flexGrow: 1, marginTop: "-20px" }}>
          <p className="secoundaru-text" style={{ marginBottom: "4px" }}>
            Pickup Address:
          </p>
          <div style={{ lineHeight: "1.5" }} className="secoundaru-text">
            {pickupAddress}
          </div>
        </div>
      </div>
      <Arrow />
      <div className="location">
        <img src={locationIcon} alt="location-icon" className="location-icon" />
        <div style={{ flexGrow: 1, marginTop: "-50px" }}>
          <p className="secoundaru-text" style={{ marginBottom: "4px" }}>
            Drop Off Address:
          </p>
          <TextField
            placeHolderTextInput={prefilledDropOfLocation || "Drop Off Address"}
            valueTrue={true}
            value={dropOfLocation}
            onChange={(e) => onDropOfLocationChange(e.target.value)}
          />
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        {onPassengerNameChange && (
          <>
            <p
              className="secoundaru-text"
              style={{ marginTop: "8px", marginBottom: "4px" }}
            >
              Passenger Name:
            </p>
            <TextField
              onChange={(e) => onPassengerNameChange(e.target.value)}
              valueTrue={false}
              value={passengerNameValue || ""}
              placeHolderTextInput={passengerName || "Enter Passenger Name"}
            />
          </>
        )}
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <p
            className="secoundaru-text"
            style={{ marginTop: "8px", marginBottom: "4px" }}
          >
            Voucher Number:
          </p>
          <TextField
            placeHolderTextInput="Voucher Number"
            valueTrue={false}
            value={cityState}
            onChange={(e) => onCityStateChange(e.target.value)}
          />
        </div>
        <p
          className="secoundaru-text"
          style={{ marginTop: "8px", marginBottom: "4px" }}
        >
          Tolls:
        </p>
        <TextField
          placeHolderTextInput="Tolls"
          valueTrue={false}
          value={tolls}
          onChange={(e) => onTollsChange(e.target.value)}
        />
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
  passengerNameValue: string;
}
const PassengerInfoInput = ({
  passengerName,
  onPassengerNameChange,
  passengerNameValue,
}: PassengerInfoInputProps) => {
  return (
    <div className="location-container">
      <div style={{ flexGrow: 1 }}>
        <p className="secoundaru-text" style={{ marginBottom: "4px" }}>
          Passenger Name:
        </p>
        <TextField
          onChange={(e) => onPassengerNameChange(e.target.value)}
          valueTrue={false}
          value={passengerNameValue}
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
