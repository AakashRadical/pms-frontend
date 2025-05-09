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
    }
  };

  return (
    <div className="w-full px-2 sm:px-4">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold text-indigo-700 text-center mb-6">
          👥 Add New Team Member
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              value={firstName}
              type="text"
              id="firstName"
              placeholder="John"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              value={lastName}
              type="text"
              id="lastName"
              placeholder="Doe"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              value={email}
              type="email"
              id="email"
              placeholder="john.doe@example.com"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              value={password}
              type="password"
              id="password"
              placeholder="••••••••"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <span className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Gender</span>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              {['male', 'female', 'other'].map((g) => (
                <label key={g} className="inline-flex items-center text-sm text-gray-800 mb-2 sm:mb-0">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={gender === g}
                    className="form-radio 학이indigo-500 focus:ring-indigo-500 h-4 w-4"
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <span className="ml-2 capitalize text-xs sm:text-sm">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="designation" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <input
              value={designation}
              type="text"
              id="designation"
              placeholder="Developer, Manager..."
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              onChange={(e) => setDesignation(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="joinDate" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Join Date
            </label>
            <input
              value={joinDate}
              type="date"
              id="joinDate"
              className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              onChange={(e) => setJoinDate(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-md text-sm transition-colors duration-200"
        >
          ➕ Add Member
        </button>
      </div>
    </div>
  );
};

export default Addmembers;