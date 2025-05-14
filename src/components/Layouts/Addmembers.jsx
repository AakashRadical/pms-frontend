import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Addmembers = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [gender, setGender] = useState('');
  const [designation, setDesignation] = useState('');
  const [loading, setLoading] = useState(false); // New loading state

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async () => {
    const adminId = localStorage.getItem('id');

    if (!adminId) {
      toast.error('Admin ID not found');
      return;
    }

    if (!password) {
      toast.error('Password is required');
      return;
    }

    setLoading(true); // Start loading
    try {
      await axios.post(`${BACKEND_URL}/api/employee/add`, {
        adminId,
        firstName,
        lastName,
        email,
        password,
        gender,
        designation,
        joinDate,
      });

      toast.success('Employee added successfully');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setJoinDate('');
      setGender('');
      setDesignation('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 py-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl">
      {/* Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-10 w-10 text-indigo-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="mt-2 text-white text-sm font-medium">Loading...</p>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white border border-indigo-100 rounded-xl p-6 sm:p-8 shadow-md">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-900 text-center mb-6">
          👥 Add New Team Member
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-indigo-800 mb-1">
              First Name
            </label>
            <input
              value={firstName}
              type="text"
              id="firstName"
              placeholder="John"
              className="w-full border border-indigo-200 px-3 py-2 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading} // Disable during loading
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-indigo-800 mb-1">
              Last Name
            </label>
            <input
              value={lastName}
              type="text"
              id="lastName"
              placeholder="Doe"
              className="w-full border border-indigo-200 px-3 py-2 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading} // Disable during loading
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-indigo-800 mb-1">
              Email
            </label>
            <input
              value={email}
              type="email"
              id="email"
              placeholder="john.doe@example.com"
              className="w-full border border-indigo-200 px-3 py-2 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading} // Disable during loading
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="password" className="block text-sm font-medium text-indigo-800 mb-1">
              Password
            </label>
            <input
              value={password}
              type="password"
              id="password"
              placeholder="••••••••"
              className="w-full border border-indigo-200 px-3 py-2 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading} // Disable during loading
            />
          </div>

          <div className="md:col-span-2">
            <span className="block text-sm font-medium text-indigo-800 mb-2">Gender</span>
            <div className="flex flex-col sm:flex-row sm:gap-6">
              {['male', 'female', 'other'].map((g) => (
                <label key={g} className="inline-flex items-center text-sm text-indigo-800 mb-2 sm:mb-0">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={gender === g}
                    className="form-radio text-purple-500 focus:ring-purple-500 h-4 w-4"
                    onChange={(e) => setGender(e.target.value)}
                    disabled={loading} // Disable during loading
                  />
                  <span className="ml-2 capitalize text-sm">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="designation" className="block text-sm font-medium text-indigo-800 mb-1">
              Designation
            </label>
            <input
              value={designation}
              type="text"
              id="designation"
              placeholder="Developer, Manager..."
              className="w-full border border-indigo-200 px-3 py-2 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
              onChange={(e) => setDesignation(e.target.value)}
              disabled={loading} // Disable during loading
            />
          </div>

          <div>
            <label htmlFor="joinDate" className="block text-sm font-medium text-indigo-800 mb-1">
              Join Date
            </label>
            <input
              value={joinDate}
              type="date"
              id="joinDate"
              className="w-full border border-indigo-200 px-3 py-2 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
              onChange={(e) => setJoinDate(e.target.value)}
              disabled={loading} // Disable during loading
            />
          </div>
        </div>
       <div  className="mt-6">
        <button
          onClick={handleSubmit}
          className="mt-8 cursor-pointer w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 rounded-md text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={loading} // Disable during loading
        >
          ➕ Add Member
        </button>
        </div>
      </div>
    </div>
  );
};

export default Addmembers;