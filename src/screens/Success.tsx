import { useNavigate } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import { addTimestampParam } from "../utils/addTimestampParam";
import "../styles/Form.css";
import "../styles/Home.css";

const Success = () => {
  const navigate = useNavigate();

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
          
          <div className="last-step-section register-card">
            <h3 className="last-step-title">Last Step:</h3>
            <p className="last-step-instruction">
              Please email copies of your driver's license and car registration to{" "}
              <a href="mailto:EIDApp@EliteNY.com" className="email-link">
                EIDApp@EliteNY.com
              </a>
            </p>
          </div>
          
          <button
            className="back-button"
            onClick={() => navigate(addTimestampParam("/join-us"))}
            aria-label="Go back to home"
            style={{ marginTop: "30px" }}
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
            <span className="back-text">Back to Home</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Success;

