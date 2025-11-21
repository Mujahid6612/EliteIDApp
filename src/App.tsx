import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
// Screens
import IndexScreen from "./screens/IndexScreen";
import Unauthorized from "./screens/Unauthorized";
import VoucherList from "./screens/VoucherList";
import Home from "./screens/Home";
import BasicInfo from "./screens/BasicInfo";
import BankInfo from "./screens/BankInfo";
import Success from "./screens/Success";
import PaymentOptions from "./screens/PaymentOptions";
import DebugScreen from "./screens/DebugScreen";


console.log("environment", import.meta.env.VITE_ENV);
/// before we are calling res in action we need to confirm the res status code and message before dispatching the action
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root path to join-us */}
        <Route path="/" element={<Navigate to="/join-us" replace />} />
        {/* Fallback to redirect to the appropriate screen based on job status */}
        <Route path="/:jobId/vouchers" element={<VoucherList />} />
        <Route path="/:jobId/*" element={<IndexScreen />} />
        <Route path="/join-us" element={<Home />} />
        <Route path="/basic-info" element={<BasicInfo />} />
        <Route path="/bank-info" element={<BankInfo />} />
        <Route path="/payment-options" element={<PaymentOptions />} />
        <Route path="/success" element={<Success />} />
        <Route path="/debug" element={<DebugScreen />} />
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
