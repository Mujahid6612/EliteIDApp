import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import TextField from "../components/TextField";
import ButtonsComponent from "../components/ButtonsComponent";
import { CAR_YEARS } from "../constants";
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
    model: "",
    modelYear: "",
    color: "Black",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

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
          // Handle migration from old format (makeModel -> make and model)
          // If makeModel exists, try to split it, otherwise use as make
          let make = "";
          let model = "";
          if (parsed.makeModel) {
            const parts = parsed.makeModel.split(/\s+/);
            make = parts[0] || "";
            model = parts.slice(1).join(" ") || "";
          } else if (parsed.make) {
            make = parsed.make;
          }
          if (parsed.model) {
            model = parsed.model;
          }
          
          const migratedData = {
            ...parsed,
            make: make,
            model: model,
            color: parsed.color || "Black",
          };
          setFormData(migratedData);
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
        const alphanumericRegex = /^[A-Za-z0-9]{8}$/;
        if (!alphanumericRegex.test(value.trim())) {
          return "Plate number must be exactly 8 alphanumeric characters";
        }
        return "";
      }
      case "make": {
        if (!value.trim()) return "Make is required";
        return "";
      }
      case "model": {
        if (!value.trim()) return "Model is required";
        return "";
      }
      case "modelYear": {
        if (!value.trim()) return "Car Year is required";
        const year = parseInt(value);
        if (isNaN(year) || year < 2020 || year > 2025) {
          return "Please select a year between 2020 and 2025";
        }
        return "";
      }
      case "color": {
        // Color is optional, no validation needed
        return "";
      }
      default:
        return "";
    }
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = e.target.value;
      
      // Auto-uppercase plate number and limit to 8 alphanumeric characters
      if (field === "plateNumber") {
        value = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
      }
      
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

  const handleSelectBlur = (field: string) => () => {
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

  const handleYearSelect = (year: string) => {
    setFormData((prev) => ({
      ...prev,
      modelYear: year,
    }));
    setIsYearDropdownOpen(false);
    
    // Clear error when user selects
    if (errors.modelYear) {
      const error = validateField("modelYear", year);
      setErrors((prev) => ({
        ...prev,
        modelYear: error,
      }));
    }
    
    // Mark as touched
    setTouched((prev) => ({ ...prev, modelYear: true }));
  };

  const handleYearInputClick = () => {
    setIsYearDropdownOpen(!isYearDropdownOpen);
  };

  const handleYearInputBlur = () => {
    // Delay closing to allow click on dropdown item
    setTimeout(() => {
      setIsYearDropdownOpen(false);
      handleSelectBlur("modelYear")();
    }, 150);
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

  const handleSubmit = () => {
    // Case 1: Data already exists and user is NOT in edit mode → Navigate directly without API call
    if (hasSavedData && !isEditMode) {
      navigate("/payment-options");
      return;
    }

    // Case 2 & 3: User is in edit mode OR first time submission → Validate and save to localStorage
    if (!validateForm()) {
      return;
    }

    // Store form data in localStorage (API will be called on payment submission)
    localStorage.setItem("basicInfo", JSON.stringify(formData));
    setHasSavedData(true);
    setIsEditMode(false);

    // Navigate to payment options screen
    navigate("/payment-options");
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
      { label: "Model", value: formData.model },
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
      </div>
    );
  };


  return (
    <>
      <HeaderLayout screenName="Registration" />
      <div className="form-container">
        <button
          className="back-button"
          onClick={() => navigate("/join-us")}
          aria-label="Go back"
        >
          <span className="back-arrow">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="back-text">Back</span>
        </button>
        
        <h1 className="registration-heading">
          To join our community please provide your personal and vehicle details
        </h1>

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
              placeHolderTextInput="ABC12345"
              onChange={handleInputChange("plateNumber")}
              onBlur={handleBlur("plateNumber")}
              valueTrue={!!formData.plateNumber}
              value={formData.plateNumber}
              required
              error={touched.plateNumber ? errors.plateNumber : ""}
            />
            
            <div className="row-fields">
              <div className="field-make">
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
              </div>
              <div className="field-model">
                <TextField
                  label="Model"
                  placeHolderTextInput="Camry"
                  onChange={handleInputChange("model")}
                  onBlur={handleBlur("model")}
                  valueTrue={!!formData.model}
                  value={formData.model}
                  required
                  error={touched.model ? errors.model : ""}
                />
              </div>
            </div>
            
            <div className="row-fields">
              <div className="field-model-year">
                <div className={`text-field-container outlined-field ${formData.modelYear ? "has-value" : ""} ${touched.modelYear && errors.modelYear ? "has-error" : ""} ${isYearDropdownOpen ? "is-focused" : ""}`}>
                  <div className="dropdown-input-wrapper">
                    <input
                      readOnly
                      className={`primary-text-field dropdown-input ${touched.modelYear && errors.modelYear ? "error-field" : ""}`}
                      value={formData.modelYear || ""}
                      placeholder=""
                      onClick={handleYearInputClick}
                      onBlur={handleYearInputBlur}
                      onFocus={handleYearInputClick}
                      id="car-year"
                      required
                    />
                    <span className="dropdown-arrow">▼</span>
                  </div>
                  <label className="outlined-label" htmlFor="car-year">
                    Car Year
                    <span className="required-asterisk"> *</span>
                  </label>
                  {isYearDropdownOpen && (
                    <div className="dropdown-menu">
                      {CAR_YEARS.map((year) => (
                        <div
                          key={year}
                          className={`dropdown-item ${formData.modelYear === year.toString() ? "selected" : ""}`}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevent input blur before click
                            handleYearSelect(year.toString());
                          }}
                        >
                          {year}
                        </div>
                      ))}
                    </div>
                  )}
                  {touched.modelYear && errors.modelYear && (
                    <span className="error-message" role="alert">
                      {errors.modelYear}
                    </span>
                  )}
                </div>
              </div>
              <div className="field-color">
                <TextField
                  label="Car Color"
                  placeHolderTextInput="Black"
                  onChange={handleInputChange("color")}
                  onBlur={handleBlur("color")}
                  valueTrue={!!formData.color}
                  value={formData.color}
                  error={touched.color ? errors.color : ""}
                />
              </div>
            </div>
          </>
        )}

        <ButtonsComponent
          buttonText="Next"
          buttonVariant="primary"
          functionpassed={handleSubmit}
          buttonWidth="100%"
        />
      </div>
    </>
  );
};

export default BasicInfo;
