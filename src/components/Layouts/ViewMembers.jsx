import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMale, FaFemale } from 'react-icons/fa';


const ViewMembers = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeTasks, setEmployeeTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const adminId = localStorage.getItem('id');

  const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
  useEffect(() => {
    fetchAllEmployees();
  }, []);

  const fetchAllEmployees = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/tasks/employees/${adminId}`);
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

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const assignedTasks = employeeTasks.filter(task => task.status !== 'Completed');
  const completedTasks = employeeTasks.filter(task => task.status === 'Completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 px-4 sm:px-6 py-8 sm:py-12">
      <h2 className="text-4xl font-extrabold text-blue-800 text-center mb-10 drop-shadow">
        Members Under You
      </h2>

      {allEmployees.length > 0 ? (
        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {allEmployees.map(employee => (
            <div
              key={employee.id}
              onClick={() => handleEmployeeClick(employee)}
              className="cursor-pointer bg-white/70 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-lg p-6 transition-all hover:shadow-blue-200"
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-2 flex items-center gap-2">
                {employee.gender === 'female' ? (
                  <FaFemale className="text-pink-500" />
                ) : (
                  <FaMale className="text-blue-500" />
                )}
                {employee.first_name} {employee.last_name}
              </h3>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 text-lg italic mt-12">
          No members found.
        </div>
      )}

      {/* Modal */}
      {showModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="relative bg-white w-full max-w-5xl rounded-xl shadow-xl flex flex-col md:flex-row mx-auto max-h-[90vh] overflow-hidden">
            {/* Completed Tasks */}
            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r p-4 overflow-y-auto max-h-[45vh] md:max-h-[90vh]">
              <h3 className="text-xl font-bold text-green-700 mb-4">
                ✅ Completed Tasks
              </h3>
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
            <div className="w-full md:w-1/2 p-4 overflow-y-auto max-h-[45vh] md:max-h-[90vh]">
              <h3 className="text-xl font-bold text-blue-700 mb-4">
                📝 Assigned Tasks
              </h3>
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
              className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs sm:text-sm hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMembers;
