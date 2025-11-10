import { useState, useEffect } from "react";
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);

  useEffect(() => {
    // Load saved basic info from localStorage if available
    const savedBasicInfo = localStorage.getItem("basicInfo");
    if (savedBasicInfo) {
      try {
        const parsed = JSON.parse(savedBasicInfo);
        // Check if parsed data has any meaningful values
        const hasData = Object.values(parsed).some(
          (value) => value && String(value).trim() !== ""
        );
        if (hasData) {
          setFormData(parsed);
          setHasSavedData(true);
          setIsEditMode(false);
        } else {
          setIsEditMode(true);
        }
      } catch (error) {
        console.error("Error parsing saved basic info:", error);
        setIsEditMode(true);
      }
    } else {
      setIsEditMode(true);
    }
  }, []);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "firstName": {
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2)
          return "First name must be at least 2 characters";
        return "";
      }
      case "lastName": {
        if (!value.trim()) return "Last name is required";
        if (value.trim().length < 2)
          return "Last name must be at least 2 characters";
        return "";
      }
      case "cellPhone": {
        if (!value.trim()) return "Cell phone number is required";
        const phoneRegex = /^[\d\s\-()]+$/;
        if (!phoneRegex.test(value)) return "Please enter a valid phone number";
        const digitsOnly = value.replace(/\D/g, "");
        if (digitsOnly.length < 10)
          return "Phone number must contain at least 10 digits";
        return "";
      }
      case "email": {
        if (!value.trim()) return "Email address is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
          return "Please enter a valid email address";
        return "";
      }
      case "plateNumber": {
        if (!value.trim()) return "Plate number is required";
        return "";
      }
      case "make": {
        if (!value.trim()) return "Make is required";
        return "";
      }
      case "modelYear": {
        if (!value.trim()) return "Year is required";
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1900 || year > currentYear + 1) {
          return `Please enter a valid year between 1900 and ${
            currentYear + 1
          }`;
        }
        return "";
      }
      case "color": {
        if (!value.trim()) return "Color is required";
        return "";
      }
      default:
        return "";
    }
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
      }
    };

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(
      field,
      formData[field as keyof typeof formData]
    );
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(formData).forEach((field) => {
      const error = validateField(
        field,
        formData[field as keyof typeof formData]
      );
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await sendBasicInfoEmail(formData);
      // Store form data in localStorage for use in bank info page
      localStorage.setItem("basicInfo", JSON.stringify(formData));
      setHasSavedData(true);
      setIsEditMode(false);
      
      // Check if bank info is already submitted
      const savedBankInfo = localStorage.getItem("bankInfo");
      if (savedBankInfo) {
        try {
          const parsed = JSON.parse(savedBankInfo);
          // Check if bank info has meaningful data
          const hasBankData = Object.values(parsed).some(
            (value) => value && String(value).trim() !== ""
          );
          if (hasBankData) {
            // Both forms are submitted, navigate to success screen
            navigate("/success");
            return;
          }
        } catch (error) {
          console.error("Error parsing saved bank info:", error);
        }
      }
      
      // If bank info is not submitted, navigate to bank info form
      navigate("/bank-info");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const renderDataTable = () => {
    const dataRows = [
      { label: "First Name", value: formData.firstName },
      { label: "Last Name", value: formData.lastName },
      { label: "Cell Phone", value: formData.cellPhone },
      { label: "Email", value: formData.email },
      { label: "Plate Number", value: formData.plateNumber },
      { label: "Make", value: formData.make },
      { label: "Year", value: formData.modelYear },
      { label: "Color", value: formData.color },
    ];

    return (
      <div className="data-table-container">
        <div className="data-table-header">
          <h2 className="form-section-title">Saved Basic Information</h2>
          <button
            className="edit-icon-button"
            onClick={handleEdit}
            aria-label="Edit information"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                fill="#418cfe"
              />
            </svg>
          </button>
        </div>
        <div className="data-table">
          {dataRows.map((row, index) => (
            <div key={index} className="data-table-row">
              <div className="data-table-label">{row.label}</div>
              <div className="data-table-value">{row.value || "—"}</div>
            </div>
          ))}
        </div>
        <div className="data-table-actions">
          <ButtonsComponent
            buttonText="Continue to Bank Info"
            buttonVariant="primary"
            functionpassed={() => navigate("/bank-info")}
            buttonWidth="100%"
          />
        </div>
      </div>
    );
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
        {hasSavedData && !isEditMode ? (
          renderDataTable()
        ) : (
          <>
            <h2 className="form-section-title">Personal Info</h2>
        <TextField
          label="First Name"
          placeHolderTextInput="John"
          onChange={handleInputChange("firstName")}
          onBlur={handleBlur("firstName")}
          valueTrue={!!formData.firstName}
          value={formData.firstName}
          required
          error={touched.firstName ? errors.firstName : ""}
        />
        <TextField
          label="Last Name"
          placeHolderTextInput="Smith"
          onChange={handleInputChange("lastName")}
          onBlur={handleBlur("lastName")}
          valueTrue={!!formData.lastName}
          value={formData.lastName}
          required
          error={touched.lastName ? errors.lastName : ""}
        />
        <TextField
          label="Cell Phone Number"
          placeHolderTextInput="(212) 555-1234"
          onChange={handleInputChange("cellPhone")}
          onBlur={handleBlur("cellPhone")}
          valueTrue={!!formData.cellPhone}
          value={formData.cellPhone}
          required
          error={touched.cellPhone ? errors.cellPhone : ""}
        />
        <TextField
          label="Email Address"
          placeHolderTextInput="john.smith@email.com"
          onChange={handleInputChange("email")}
          onBlur={handleBlur("email")}
          valueTrue={!!formData.email}
          value={formData.email}
          type="email"
          required
          error={touched.email ? errors.email : ""}
        />

        <h2 className="form-section-title">Vehicle Info</h2>
        <TextField
          label="Plate Number"
          placeHolderTextInput="ABC-1234"
          onChange={handleInputChange("plateNumber")}
          onBlur={handleBlur("plateNumber")}
          valueTrue={!!formData.plateNumber}
          value={formData.plateNumber}
          required
          error={touched.plateNumber ? errors.plateNumber : ""}
        />
        <TextField
          label="Make"
          placeHolderTextInput="Toyota"
          onChange={handleInputChange("make")}
          onBlur={handleBlur("make")}
          valueTrue={!!formData.make}
          value={formData.make}
          required
          error={touched.make ? errors.make : ""}
        />
        <div className="row-fields">
          <div className="field-model-year">
            <TextField
              label="Year"
              placeHolderTextInput="2022"
              onChange={handleInputChange("modelYear")}
              onBlur={handleBlur("modelYear")}
              valueTrue={!!formData.modelYear}
              value={formData.modelYear}
              required
              error={touched.modelYear ? errors.modelYear : ""}
            />
          </div>
          <div className="field-color">
            <TextField
              label="Color"
              placeHolderTextInput="Blue"
              onChange={handleInputChange("color")}
              onBlur={handleBlur("color")}
              valueTrue={!!formData.color}
              value={formData.color}
              required
              error={touched.color ? errors.color : ""}
            />
          </div>
        </div>

        <ButtonsComponent
          buttonText={isSubmitting ? "Submitting..." : "Submit"}
          buttonVariant="primary"
          functionpassed={handleSubmit}
          buttonWidth="100%"
        />
          </>
        )}
      </div>
    </>
  );
};

export default BasicInfo;
