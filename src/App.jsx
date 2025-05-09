import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate, useNavigation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './Authentication/Login';
import UserLogin from './Authentication/UserLogin';
import Home from './components/Pages/Home';
import UserDashboard from './components/Pages/UserDashboard';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

const App = () => {
  const location = useLocation();
  const showNavBar = ['/login', '/user-login'].includes(location.pathname);
const navigate=useNavigate()
  const token=localStorage.getItem("token")
  const employeeToken=localStorage.getItem("employeeToken")


useEffect(()=>{
if(token){
navigate('/home')
}else if(employeeToken){
  navigate("/user-dashboard")
}
},[])
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      {showNavBar && (
        <nav className="w-full bg-white shadow-sm py-4">
          <div className="max-w-4xl mx-auto flex justify-center gap-4 px-4">
            <Link
              to="/login"
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                location.pathname === '/login'
                  ? 'text-indigo-700 bg-indigo-100'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Admin Login
            </Link>
            <Link
              to="/user-login"
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                location.pathname === '/user-login'
                  ? 'text-indigo-700 bg-indigo-100'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Employee Login
            </Link>
          </div>
        </nav>
      )}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route
          path="/home"
          element={
            <PrivateRoute role="admin">
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <PrivateRoute role="user">
              <UserDashboard />
            </PrivateRoute>
          }
        />
      </Routes>

    </>
  );
};

export default App;