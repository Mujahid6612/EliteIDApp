import { useNavigate } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import { addTimestampParam } from "../utils/addTimestampParam";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeaderLayout screenName="Home" />
      <div className="home-container">
        <h1 className="home-heading">Welcome to Elite independent driver App (EIDAPP)</h1>
        
        <p className="home-description">
          Join our network of Independent Drivers to receive ride offers.
        </p>
        
        <p className="home-description">
          Please complete the registration process to ensure prompt payments to your account.
        </p>
        
        <p className="home-description">
          Elite guarantees that the information provided is secure and will be used only for driver registration and payment processing.
        </p>
        
        <div 
          className="register-card" 
          onClick={() => navigate(addTimestampParam("/basic-info"))}
        >
          <h2 className="register-title">Register</h2>
          <p className="register-description">
            To be added in Elite Independent driver app list, please provide your contact info, vehicle details and select a payment option
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
