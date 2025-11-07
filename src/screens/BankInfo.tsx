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

  useEffect(() => {
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
      // Load account name from basic info if bank info doesn't exist
      const basicInfo = localStorage.getItem("basicInfo");
      if (basicInfo) {
        try {
          const parsed = JSON.parse(basicInfo);
          const fullName = `${parsed.firstName} ${parsed.lastName}`.trim();
          setFormData((prev) => ({
            ...prev,
            accountName: fullName,
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
        if (!value.trim()) return "Phone is required";
        const phoneDigits = value.replace(/\D/g, "");
        if (phoneDigits.length < 10)
          return "Phone must contain at least 10 digits";
        return "";
      }
      case "plateNumber": {
        if (!value.trim()) return "Plate number is required";
        if (value.trim().length < 2)
          return "Plate number must be at least 2 characters";
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
      //   case "bankName": {
      //     if (!value.trim())
      //       return "Bank name is required. Please enter a valid routing number.";
      //     return "";
      //   }
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
      bankName: "", // Clear bank name when routing number changes
    }));

    // Clear routing number error when user starts typing
    if (errors.routingNumber) {
      const error = validateField("routingNumber", routingNumber);
      setErrors((prev) => ({
        ...prev,
        routingNumber: error,
      }));
    }

    // Fetch bank name when routing number is 9 digits
    if (routingNumber.replace(/\D/g, "").length === 9) {
      setIsLoadingBankName(true);
      setTouched((prev) => ({ ...prev, bankName: true }));
      try {
        const bankName = await getBankNameFromRouting(
          routingNumber.replace(/\D/g, "")
        );
        setFormData((prev) => ({
          ...prev,
          bankName: bankName || "",
        }));
        // Validate bank name after fetching
        const bankNameError = validateField("bankName", bankName || "");
        setErrors((prev) => ({
          ...prev,
          bankName: bankNameError,
        }));
      } catch (error) {
        console.error("Error fetching bank name:", error);
        setFormData((prev) => ({
          ...prev,
          bankName: "",
        }));
        setErrors((prev) => ({
          ...prev,
          bankName:
            "Unable to verify routing number. Please check and try again.",
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
      await sendBankInfoEmail(formData);
      // Store bank info in localStorage after successful submission
      localStorage.setItem("bankInfo", JSON.stringify(formData));
      alert("Bank information submitted successfully!");
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
          onClick={() => navigate("/")}
          aria-label="Go back"
        >
          ← Back
        </button>
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
            error={touched.routingNumber ? errors.routingNumber : ""}
          />
          {isLoadingBankName && (
            <div className="loading-indicator">Loading bank name...</div>
          )}
        </div>

        {/* <div className="read-only-field-container">
          <label className="read-only-label">
            Bank Name
            <span className="required-asterisk"> *</span>
          </label>
          <input
            className={`primary-text-field read-only-field ${
              errors.bankName ? "error-field" : ""
            }`}
            type="text"
            value={formData.bankName || ""}
            readOnly
            placeholder="Bank name will appear here"
            required
            aria-invalid={!!errors.bankName}
            aria-describedby={errors.bankName ? "bank-name-error" : undefined}
          />
          {touched.bankName && errors.bankName && (
            <span className="error-message" id="bank-name-error" role="alert">
              {errors.bankName}
            </span>
          )}
        </div> */}

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
