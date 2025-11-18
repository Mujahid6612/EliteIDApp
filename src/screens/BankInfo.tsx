import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import TextField from "../components/TextField";
import ButtonsComponent from "../components/ButtonsComponent";
import { getBankNameFromRouting } from "../services/bankService";
import { sendBankInfoEmail } from "../services/emailService";
import "../styles/Form.css";

const BankInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountName: "",
    phone: "",
    plateNumber: "",
    accountNumber: "",
    routingNumber: "",
    bankName: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoadingBankName, setIsLoadingBankName] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [basicInfo, setBasicInfo] = useState<{
    firstName?: string;
    lastName?: string;
    cellPhone?: string;
    email?: string;
    plateNumber?: string;
    make?: string;
    model?: string;
    modelYear?: string;
    color?: string;
  } | null>(null);

  useEffect(() => {
    // Load basic info from localStorage
    const savedBasicInfo = localStorage.getItem("basicInfo");
    if (savedBasicInfo) {
      try {
        const parsed = JSON.parse(savedBasicInfo);
        // Check if parsed data has any meaningful values
        const hasData = Object.values(parsed).some(
          (value) => value && String(value).trim() !== ""
        );
        if (hasData) {
          setBasicInfo(parsed);
        }
      } catch (error) {
        console.error("Error parsing saved basic info:", error);
      }
    }

    // Load saved bank info from localStorage if available
    const savedBankInfo = localStorage.getItem("bankInfo");
    if (savedBankInfo) {
      try {
        const parsed = JSON.parse(savedBankInfo);
        setFormData(parsed);
      } catch (error) {
        console.error("Error parsing saved bank info:", error);
      }
    } else {
      // Load account name, phone, and plate number from basic info if bank info doesn't exist
      if (savedBasicInfo) {
        try {
          const parsed = JSON.parse(savedBasicInfo);
          const fullName = `${parsed.firstName} ${parsed.lastName}`.trim();
          setFormData((prev) => ({
            ...prev,
            accountName: fullName,
            phone: parsed.cellPhone || "",
            plateNumber: parsed.plateNumber || "",
          }));
        } catch (error) {
          console.error("Error parsing basic info:", error);
        }
      }
    }
  }, []);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "accountName": {
        if (!value.trim()) return "Account name is required";
        if (value.trim().length < 2)
          return "Account name must be at least 2 characters";
        return "";
      }
      case "phone": {
        // Only validate phone if basic info doesn't exist
        if (!basicInfo) {
          if (!value.trim()) return "Phone is required";
          const phoneDigits = value.replace(/\D/g, "");
          if (phoneDigits.length < 10)
            return "Phone must contain at least 10 digits";
        }
        return "";
      }
      case "plateNumber": {
        // Only validate plate number if basic info doesn't exist
        if (!basicInfo) {
          if (!value.trim()) return "Plate number is required";
          if (value.trim().length < 2)
            return "Plate number must be at least 2 characters";
        }
        return "";
      }
      case "accountNumber": {
        if (!value.trim()) return "Account number is required";
        const accountDigits = value.replace(/\D/g, "");
        if (accountDigits.length < 4)
          return "Account number must contain at least 4 digits";
        if (accountDigits.length > 17)
          return "Account number cannot exceed 17 digits";
        return "";
      }
      case "routingNumber": {
        if (!value.trim()) return "Routing number is required";
        const routingDigits = value.replace(/\D/g, "");
        if (routingDigits.length !== 9)
          return "Routing number must be exactly 9 digits";
        return "";
      }
      case "bankName": {
        if (!value.trim()) return "Bank name is required";
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

  const handleRoutingNumberChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const routingNumber = e.target.value;
    setFormData((prev) => ({
      ...prev,
      routingNumber,
      // Reset bank name when routing number changes so it can be refreshed
      bankName: prev.routingNumber !== routingNumber ? "" : prev.bankName,
    }));

    // Clear routing number error when user starts typing
    if (errors.routingNumber) {
      const error = validateField("routingNumber", routingNumber);
      setErrors((prev) => ({
        ...prev,
        routingNumber: error,
      }));
    }

    // Fetch bank name when routing number is 9 digits (always override with fresh lookup)
    if (routingNumber.replace(/\D/g, "").length === 9) {
      setIsLoadingBankName(true);
      try {
        const bankName = await getBankNameFromRouting(
          routingNumber.replace(/\D/g, "")
        );
        // Always update with the latest bank name for the entered routing number
        setFormData((prev) => ({
          ...prev,
          bankName: bankName || "",
        }));
        // Clear any previous errors
        setErrors((prev) => ({
          ...prev,
          bankName: "",
          routingNumber: "",
        }));
      } catch (error) {
        console.error("Error fetching bank name:", error);
        // Show API error message to user
        const errorMessage = error instanceof Error ? error.message : "Invalid routing number";
        setErrors((prev) => ({
          ...prev,
          routingNumber: errorMessage,
        }));
        // Mark field as touched so error displays
        setTouched((prev) => ({
          ...prev,
          routingNumber: true,
        }));
      } finally {
        setIsLoadingBankName(false);
      }
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

  const handleSubmit = async () => {
    // Prepare submission data - use values from basicInfo if available
    const submissionData = { ...formData };
    if (basicInfo) {
      if (basicInfo.cellPhone) {
        submissionData.phone = basicInfo.cellPhone;
      }
      if (basicInfo.plateNumber) {
        submissionData.plateNumber = basicInfo.plateNumber;
      }
    }

    // Validate with the submission data
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(submissionData).forEach((field) => {
      const error = validateField(
        field,
        submissionData[field as keyof typeof submissionData]
      );
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    if (!isValid) {
      setErrors(newErrors);
      setTouched(
        Object.keys(submissionData).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        )
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await sendBankInfoEmail(submissionData);
      // Store bank info in localStorage after successful submission
      localStorage.setItem("bankInfo", JSON.stringify(submissionData));

      // Check if basic info is already submitted
      const savedBasicInfo = localStorage.getItem("basicInfo");
      if (savedBasicInfo) {
        try {
          const parsed = JSON.parse(savedBasicInfo);
          // Check if basic info has meaningful data
          const hasBasicData = Object.values(parsed).some(
            (value) => value && String(value).trim() !== ""
          );
          if (hasBasicData) {
            // Both forms are submitted, navigate to success screen
            navigate("/success");
            return;
          }
        } catch (error) {
          console.error("Error parsing saved basic info:", error);
        }
      }

      // If basic info is not submitted, navigate to basic info form
      navigate("/basic-info");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <HeaderLayout screenName="Bank Information" />
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

        {/* Basic info box */}
        {basicInfo && (
          <div className="basic-info-box">
            {basicInfo.firstName && basicInfo.lastName && (
              <div className="basic-info-row">
                <span className="basic-info-label">Name:</span>
                <span className="basic-info-value">
                  {basicInfo.firstName} {basicInfo.lastName}
                </span>
              </div>
            )}
            {basicInfo.cellPhone && (
              <div className="basic-info-row">
                <span className="basic-info-label">Phone:</span>
                <span className="basic-info-value">{basicInfo.cellPhone}</span>
              </div>
            )}
            {basicInfo.email && (
              <div className="basic-info-row">
                <span className="basic-info-label">Email:</span>
                <span className="basic-info-value">{basicInfo.email}</span>
              </div>
            )}
            {basicInfo.plateNumber && (
              <div className="basic-info-row">
                <span className="basic-info-label">Plate:</span>
                <span className="basic-info-value">
                  {basicInfo.plateNumber}
                </span>
              </div>
            )}
            {(basicInfo.make || basicInfo.model) && (
              <div className="basic-info-row">
                <span className="basic-info-label">Vehicle:</span>
                <span className="basic-info-value">
                  {basicInfo.make || ""}
                  {basicInfo.model && ` ${basicInfo.model}`}
                  {basicInfo.modelYear && ` ${basicInfo.modelYear}`}
                  {basicInfo.color && ` ${basicInfo.color}`}
                </span>
              </div>
            )}
          </div>
        )}

        {!basicInfo && (
          <div className="basic-info-warning">
            Please complete Basic Information first before submitting bank
            information.
          </div>
        )}

        <p className="form-description">
          To get paid the next day, please provide your bank info.
        </p>

        <TextField
          label="Account Name"
          placeHolderTextInput="John Smith"
          onChange={handleInputChange("accountName")}
          onBlur={handleBlur("accountName")}
          valueTrue={!!formData.accountName}
          value={formData.accountName}
          required
          error={touched.accountName ? errors.accountName : ""}
        />

        {!basicInfo && (
          <>
            <TextField
              label="Phone"
              placeHolderTextInput="(555) 123-4567"
              onChange={handleInputChange("phone")}
              onBlur={handleBlur("phone")}
              valueTrue={!!formData.phone}
              value={formData.phone}
              required
              error={touched.phone ? errors.phone : ""}
            />

            <TextField
              label="Plate Number"
              placeHolderTextInput="ABC1234"
              onChange={handleInputChange("plateNumber")}
              onBlur={handleBlur("plateNumber")}
              valueTrue={!!formData.plateNumber}
              value={formData.plateNumber}
              required
              error={touched.plateNumber ? errors.plateNumber : ""}
            />
          </>
        )}

        <TextField
          label="Account Number"
          placeHolderTextInput="1234567890"
          onChange={handleInputChange("accountNumber")}
          onBlur={handleBlur("accountNumber")}
          valueTrue={!!formData.accountNumber}
          value={formData.accountNumber}
          required
          error={touched.accountNumber ? errors.accountNumber : ""}
        />

        <div className="routing-input-container">
          <TextField
            label="Routing Number"
            placeHolderTextInput="021000021"
            onChange={handleRoutingNumberChange}
            onBlur={handleBlur("routingNumber")}
            valueTrue={!!formData.routingNumber}
            value={formData.routingNumber}
            required
            disabled={isLoadingBankName}
            error={touched.routingNumber ? errors.routingNumber : ""}
          />
          {isLoadingBankName && (
            <div className="loading-indicator">Loading bank name...</div>
          )}
        </div>

        <TextField
          label="Bank Name"
          placeHolderTextInput="Enter bank name"
          onChange={handleInputChange("bankName")}
          onBlur={handleBlur("bankName")}
          valueTrue={!!formData.bankName}
          value={formData.bankName}
          required
          disabled={isLoadingBankName}
          error={touched.bankName ? errors.bankName : ""}
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

export default BankInfo;
