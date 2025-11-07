import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import TextField from "../components/TextField";
import ButtonsComponent from "../components/ButtonsComponent";
import { sendBasicInfoEmail } from "../services/emailService";
import "../styles/Form.css";

const BasicInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    cellPhone: "",
    email: "",
    plateNumber: "",
    make: "",
    modelYear: "",
    color: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const handleSubmit = async () => {
    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.cellPhone ||
      !formData.email ||
      !formData.plateNumber ||
      !formData.make ||
      !formData.modelYear ||
      !formData.color
    ) {
      alert("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendBasicInfoEmail(formData);
      // Store form data in localStorage for use in bank info page
      localStorage.setItem("basicInfo", JSON.stringify(formData));
      navigate("/bank-info");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <HeaderLayout screenName="Basic Information" />
      <div className="form-container">
        <button
          className="back-button"
          onClick={() => navigate("/")}
          aria-label="Go back"
        >
          ← Back
        </button>
        <h2 className="form-section-title">Personal Info</h2>
        <TextField
          placeHolderTextInput="First Name"
          onChange={handleInputChange("firstName")}
          valueTrue={!!formData.firstName}
          value={formData.firstName}
        />
        <TextField
          placeHolderTextInput="Last Name"
          onChange={handleInputChange("lastName")}
          valueTrue={!!formData.lastName}
          value={formData.lastName}
        />
        <TextField
          placeHolderTextInput="Cell Phone Number"
          onChange={handleInputChange("cellPhone")}
          valueTrue={!!formData.cellPhone}
          value={formData.cellPhone}
        />
        <TextField
          placeHolderTextInput="eMail Address"
          onChange={handleInputChange("email")}
          valueTrue={!!formData.email}
          value={formData.email}
        />

        <h2 className="form-section-title">Vehicle Info</h2>
        <TextField
          placeHolderTextInput="Plate number"
          onChange={handleInputChange("plateNumber")}
          valueTrue={!!formData.plateNumber}
          value={formData.plateNumber}
        />
        <TextField
          placeHolderTextInput="Make"
          onChange={handleInputChange("make")}
          valueTrue={!!formData.make}
          value={formData.make}
        />
        <TextField
          placeHolderTextInput="Model Year"
          onChange={handleInputChange("modelYear")}
          valueTrue={!!formData.modelYear}
          value={formData.modelYear}
        />
        <TextField
          placeHolderTextInput="Color"
          onChange={handleInputChange("color")}
          valueTrue={!!formData.color}
          value={formData.color}
        />

        <ButtonsComponent
          buttonText={isSubmitting ? "Submitting..." : "Submit"}
          buttonVariant="primary"
          functionpassed={handleSubmit}
          buttonWidth="100%"
        />
      </div>
    </>
  );
};

export default BasicInfo;
