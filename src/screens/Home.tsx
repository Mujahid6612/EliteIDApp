import { useNavigate } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeaderLayout screenName="Home" />
      <div className="home-container">
        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '10px' }}>
          <h2 style={{ color: '#003182', marginBottom: '10px', fontSize: '1.3rem' }}>Welcome to Elite Independent Driver</h2>
          <p style={{ color: 'rgba(0, 0, 0, 0.87)', lineHeight: '1.6', margin: 0 }}>
            Join our network of independent drivers and start earning with Elite.
            Complete the steps below to become part of our driver community and begin receiving job opportunities. 
            Your information is secure and will be used solely for driver registration and payment processing.
          </p>
        </div>
        
        <div 
          className="option-box" 
          onClick={() => navigate("/basic-info")}
        >
          <h2 className="option-title">Provide Basic Information</h2>
          <p className="option-description">
            To be added in Elite Independent driver app list, please provide your contact and vehicle details.
          </p>
        </div>

        <div 
          className="option-box" 
          onClick={() => navigate("/bank-info")}
        >
          <h2 className="option-title">Enter your bank details</h2>
          <p className="option-description">
            To get paid the next day, please provide your bank information.
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
