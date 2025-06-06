import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMale, FaFemale, FaEye, FaPowerOff } from 'react-icons/fa';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const ViewMembers = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [loading, setLoading] = useState(false);

  const adminId = localStorage.getItem('id');
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  const fetchAllEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/employee/${adminId}`);
      setAllEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeClick = async (employee) => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND_URL}/api/tasks/assigned/${adminId}`);
      const tasks = res.data.filter(t => t.employee_id === employee.id);
      setSelectedEmployee(employee);
      setEmployeeTasks(tasks);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (e, employee) => {
    e.stopPropagation();
    const newStatus = employee.status === 1 ? 0 : 1;

    // Optimistic UI update
    setAllEmployees(prev =>
      prev.map(emp =>
        emp.id === employee.id ? { ...emp, status: newStatus } : emp
      )
    );

    if (newStatus === 1) {
      toast.success(`${employee.first_name} activated`);
    } else {
      toast.warn(`${employee.first_name} deactivated`);
    }

    try {
      // Add timeout to prevent infinite requests
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), 10000) // 10 seconds timeout
      );

      await Promise.race([
        axios.put(`${BACKEND_URL}/api/employee/status/${employee.id}`, { status: newStatus }),
        timeoutPromise
      ]);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Status update failed. Please try again.");
      // Revert optimistic update on failure
      setAllEmployees(prev =>
        prev.map(emp =>
          emp.id === employee.id ? { ...emp, status: employee.status } : emp
        )
      );
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const filteredEmployees = allEmployees.filter(emp =>
    activeTab === 'active' ? emp.status === 1 : emp.status === 0
  );

  const assignedTasks = employeeTasks.filter(task => task.status !== 'Completed');
  const completedTasks = employeeTasks.filter(task => task.status === 'Completed');

  return (
    <div className="w-full h-full px-4 sm:px-6 py-6 overflow-y-auto bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl">
      

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

      <h2 className="text-3xl font-bold text-indigo-900 text-center mb-6">Members Under You</h2>

      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'active'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
          }`}
          disabled={loading}
        >
          Active Employees
        </button>
        <button
          onClick={() => setActiveTab('inactive')}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeTab === 'inactive'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'
          }`}
          disabled={loading}
        >
          Deactivated Employees
        </button>
      </div>

      {filteredEmployees.length > 0 ? (
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEmployees.map(employee => (
            <div
              key={employee.id}
              className="bg-white border border-indigo-100 rounded-xl shadow-md p-5 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-indigo-50/50 to-purple-50/50"
            >
              <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                {employee.gender === 'female' ? (
                  <FaFemale className="text-indigo-500" />
                ) : (
                  <FaMale className="text-purple-500" />
                )}
                {employee.first_name} {employee.last_name}
              </h3>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={(e) => handleStatusToggle(e, employee)}
                  className={`px-2 py-1 text-sm rounded-full transition-all duration-200 ${
                    employee.status === 1
                      ? 'bg-purple-500 cursor-pointer hover:bg-purple-600 text-white'
                      : 'bg-indigo-500 cursor-pointer hover:bg-indigo-600 text-white'
                  }`}
                  data-tooltip-id="employee-tooltip"
                  data-tooltip-content={
                    employee.status === 1 ? "Deactivate Employee" : "Activate Employee"
                  }
                  disabled={loading}
                >
                  <FaPowerOff size={14} />
                </button>

                <button
                  onClick={() => handleEmployeeClick(employee)}
                  className="text-2xl cursor-pointer text-indigo-600 hover:text-indigo-800 transition-all duration-200"
                  data-tooltip-id="employee-tooltip"
                  data-tooltip-content="View Task Details"
                  disabled={loading}
                >
                  <FaEye />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-indigo-600 text-lg font-medium italic mt-12">
          No members found.
        </div>
      )}

      <Tooltip id="employee-tooltip" className="!z-[9999]" place="top" effect="solid" />

      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative bg-white w-full sm:max-w-3xl md:max-w-4xl rounded-xl shadow-2xl flex flex-col md:flex-row mx-auto max-h-[90vh] bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
            {/* Completed Tasks */}
            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r p-4 overflow-y-auto max-h-[40vh] md:max-h-[90vh]">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">✅ Completed Tasks</h3>
              {completedTasks.length ? (
                <ul className="space-y-3 text-sm text-indigo-700">
                  {completedTasks.map(task => (
                    <li key={task.task_id} className="border border-indigo-100 p-3 rounded-lg bg-indigo-50/50">
                      <div className="font-semibold">{task.title}</div>
                      <div className="text-xs text-indigo-500">
                        Completed on: {formatDate(task.completion_date)}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-indigo-600">No completed tasks.</p>
              )}
            </div>

            {/* Assigned Tasks */}
            <div className="w-full md:w-1/2 p-4 overflow-y-auto max-h-[40vh] md:max-h-[90vh]">
              <h3 className="text-xl font-bold text-indigo-900 mb-4">📝 Assigned Tasks</h3>
              {assignedTasks.length ? (
                <ul className="space-y-3 text-sm text-indigo-700">
                  {completedTasks.map(task => (
                    <li key={task.task_id} className="border border-indigo-100 p-3 rounded-lg bg-purple-50/50">
                      <div className="font-semibold">{task.title}</div>
                      <div className="text-xs text-indigo-500">
                        Due by: {formatDate(task.due_date)}
                      </div>
                      <div className="text-xs text-indigo-500">Status: {task.status}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-indigo-600">No active tasks assigned.</p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-sm hover:bg-purple-600 transition-all duration-200"
              disabled={loading}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMembers;