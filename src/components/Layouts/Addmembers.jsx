import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';


const Addmembers = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [gender, setGender] = useState("");
  const [designation, setDesignation] = useState("");

  const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
  const handleSubmit = async () => {
    const adminId = localStorage.getItem("id");

    if (!adminId) {
      toast.error("Admin ID not found");
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/employee/add`, {
        adminId,
        firstName,
        lastName,
        email,
        gender,
        designation,
        joinDate,
      });

      toast.success("Employee added successfully");
      setFirstName('');
      setLastName('');
      setEmail('');
      setJoinDate('');
      setGender('');
      setDesignation('');
    } catch (err) {
      console.error(err);
      toast.error("Failed to add employee");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 px-4 sm:px-6 py-16 flex items-center justify-center font-sans">
      <div className="w-full max-w-3xl bg-white/40 backdrop-blur-md p-6 sm:p-10 shadow-2xl rounded-3xl border border-white/30">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-indigo-800 mb-10 tracking-tight drop-shadow">
          👥 Add New Team Member
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
            <input
              value={firstName}
              type="text"
              id="firstName"
              placeholder="John"
              className="w-full bg-white/50 border border-blue-200 px-4 py-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
            <input
              value={lastName}
              type="text"
              id="lastName"
              placeholder="Doe"
              className="w-full bg-white/50 border border-blue-200 px-4 py-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              value={email}
              type="email"
              id="email"
              placeholder="john.doe@example.com"
              className="w-full bg-white/50 border border-blue-200 px-4 py-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <span className="block text-sm font-semibold text-gray-700 mb-2">Gender</span>
            <div className="flex flex-wrap gap-6">
              {["male", "female", "other"].map((g) => (
                <label key={g} className="inline-flex items-center text-sm text-gray-800">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={gender === g}
                    className="form-radio text-blue-500 focus:ring-blue-400 h-4 w-4"
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <span className="ml-2 capitalize">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="designation" className="block text-sm font-semibold text-gray-700 mb-2">Designation</label>
            <input
              value={designation}
              type="text"
              id="designation"
              placeholder="Developer, Manager..."
              className="w-full bg-white/50 border border-blue-200 px-4 py-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setDesignation(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="joinDate" className="block text-sm font-semibold text-gray-700 mb-2">Join Date</label>
            <input
              value={joinDate}
              type="date"
              id="joinDate"
              className="w-full bg-white/50 border border-blue-200 px-4 py-3 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setJoinDate(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-10 w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105 hover:shadow-indigo-300/50"
        >
          ➕ Add Member
        </button>
      </div>
    </div>
  );
};

export default Addmembers;
