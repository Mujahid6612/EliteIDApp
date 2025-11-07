import { useNavigate } from "react-router-dom";
import HeaderLayout from "../components/HeaderLayout";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <HeaderLayout screenName="Home" />
      <div className="home-container">
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
