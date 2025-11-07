import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import TextField from "../components/TextField";
import ButtonsComponent from "../components/ButtonsComponent";
import { getBankNameFromRouting } from "../services/bankService";
import "../styles/Form.css";

const BankInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    accountName: "",
    accountNumber: "",
    routingNumber: "",
    bankName: "",
  });
  const [isLoadingBankName, setIsLoadingBankName] = useState(false);

  useEffect(() => {
    // Load account name from basic info
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
  }, []);

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
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

    // Fetch bank name when routing number is 9 digits
    if (routingNumber.length === 9) {
      setIsLoadingBankName(true);
      try {
        const bankName = await getBankNameFromRouting(routingNumber);
        setFormData((prev) => ({
          ...prev,
          bankName: bankName || "",
        }));
      } catch (error) {
        console.error("Error fetching bank name:", error);
        setFormData((prev) => ({
          ...prev,
          bankName: "",
        }));
      } finally {
        setIsLoadingBankName(false);
      }
    }
  };

  const handleSubmit = () => {
    if (
      !formData.accountName ||
      !formData.accountNumber ||
      !formData.routingNumber ||
      !formData.bankName
    ) {
      alert("Please fill in all fields");
      return;
    }

    // Here you can add logic to save bank info
    console.log("Bank Info:", formData);
    alert("Bank information submitted successfully!");
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
          placeHolderTextInput="Account Name"
          onChange={handleInputChange("accountName")}
          valueTrue={!!formData.accountName}
          value={formData.accountName}
        />

        <TextField
          placeHolderTextInput="Account Number"
          onChange={handleInputChange("accountNumber")}
          valueTrue={!!formData.accountNumber}
          value={formData.accountNumber}
        />

        <div className="routing-input-container">
          <TextField
            placeHolderTextInput="Routing Number"
            onChange={handleRoutingNumberChange}
            valueTrue={!!formData.routingNumber}
            value={formData.routingNumber}
          />
          {isLoadingBankName && (
            <div className="loading-indicator">Loading bank name...</div>
          )}
        </div>

        <div className="read-only-field-container">
          <label className="read-only-label">Bank Name</label>
          <input
            className="primary-text-field read-only-field"
            type="text"
            value={formData.bankName || ""}
            readOnly
            placeholder="Bank name will appear here"
          />
        </div>

        <ButtonsComponent
          buttonText="Submit"
          buttonVariant="primary"
          functionpassed={handleSubmit}
          buttonWidth="100%"
        />
      </div>
    </>
  );
};

export default BankInfo;
