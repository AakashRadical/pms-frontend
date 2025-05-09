import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash, FaEnvelope } from 'react-icons/fa';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/login`, form);
      const token = res.data.token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('id', res.data.user.id);
        toast.success('Login successful');
        setTimeout(() => navigate('/home'), 1000);
      } else {
        toast.error('Failed to log in, no token received.');
      }
    } catch (err) {
      toast.error('Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-white px-4 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md p-6 sm:p-8 bg-white rounded-3xl shadow-lg border border-indigo-100/50">
        <div className="flex justify-center mb-6">
          <img
            src="/task-management.png"
            alt="Project Management System Logo"
            className="h-14 w-auto"
          />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-indigo-900 mb-8 tracking-tight">
          🔐 Admin Login
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-indigo-800 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-indigo-200 pl-10 pr-4 py-3 rounded-xl bg-indigo-50/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all duration-300"
                required
                aria-describedby="email-error"
              />
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 h-4 w-4" />
            </div>
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-indigo-800 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-indigo-200 pl-4 pr-10 py-3 rounded-xl bg-indigo-50/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-all duration-300"
                required
                aria-describedby="password-error"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 cursor-pointer top-1/2 transform -translate-y-1/2 text-indigo-500 hover:text-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-md p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl text-sm transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            🚀 Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;