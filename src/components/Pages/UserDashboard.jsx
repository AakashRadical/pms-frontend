import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUserAlt, FaUserTie, FaUser, FaBars } from 'react-icons/fa';
import UserCompletedTasks from '../Layouts/UserCompletedTasks';
import ActiveTasks from '../Layouts/ActiveTasks';

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [employee, setEmployee] = useState({});
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        setEmployee(response.data.employee || {});
      } catch (error) {
        console.error('Error fetching tasks:', error);
        toast.error('Failed to fetch tasks');
      }
    };

    fetchTasks();
  }, [employeeId, navigate]);

  const activeTasks = tasks.filter(task => task.status?.toLowerCase() !== 'completed');
  const completedTasks = tasks.filter(task => task.status?.toLowerCase() === 'completed');

  // useEffect(() => {
  //   console.log("All tasks:", tasks);
  // }, [tasks]);

  const handleLogoutConfirm = () => {
    localStorage.removeItem('employeeToken');
    localStorage.removeItem('employeeId');
    toast.success('Logged out successfully');
    navigate('/user-login');
  };

  const getGenderIcon = (gender) => {
    switch (gender?.toLowerCase()) {
      case 'male':
        return <FaUserTie className="inline-block text-purple-600 mr-2" />;
      case 'female':
        return <FaUserAlt className="inline-block text-indigo-500 mr-2" />;
      default:
        return <FaUser className="inline-block text-gray-600 mr-2" />;
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Sidebar Navigation */}
      <div className={`w-64 bg-gray-900 text-white p-6 shadow-lg transition-all duration-300 ${isSidebarOpen ? 'block' : 'hidden'} sm:block`}>
        <h3 className="text-xl font-bold mb-6 tracking-tight">Project Management</h3>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex cursor-pointer items-center gap-3 text-base py-2 px-4 rounded-md w-full hover:bg-indigo-700 transition duration-200 ${activeTab === 'active' ? 'bg-indigo-700' : ''}`}
          >
            <FaSignOutAlt /> Active Tasks
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex cursor-pointer items-center gap-3 text-base py-2 px-4 rounded-md w-full hover:bg-indigo-700 transition duration-200 ${activeTab === 'completed' ? 'bg-indigo-700' : ''}`}
          >
            <FaUserAlt /> Completed Tasks
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold text-indigo-900 flex items-center justify-center sm:justify-start">
              📋 {getGenderIcon(employee.gender)}
              {employee.first_name} {employee.last_name}'s Tasks
            </h2>
            <p className="text-sm text-indigo-600 mt-1">{employee.designation || 'No designation'} | {employee.gender || 'No gender specified'}</p>
          </div>
          <div className="flex items-center gap-3 mt-3 sm:mt-0">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="bg-purple-600 cursor-pointer hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-all duration-200 hover:shadow-md"
            >
              <FaSignOutAlt /> Logout
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="sm:hidden text-white bg-indigo-800 p-2 rounded-md hover:bg-indigo-900 transition-all duration-200"
            >
              <FaBars />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          {activeTab === 'active' ? (
            activeTasks.length === 0 ? (
              <p className="text-center text-indigo-600 text-sm font-medium">No active tasks assigned.</p>
            ) : (
              <ActiveTasks tasks={activeTasks} />
            )
          ) : (
            completedTasks.length === 0 ? (
              <p className="text-center text-indigo-600 text-sm font-medium">No completed tasks.</p>
            ) : (
              <UserCompletedTasks tasks={completedTasks} />
            )
          )}
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-sm p-6">
            <h2 className="text-lg font-semibold text-indigo-900 mb-2">Confirm Logout</h2>
            <p className="text-sm text-indigo-600 mb-4">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 cursor-pointer py-1.5 rounded-md bg-indigo-200 text-indigo-900 hover:bg-indigo-300 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 cursor-pointer py-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200"
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