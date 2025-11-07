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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "firstName": {
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2) return "First name must be at least 2 characters";
        return "";
      }
      case "lastName": {
        if (!value.trim()) return "Last name is required";
        if (value.trim().length < 2) return "Last name must be at least 2 characters";
        return "";
      }
      case "cellPhone": {
        if (!value.trim()) return "Cell phone number is required";
        const phoneRegex = /^[\d\s\-()]+$/;
        if (!phoneRegex.test(value)) return "Please enter a valid phone number";
        const digitsOnly = value.replace(/\D/g, "");
        if (digitsOnly.length < 10) return "Phone number must contain at least 10 digits";
        return "";
      }
      case "email": {
        if (!value.trim()) return "Email address is required";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address";
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
        if (!value.trim()) return "Model year is required";
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1900 || year > currentYear + 1) {
          return `Please enter a valid year between 1900 and ${currentYear + 1}`;
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
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field as keyof typeof formData]);
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
        <TextField
          label="Model Year"
          placeHolderTextInput="2022"
          onChange={handleInputChange("modelYear")}
          onBlur={handleBlur("modelYear")}
          valueTrue={!!formData.modelYear}
          value={formData.modelYear}
          required
          error={touched.modelYear ? errors.modelYear : ""}
        />
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
