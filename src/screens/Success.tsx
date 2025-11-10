import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import "../styles/Form.css";
import "../styles/Home.css";

const Success = () => {
  const navigate = useNavigate();
  const [hasBankInfo, setHasBankInfo] = useState(false);

  useEffect(() => {
    // Check if bank info exists in localStorage
    const savedBankInfo = localStorage.getItem("bankInfo");
    if (savedBankInfo) {
      try {
        const parsed = JSON.parse(savedBankInfo);
        // Check if bank info has meaningful data
        const hasData = Object.values(parsed).some(
          (value) => value && String(value).trim() !== ""
        );
        setHasBankInfo(hasData);
      } catch (error) {
        console.error("Error parsing saved bank info:", error);
        setHasBankInfo(false);
      }
    } else {
      setHasBankInfo(false);
    }
  }, []);

  return (
    <>
      <HeaderLayout screenName="Success" />
      <div className="form-container">
        <div className="success-message-container">
          <div className="success-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                fill="#4caf50"
              />
            </svg>
          </div>
          <h2 className="success-title">Your information has been sent to Elite</h2>
          <p className="success-message">
            Someone from driver relations will contact you soon.
          </p>
          
          {!hasBankInfo && (
            <div 
              className="option-box" 
              onClick={() => navigate("/bank-info")}
              style={{ marginTop: "30px" }}
            >
              <h2 className="option-title">Enter your bank details</h2>
              <p className="option-description">
                To get paid the next day, please provide your bank information.
              </p>
            </div>
          )}
          
          <button
            className="back-button"
            onClick={() => navigate("/")}
            aria-label="Go back to home"
            style={{ marginTop: "30px" }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </>
  );
};

export default Success;

