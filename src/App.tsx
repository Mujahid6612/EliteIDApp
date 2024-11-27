import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
// Screens
import IndexScreen from './screens/IndexScreen';
import Unauthorized from './screens/Unauthorized';

/// before we are calling res in action we need to confirm the res status code and message before dispatching the action
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Fallback to redirect to the appropriate screen based on job status */}
        <Route path="/:jobId/*" element={<IndexScreen />} />
        <Route path="/" element={<Unauthorized />} />
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
