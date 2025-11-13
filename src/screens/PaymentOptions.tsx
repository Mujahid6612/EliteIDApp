import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import TextField from "../components/TextField";
import ButtonsComponent from "../components/ButtonsComponent";
import { getBankNameFromRouting } from "../services/bankService";
import { sendPaymentOptionsEmail } from "../services/emailService";
import { PAYMENT_OPTIONS, US_STATES, PICKUP_CHECK_INFO } from "../constants";
import "../styles/Form.css";

const PaymentOptions = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [bankTransferData, setBankTransferData] = useState({
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
  const [isBankNameVerified, setIsBankNameVerified] = useState(false);
  const [routingNumberWarning, setRoutingNumberWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkByMailData, setCheckByMailData] = useState({
    nameOnCheck: "",
    streetNumber: "",
    streetName: "",
    town: "",
    state: "",
    zipCode: "",
  });
  const [checkByMailErrors, setCheckByMailErrors] = useState<Record<string, string>>({});
  const [checkByMailTouched, setCheckByMailTouched] = useState<Record<string, boolean>>({});
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [basicInfo, setBasicInfo] = useState<{
    firstName?: string;
    lastName?: string;
    cellPhone?: string;
    email?: string;
    plateNumber?: string;
    make?: string;
    modelYear?: string;
    color?: string;
  } | null>(null);


  useEffect(() => {
    // Load basic info to pre-fill account name and check if it exists
    const savedBasicInfo = localStorage.getItem("basicInfo");
    let parsedBasicInfo = null;
    
    if (savedBasicInfo) {
      try {
        const parsed = JSON.parse(savedBasicInfo);
        // Check if parsed data has any meaningful values
        const hasData = Object.values(parsed).some(
          (value) => value && String(value).trim() !== ""
        );
        if (hasData) {
          parsedBasicInfo = parsed;
          setBasicInfo(parsed);
          const fullName = `${parsed.firstName || ""} ${parsed.lastName || ""}`.trim();
          if (fullName) {
            setBankTransferData((prev) => ({
              ...prev,
              accountName: fullName,
            }));
            setCheckByMailData((prev) => ({
              ...prev,
              nameOnCheck: fullName,
            }));
          }
        }
      } catch (error) {
        console.error("Error parsing saved basic info:", error);
      }
    }

    // Load saved payment option from localStorage if available
    const savedPaymentOption = localStorage.getItem("paymentOption");
    if (savedPaymentOption) {
      try {
        const parsed = JSON.parse(savedPaymentOption);
        if (parsed.paymentOption) {
          // Restore selected option
          setSelectedOption(parsed.paymentOption);

          // Get basicInfo for merging account names (use parsedBasicInfo from above)
          const basicInfoData = parsedBasicInfo;

          // Restore form data based on payment option type
          if (parsed.paymentOption === "bank-transfer") {
            const fullName = basicInfoData 
              ? `${basicInfoData.firstName || ""} ${basicInfoData.lastName || ""}`.trim()
              : "";
            
            setBankTransferData({
              accountName: parsed.accountName || fullName || "",
              phone: parsed.phone || basicInfoData?.cellPhone || "",
              plateNumber: parsed.plateNumber || basicInfoData?.plateNumber || "",
              accountNumber: parsed.accountNumber || "",
              routingNumber: parsed.routingNumber || "",
              bankName: parsed.bankName || "",
            });
            // Restore verification states if bank name exists
            if (parsed.bankName) {
              setIsBankNameVerified(true);
            }
          } else if (parsed.paymentOption === "check-by-mail") {
            const fullName = basicInfoData 
              ? `${basicInfoData.firstName || ""} ${basicInfoData.lastName || ""}`.trim()
              : "";
            
            setCheckByMailData({
              nameOnCheck: parsed.nameOnCheck || fullName || "",
              streetNumber: parsed.streetNumber || "",
              streetName: parsed.streetName || "",
              town: parsed.town || "",
              state: parsed.state || "",
              zipCode: parsed.zipCode || "",
            });
          }
          // pickup-check doesn't need form data restoration
        }
      } catch (error) {
        console.error("Error parsing saved payment option:", error);
      }
    }

    // Load saved bank info from localStorage if available (legacy support)
    const savedBankInfo = localStorage.getItem("bankInfo");
    if (savedBankInfo && !savedPaymentOption) {
      try {
        const parsed = JSON.parse(savedBankInfo);
        setBankTransferData((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch (error) {
        console.error("Error parsing saved bank info:", error);
      }
    } else if (!savedPaymentOption) {
      // Load phone and plate number from basic info if bank info doesn't exist
      if (savedBasicInfo) {
        try {
          const parsed = JSON.parse(savedBasicInfo);
          setBankTransferData((prev) => ({
            ...prev,
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
        // Remove "(verified)" text for validation
        const cleanValue = value.replace(/\s*\(verified\)\s*$/i, "").trim();
        if (!cleanValue) return "Bank name is required";
        return "";
      }
      default:
        return "";
    }
  };

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setBankTransferData((prev) => ({
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
    const previousRoutingNumber = bankTransferData.routingNumber;
    
    setBankTransferData((prev) => ({
      ...prev,
      routingNumber,
      bankName: previousRoutingNumber !== routingNumber ? "" : prev.bankName,
    }));

    // Reset verification states when routing number changes
    if (previousRoutingNumber !== routingNumber) {
      setIsBankNameVerified(false);
      setRoutingNumberWarning(false);
    }

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
      setRoutingNumberWarning(false);
      try {
        const bankName = await getBankNameFromRouting(
          routingNumber.replace(/\D/g, "")
        );
        if (bankName && bankName.trim() !== "") {
          // Bank name found - mark as verified
          setBankTransferData((prev) => ({
            ...prev,
            bankName: bankName,
          }));
          setIsBankNameVerified(true);
          setRoutingNumberWarning(false);
          setErrors((prev) => ({
            ...prev,
            bankName: "",
            routingNumber: "",
          }));
        } else {
          // Bank name not found - show warning and enable field
          setBankTransferData((prev) => ({
            ...prev,
            bankName: "",
          }));
          setIsBankNameVerified(false);
          setRoutingNumberWarning(true);
          setErrors((prev) => ({
            ...prev,
            routingNumber: "",
          }));
        }
      } catch (error) {
        console.error("Error fetching bank name:", error);
        // Bank name not found - show warning and enable field
        setBankTransferData((prev) => ({
          ...prev,
          bankName: "",
        }));
        setIsBankNameVerified(false);
        setRoutingNumberWarning(true);
        const errorMessage = error instanceof Error ? error.message : "Invalid routing number";
        setErrors((prev) => ({
          ...prev,
          routingNumber: errorMessage,
        }));
        setTouched((prev) => ({
          ...prev,
          routingNumber: true,
        }));
      } finally {
        setIsLoadingBankName(false);
      }
    } else {
      // Reset states if routing number is not 9 digits
      setIsBankNameVerified(false);
      setRoutingNumberWarning(false);
    }
  };

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(
      field,
      bankTransferData[field as keyof typeof bankTransferData]
    );
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const resetBankTransferForm = () => {
    setBankTransferData({
      accountName: basicInfo ? `${basicInfo.firstName || ""} ${basicInfo.lastName || ""}`.trim() : "",
      phone: basicInfo?.cellPhone || "",
      plateNumber: basicInfo?.plateNumber || "",
      accountNumber: "",
      routingNumber: "",
      bankName: "",
    });
    setErrors({});
    setTouched({});
    setIsBankNameVerified(false);
    setRoutingNumberWarning(false);
    setIsLoadingBankName(false);
  };

  const resetCheckByMailForm = () => {
    setCheckByMailData({
      nameOnCheck: basicInfo ? `${basicInfo.firstName || ""} ${basicInfo.lastName || ""}`.trim() : "",
      streetNumber: "",
      streetName: "",
      town: "",
      state: "",
      zipCode: "",
    });
    setCheckByMailErrors({});
    setCheckByMailTouched({});
    setIsStateDropdownOpen(false);
  };

  const validateCheckByMailField = (field: string, value: string): string => {
    switch (field) {
      case "nameOnCheck": {
        if (!value.trim()) return "Name on the Check is required";
        if (value.trim().length < 2)
          return "Name must be at least 2 characters";
        return "";
      }
      case "streetNumber": {
        if (!value.trim()) return "Street # is required";
        return "";
      }
      case "streetName": {
        if (!value.trim()) return "Street Name is required";
        return "";
      }
      case "town": {
        if (!value.trim()) return "Town is required";
        return "";
      }
      case "state": {
        if (!value.trim()) return "State is required";
        return "";
      }
      case "zipCode": {
        if (!value.trim()) return "Zip Code is required";
        const zipDigits = value.replace(/\D/g, "");
        if (zipDigits.length !== 5 && zipDigits.length !== 9)
          return "Zip Code must be 5 or 9 digits";
        return "";
      }
      default:
        return "";
    }
  };

  const handleCheckByMailInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCheckByMailData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (checkByMailErrors[field]) {
        const error = validateCheckByMailField(field, value);
        setCheckByMailErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
      }
    };

  const handleCheckByMailBlur = (field: string) => () => {
    setCheckByMailTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateCheckByMailField(
      field,
      checkByMailData[field as keyof typeof checkByMailData]
    );
    setCheckByMailErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const handleStateSelect = (state: string) => {
    setCheckByMailData((prev) => ({
      ...prev,
      state: state,
    }));
    setIsStateDropdownOpen(false);
    
    // Clear error when user selects
    if (checkByMailErrors.state) {
      const error = validateCheckByMailField("state", state);
      setCheckByMailErrors((prev) => ({
        ...prev,
        state: error,
      }));
    }
    
    // Mark as touched
    setCheckByMailTouched((prev) => ({ ...prev, state: true }));
  };

  const handleStateInputClick = () => {
    setIsStateDropdownOpen(!isStateDropdownOpen);
  };

  const handleStateInputBlur = () => {
    setTimeout(() => {
      setIsStateDropdownOpen(false);
      handleCheckByMailBlur("state")();
    }, 150);
  };

  const isCheckByMailValid = () => {
    if (selectedOption !== "check-by-mail") return true;
    
    const fields = ["nameOnCheck", "streetNumber", "streetName", "town", "state", "zipCode"];
    return fields.every((field) => {
      const value = checkByMailData[field as keyof typeof checkByMailData];
      const error = validateCheckByMailField(field, value);
      return !error && value.trim() !== "";
    });
  };

  const handleOptionChange = (optionId: string) => {
    // If switching away from current option, reset the respective form
    if (selectedOption === "bank-transfer" && optionId !== "bank-transfer") {
      resetBankTransferForm();
    }
    if (selectedOption === "check-by-mail" && optionId !== "check-by-mail") {
      resetCheckByMailForm();
    }
    
    // If switching to an option, reset and pre-fill from basicInfo
    if (optionId === "bank-transfer" && selectedOption !== "bank-transfer") {
      resetBankTransferForm();
    }
    if (optionId === "check-by-mail" && selectedOption !== "check-by-mail") {
      resetCheckByMailForm();
    }
    setSelectedOption(optionId);
  };

  const isBankTransferValid = () => {
    if (selectedOption !== "bank-transfer") return true;
    
    // Prepare submission data - use values from basicInfo if available
    const submissionData = { ...bankTransferData };
    if (basicInfo) {
      if (basicInfo.cellPhone) {
        submissionData.phone = basicInfo.cellPhone;
      }
      if (basicInfo.plateNumber) {
        submissionData.plateNumber = basicInfo.plateNumber;
      }
    }

    // Validate with the submission data
    const fields = ["accountName", "accountNumber", "routingNumber", "bankName"];
    if (!basicInfo) {
      fields.push("phone", "plateNumber");
    }
    
    return fields.every((field) => {
      let value = submissionData[field as keyof typeof submissionData];
      // Remove "(verified)" text for bank name validation
      if (field === "bankName") {
        value = value.replace(/\s*\(verified\)\s*$/i, "").trim();
      }
      const error = validateField(field, value);
      return !error && value.trim() !== "";
    });
  };

  const handleSubmit = async () => {
    if (!selectedOption) {
      alert("Please select a payment option");
      return;
    }

    if (selectedOption === "bank-transfer") {
      // Prepare submission data - use values from basicInfo if available
      const submissionData = { ...bankTransferData };
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

      const fields = ["accountName", "accountNumber", "routingNumber", "bankName"];
      if (!basicInfo) {
        fields.push("phone", "plateNumber");
      }

      fields.forEach((field) => {
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
          fields.reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );
        return;
      }

      // Remove "(verified)" text from bank name before submission
      const cleanSubmissionData = {
        ...submissionData,
        bankName: submissionData.bankName.replace(/\s*\(verified\)\s*$/i, ""),
      };

      // Get basic info from localStorage
      const savedBasicInfo = localStorage.getItem("basicInfo");
      let basicInfoData = null;
      if (savedBasicInfo) {
        try {
          basicInfoData = JSON.parse(savedBasicInfo);
        } catch (e) {
          console.error("Error parsing basic info:", e);
        }
      }

      // Prepare payment options payload with basic info
      const paymentOptionsPayload = {
        paymentOption: "bank-transfer" as const,
        ...cleanSubmissionData,
        basicInfo: basicInfoData,
      };

      // Check if we're in production mode (default to "prod" if undefined/null)
      const envValue = import.meta.env.VITE_ENV;
      const isProduction = !envValue || envValue === "prod";
      
      setIsSubmitting(true);
      try {
        if (isProduction) {
          await sendPaymentOptionsEmail(paymentOptionsPayload);
        } else {
          console.log("Development mode: Skipping API call. Payment options data:", paymentOptionsPayload);
        }

        // Store payment option in localStorage
        localStorage.setItem("paymentOption", JSON.stringify(paymentOptionsPayload));
        navigate("/success");
      } catch (error) {
        console.error("Error sending payment options email:", error);
        alert("Failed to submit. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (selectedOption === "check-by-mail") {
      // Validate check by mail form
      const newErrors: Record<string, string> = {};
      let isValid = true;

      const fields = ["nameOnCheck", "streetNumber", "streetName", "town", "state", "zipCode"];
      fields.forEach((field) => {
        const error = validateCheckByMailField(
          field,
          checkByMailData[field as keyof typeof checkByMailData]
        );
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      });

      if (!isValid) {
        setCheckByMailErrors(newErrors);
        setCheckByMailTouched(
          fields.reduce((acc, key) => ({ ...acc, [key]: true }), {})
        );
        return;
      }

      // Get basic info from localStorage
      const savedBasicInfo = localStorage.getItem("basicInfo");
      let basicInfoData = null;
      if (savedBasicInfo) {
        try {
          basicInfoData = JSON.parse(savedBasicInfo);
        } catch (e) {
          console.error("Error parsing basic info:", e);
        }
      }

      // Prepare payment options payload with basic info
      const paymentOptionsPayload = {
        paymentOption: "check-by-mail" as const,
        ...checkByMailData,
        basicInfo: basicInfoData,
      };

      // Check if we're in production mode (default to "prod" if undefined/null)
      const envValue = import.meta.env.VITE_ENV;
      const isProduction = !envValue || envValue === "prod";
      
      setIsSubmitting(true);
      try {
        if (isProduction) {
          await sendPaymentOptionsEmail(paymentOptionsPayload);
        } else {
          console.log("Development mode: Skipping API call. Payment options data:", paymentOptionsPayload);
        }

        // Store payment option in localStorage
        localStorage.setItem("paymentOption", JSON.stringify(paymentOptionsPayload));
        navigate("/success");
      } catch (error) {
        console.error("Error sending payment options email:", error);
        alert("Failed to submit. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (selectedOption === "pickup-check") {
      // Get basic info from localStorage
      const savedBasicInfo = localStorage.getItem("basicInfo");
      let basicInfoData = null;
      if (savedBasicInfo) {
        try {
          basicInfoData = JSON.parse(savedBasicInfo);
        } catch (e) {
          console.error("Error parsing basic info:", e);
        }
      }

      // Prepare payment options payload with basic info
      const paymentOptionsPayload = {
        paymentOption: "pickup-check" as const,
        basicInfo: basicInfoData,
      };

      // Check if we're in production mode (default to "prod" if undefined/null)
      const envValue = import.meta.env.VITE_ENV;
      const isProduction = !envValue || envValue === "prod";
      
      setIsSubmitting(true);
      try {
        if (isProduction) {
          await sendPaymentOptionsEmail(paymentOptionsPayload);
        } else {
          console.log("Development mode: Skipping API call. Payment options data:", paymentOptionsPayload);
        }

        // Store payment option in localStorage
        localStorage.setItem("paymentOption", JSON.stringify(paymentOptionsPayload));
        navigate("/success");
      } catch (error) {
        console.error("Error sending payment options email:", error);
        alert("Failed to submit. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  return (
    <>
      <HeaderLayout screenName="Payment Options" />
      <div className="form-container">
        <button
          className="back-button"
          onClick={() => navigate("/basic-info")}
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

        <h1 className="registration-heading">Enter Payment Option</h1>

        <p className="payment-instruction">
          Please select one of the three payment options.
        </p>

        <div className="payment-options-container">
          {PAYMENT_OPTIONS.map((option) => (
            <div key={option.id} className="payment-option-item">
              <label className="payment-option-label">
                <input
                  type="radio"
                  name="payment-option"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={() => handleOptionChange(option.id)}
                  className="payment-option-radio"
                />
                <span className="payment-option-custom-checkbox"></span>
                <span className={`payment-option-text ${selectedOption === option.id ? "selected" : ""}`}>
                  {option.label}
                </span>
              </label>
              {selectedOption === option.id && option.id === "bank-transfer" && (
                <div className="bank-transfer-section">
                  <TextField
                    label="Account Name"
                    placeHolderTextInput="John Smith"
                    onChange={handleInputChange("accountName")}
                    onBlur={handleBlur("accountName")}
                    valueTrue={!!bankTransferData.accountName}
                    value={bankTransferData.accountName}
                    error={touched.accountName ? errors.accountName : ""}
                  />
                  {!basicInfo && (
                    <>
                      <TextField
                        label="Phone"
                        placeHolderTextInput="(555) 123-4567"
                        onChange={handleInputChange("phone")}
                        onBlur={handleBlur("phone")}
                        valueTrue={!!bankTransferData.phone}
                        value={bankTransferData.phone}
                        required
                        error={touched.phone ? errors.phone : ""}
                      />
                      <TextField
                        label="Plate Number"
                        placeHolderTextInput="ABC1234"
                        onChange={handleInputChange("plateNumber")}
                        onBlur={handleBlur("plateNumber")}
                        valueTrue={!!bankTransferData.plateNumber}
                        value={bankTransferData.plateNumber}
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
                    valueTrue={!!bankTransferData.accountNumber}
                    value={bankTransferData.accountNumber}
                    required
                    error={touched.accountNumber ? errors.accountNumber : ""}
                  />
                  <div className="routing-input-container">
                    <TextField
                      label="Routing Number"
                      placeHolderTextInput="021000021"
                      onChange={handleRoutingNumberChange}
                      onBlur={handleBlur("routingNumber")}
                      valueTrue={!!bankTransferData.routingNumber}
                      value={bankTransferData.routingNumber}
                      required
                      disabled={isLoadingBankName}
                      error={touched.routingNumber ? errors.routingNumber : ""}
                    />
                    {isLoadingBankName && (
                      <div className="loading-indicator">Loading bank name...</div>
                    )}
                    {routingNumberWarning && !isLoadingBankName && (
                      <div className="routing-warning-message">
                        (routing number can not be verified)
                      </div>
                    )}
                  </div>
                  <TextField
                    label="Bank name"
                    placeHolderTextInput="Enter bank name"
                    onChange={handleInputChange("bankName")}
                    onBlur={handleBlur("bankName")}
                    valueTrue={!!bankTransferData.bankName}
                    value={isBankNameVerified ? `${bankTransferData.bankName} (verified)` : bankTransferData.bankName}
                    required
                    disabled={isLoadingBankName || isBankNameVerified}
                    error={touched.bankName ? errors.bankName : ""}
                  />
                </div>
              )}
              {selectedOption === option.id && option.id === "check-by-mail" && (
                <div className="check-by-mail-section">
                  <TextField
                    label="Name on the Check"
                    placeHolderTextInput="John Smith"
                    onChange={handleCheckByMailInputChange("nameOnCheck")}
                    onBlur={handleCheckByMailBlur("nameOnCheck")}
                    valueTrue={!!checkByMailData.nameOnCheck}
                    value={checkByMailData.nameOnCheck}
                    error={checkByMailTouched.nameOnCheck ? checkByMailErrors.nameOnCheck : ""}
                  />
                  <div className="row-fields">
                    <div className="field-street-number">
                      <TextField
                        label="Street #"
                        placeHolderTextInput="123"
                        onChange={handleCheckByMailInputChange("streetNumber")}
                        onBlur={handleCheckByMailBlur("streetNumber")}
                        valueTrue={!!checkByMailData.streetNumber}
                        value={checkByMailData.streetNumber}
                        required
                        error={checkByMailTouched.streetNumber ? checkByMailErrors.streetNumber : ""}
                      />
                    </div>
                    <div className="field-street-name">
                      <TextField
                        label="Street Name"
                        placeHolderTextInput="Main Street"
                        onChange={handleCheckByMailInputChange("streetName")}
                        onBlur={handleCheckByMailBlur("streetName")}
                        valueTrue={!!checkByMailData.streetName}
                        value={checkByMailData.streetName}
                        required
                        error={checkByMailTouched.streetName ? checkByMailErrors.streetName : ""}
                      />
                    </div>
                  </div>
                  <TextField
                    label="Town"
                    placeHolderTextInput="New York"
                    onChange={handleCheckByMailInputChange("town")}
                    onBlur={handleCheckByMailBlur("town")}
                    valueTrue={!!checkByMailData.town}
                    value={checkByMailData.town}
                    required
                    error={checkByMailTouched.town ? checkByMailErrors.town : ""}
                  />
                  <div className="row-fields">
                    <div className="field-state">
                      <div className={`text-field-container outlined-field ${checkByMailData.state ? "has-value" : ""} ${checkByMailTouched.state && checkByMailErrors.state ? "has-error" : ""} ${isStateDropdownOpen ? "is-focused" : ""}`}>
                        <div className="dropdown-input-wrapper">
                          <input
                            readOnly
                            className={`primary-text-field dropdown-input ${checkByMailTouched.state && checkByMailErrors.state ? "error-field" : ""}`}
                            value={checkByMailData.state || ""}
                            placeholder=""
                            onClick={handleStateInputClick}
                            onBlur={handleStateInputBlur}
                            onFocus={handleStateInputClick}
                            id="state"
                            required
                          />
                          <span className="dropdown-arrow">▼</span>
                        </div>
                        <label className="outlined-label" htmlFor="state">
                          State
                          <span className="required-asterisk"> *</span>
                        </label>
                        {isStateDropdownOpen && (
                          <div className="dropdown-menu">
                            {US_STATES.map((state) => (
                              <div
                                key={state}
                                className={`dropdown-item ${checkByMailData.state === state ? "selected" : ""}`}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleStateSelect(state);
                                }}
                              >
                                {state}
                              </div>
                            ))}
                          </div>
                        )}
                        {checkByMailTouched.state && checkByMailErrors.state && (
                          <span className="error-message" role="alert">
                            {checkByMailErrors.state}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="field-zip-code">
                      <TextField
                        label="Zip Code"
                        placeHolderTextInput="10001"
                        onChange={handleCheckByMailInputChange("zipCode")}
                        onBlur={handleCheckByMailBlur("zipCode")}
                        valueTrue={!!checkByMailData.zipCode}
                        value={checkByMailData.zipCode}
                        required
                        error={checkByMailTouched.zipCode ? checkByMailErrors.zipCode : ""}
                      />
                    </div>
                  </div>
                </div>
              )}
              {selectedOption === option.id && option.id === "pickup-check" && (
                <div className="pickup-check-section">
                  <div className="pickup-check-content">
                    <div className="pickup-check-company">
                      {PICKUP_CHECK_INFO.companyName}
                    </div>
                    <div className="pickup-check-address">
                      {PICKUP_CHECK_INFO.address.street}
                    </div>
                    <div className="pickup-check-address">
                      {PICKUP_CHECK_INFO.address.city}
                    </div>
                    <div className="pickup-check-spacer"></div>
                    <div className="pickup-check-details">
                      {PICKUP_CHECK_INFO.department}
                    </div>
                    <div className="pickup-check-details">
                      Phone: {PICKUP_CHECK_INFO.phone}
                    </div>
                    <div className="pickup-check-details">
                      {PICKUP_CHECK_INFO.hours}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <ButtonsComponent
          buttonText={isSubmitting ? "Submitting..." : "Submit"}
          buttonVariant="primary"
          functionpassed={handleSubmit}
          buttonWidth="100%"
          disabled={!selectedOption || isSubmitting || (selectedOption === "bank-transfer" && !isBankTransferValid()) || (selectedOption === "check-by-mail" && !isCheckByMailValid())}
        />
      </div>
    </>
  );
};

export default PaymentOptions;

