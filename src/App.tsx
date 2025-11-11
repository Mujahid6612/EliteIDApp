import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
// Screens
import IndexScreen from "./screens/IndexScreen";
import Unauthorized from "./screens/Unauthorized";
import VoucherList from "./screens/VoucherList";
import Home from "./screens/Home";
import BasicInfo from "./screens/BasicInfo";
import BankInfo from "./screens/BankInfo";
import Success from "./screens/Success";
import Ping from "./screens/Ping";


console.log("environment", import.meta.env.VITE_ENV);
/// before we are calling res in action we need to confirm the res status code and message before dispatching the action
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Fallback to redirect to the appropriate screen based on job status */}
        <Route path="/:jobId/vouchers" element={<VoucherList />} />
        <Route path="/:jobId/*" element={<IndexScreen />} />
        <Route path="/" element={<Home />} />
        <Route path="/ping" element={<Ping />} />
        <Route path="/basic-info" element={<BasicInfo />} />
        <Route path="/bank-info" element={<BankInfo />} />
        <Route path="/success" element={<Success />} />
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
