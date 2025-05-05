import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const BACKEND_URL=import.meta.env.VITE_BACKEND_URL

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 font-sans">
      <div className="w-full max-w-md p-10 bg-white/50 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8 tracking-tight drop-shadow-sm">
          🔐 Welcome Back
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white/60 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white/60 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-lg font-semibold py-3 rounded-xl transition-transform transform hover:scale-105 shadow-md hover:shadow-indigo-300/50"
          >
            🚀 Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
