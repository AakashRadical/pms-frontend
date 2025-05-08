import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMale, FaFemale, FaEye, FaPowerOff } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const ViewMembers = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const adminId = localStorage.getItem('id');
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  const fetchAllEmployees = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/employee/${adminId}`);
      setAllEmployees(res.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleEmployeeClick = async (employee) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/tasks/assigned/${adminId}`);
      const tasks = res.data.filter(t => t.employee_id === employee.id);
      setSelectedEmployee(employee);
      setEmployeeTasks(tasks);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const handleStatusToggle = async (e, employee) => {
    e.stopPropagation();
    const newStatus = employee.status === 1 ? 0 : 1;

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
      await axios.put(`${BACKEND_URL}/api/employee/status/${employee.id}`, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Status update failed. Please try again.");
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
    <div className="w-full h-full px-4 sm:px-6 py-6 overflow-y-auto">
      <ToastContainer position="top-right" autoClose={2000} />
      <h2 className="text-3xl font-bold text-blue-800 text-center mb-6">Members Under You</h2>

      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'active'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-blue-600 border border-blue-300'
          }`}
        >
          Active Employees
        </button>
        <button
          onClick={() => setActiveTab('inactive')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'inactive'
              ? 'bg-red-600 text-white'
              : 'bg-white text-red-600 border border-red-300'
          }`}
        >
          Deactivated Employees
        </button>
      </div>

      {filteredEmployees.length > 0 ? (
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEmployees.map(employee => (
            <div
              key={employee.id}
              className="bg-white border border-gray-200 rounded-xl shadow p-5 hover:shadow-md transition relative"
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2">
                {employee.gender === 'female' ? (
                  <FaFemale className="text-pink-500" />
                ) : (
                  <FaMale className="text-blue-500" />
                )}
                {employee.first_name} {employee.last_name}
              </h3>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={(e) => handleStatusToggle(e, employee)}
                  className={`px-2 py-1 text-sm rounded-full transition ${
                    employee.status === 1
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  data-tooltip-id="employee-tooltip"
                  data-tooltip-content={
                    employee.status === 1 ? "Deactivate Employee" : "Activate Employee"
                  }
                >
                  <FaPowerOff size={14} />
                </button>

                <button
                  onClick={() => handleEmployeeClick(employee)}
                  className="text-2xl text-blue-600 hover:text-blue-800"
                  data-tooltip-id="employee-tooltip"
                  data-tooltip-content="View Task Details"
                >
                  <FaEye />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 text-lg italic mt-12">
          No members found.
        </div>
      )}

      <Tooltip id="employee-tooltip" className="!z-[9999]" place="top" effect="solid" />

      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-[9998] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative bg-white w-full sm:max-w-3xl md:max-w-4xl rounded-xl shadow-2xl flex flex-col md:flex-row mx-auto max-h-[90vh]">
            {/* Completed Tasks */}
            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r p-4 overflow-y-auto max-h-[40vh] md:max-h-[90vh]">
              <h3 className="text-xl font-bold text-green-700 mb-4">✅ Completed Tasks</h3>
              {completedTasks.length ? (
                <ul className="space-y-3 text-sm text-gray-700">
                  {completedTasks.map(task => (
                    <li key={task.task_id} className="border p-3 rounded-lg bg-green-50">
                      <div className="font-semibold">{task.title}</div>
                      <div className="text-xs text-gray-500">
                        Completed on: {formatDate(task.completion_date)}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No completed tasks.</p>
              )}
            </div>

            {/* Assigned Tasks */}
            <div className="w-full md:w-1/2 p-4 overflow-y-auto max-h-[40vh] md:max-h-[90vh]">
              <h3 className="text-xl font-bold text-blue-700 mb-4">📝 Assigned Tasks</h3>
              {assignedTasks.length ? (
                <ul className="space-y-3 text-sm text-gray-700">
                  {assignedTasks.map(task => (
                    <li key={task.task_id} className="border p-3 rounded-lg bg-blue-50">
                      <div className="font-semibold">{task.title}</div>
                      <div className="text-xs text-gray-500">
                        Due by: {formatDate(task.due_date)}
                      </div>
                      <div className="text-xs text-gray-500">Status: {task.status}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No active tasks assigned.</p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm hover:bg-red-600"
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
