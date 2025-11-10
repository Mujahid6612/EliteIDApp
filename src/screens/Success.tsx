import { useNavigate } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import "../styles/Form.css";

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

