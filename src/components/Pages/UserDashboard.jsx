import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { FaSignOutAlt, FaUserAlt, FaUserTie, FaUser } from 'react-icons/fa';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [employee, setEmployee] = useState({
    first_name: '',
    last_name: '',
    designation: '',
    gender: '',
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const employeeId = localStorage.getItem('employeeId');
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!employeeId || !localStorage.getItem('employeeToken')) {
      toast.error('Please log in to view tasks');
      navigate('/user-login');
      return;
    }

    const fetchTasks = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/tasks/employee/${employeeId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('employeeToken')}` },
        });
        setTasks(response.data.tasks || []);
        setEmployee(response.data.employee || {
          first_name: '',
          last_name: '',
          designation: '',
          gender: '',
        });
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to fetch tasks');
      }
    };

    fetchTasks();
  }, [employeeId, navigate]);

  const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString() : '');

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeId');
    toast.success('Logged out successfully');
    navigate('/user-login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const getGenderIcon = (gender) => {
    switch (gender.toLowerCase()) {
      case 'male':
        return <FaUserTie className="inline-block text-blue-600 mr-1" />;
      case 'female':
        return <FaUserAlt className="inline-block text-pink-600 mr-1" />;
      default:
        return <FaUser className="inline-block text-gray-600 mr-1" />;
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 py-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-700">
              📋 {getGenderIcon(employee.gender)}
              {employee.first_name} {employee.last_name}'s Assigned Tasks
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {employee.designation || 'No designation'} | {employee.gender || 'No gender specified'}
            </p>
          </div>
          <button
            onClick={handleLogoutClick}
            className="mt-3 sm:mt-0 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-center text-gray-600 text-sm sm:text-base">
            No active tasks assigned.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {tasks.map((task) => (
              <div
                key={task.task_id}
                className="bg-gray-50 border border-gray-200 rounded-md p-3 sm:p-4"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                  {task.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-2">
                  {task.description || 'No description'}
                </p>
                <div className="text-xs sm:text-sm text-gray-500 space-y-1">
                  <p><strong>Start Date:</strong> {formatDate(task.start_date)}</p>
                  <p><strong>Due Date:</strong> {formatDate(task.due_date)}</p>
                  <p><strong>Priority:</strong> {task.priority || 'N/A'}</p>
                  <p><strong>Status:</strong> {task.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Confirm Logout</h2>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleLogoutCancel}
                className="px-4 py-1.5 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
