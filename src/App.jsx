import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // Toast container
import Login from './Authentication/Login';
import Home from './components/Pages/Home';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

const App = () => {
  return (
    <>
      <ToastContainer /> {/* Container for toast notifications */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={
          <PrivateRoute>
            <Home/>
          </PrivateRoute>
        } />
     
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default App;
