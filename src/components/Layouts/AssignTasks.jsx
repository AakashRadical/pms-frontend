import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AssignTasks = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    start_date: '',
    due_date: '',
    priority: '',
    status: '',
    position: 0,
  });
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const adminId = localStorage.getItem('id');

  useEffect(() => {
    if (adminId) {
      setLoading(true);
      axios
        .get(`${BACKEND_URL}/api/employee/${adminId}`)
        .then((res) => {
          const formatted = res.data.map((emp) => ({
            value: emp.id,
            label: `${emp.first_name} ${emp.last_name}`,
          }));
          setEmployees(formatted);
        })
        .catch((err) => {
          console.error('Error fetching employees:', err);
          toast.error('Failed to fetch employees');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [adminId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || selectedEmployees.length === 0) {
      toast.error('Please fill in the Title and assign at least one employee.');
      return;
    }

    const assignedEmployees = selectedEmployees.map((emp) => emp.value);

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/tasks/create-task`, {
        ...form,
        admin_id: adminId,
        assignedEmployees,
      });
      toast.success('✅ Task assigned successfully');
      setForm({
        title: '',
        description: '',
        start_date: '',
        due_date: '',
        priority: '',
        status: '',
        position: 0,
      });
      setSelectedEmployees([]);
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('❌ Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  // Calculate min due date based on start date
  const getMinDueDate = () => {
    if (!form.start_date) return null;
    const startDate = new Date(form.start_date);
    startDate.setDate(startDate.getDate()); // Due date can be same as start date
    return startDate.toISOString().split('T')[0];
  };

  // Calculate max start date based on due date
  const getMaxStartDate = () => {
    if (!form.due_date) return null;
    const dueDate = new Date(form.due_date);
    dueDate.setDate(dueDate.getDate()); // Start date can be same as due date
    return dueDate.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 sm:p-8 bg-white rounded-xl shadow-lg bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
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

      <h2 className="text-2xl sm:text-3xl font-bold text-center text-indigo-900 mb-6">Assign New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title - Required */}
        <div>
          <label className="block text-indigo-800 font-medium text-sm mb-1">
            Title<span className="text-purple-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
              onKeyDown={(e) => e.preventDefault()}
            className="w-full px-4 py-2 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
            required
            disabled={loading}
          />
        </div>

        {/* Description - Optional */}
        <div>
          <label className="block text-indigo-800 font-medium text-sm mb-1">Description</label>
          <textarea
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
              onKeyDown={(e) => e.preventDefault()}
            className="w-full px-4 py-2 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200 resize-none"
            disabled={loading}
          />
        </div>

        {/* Dates - Optional */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="w-full sm:w-1/2">
            <label className="block text-indigo-800 font-medium text-sm mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              max={getMaxStartDate()} // Restrict start date to due date or earlier
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
              disabled={loading}
            />
          </div>
          <div className="w-full sm:w-1/2">
            <label className="block text-indigo-800 font-medium text-sm mb-1">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              min={getMinDueDate()} // Restrict due date to start date or later
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
              disabled={loading}
            />
          </div>
        </div>

        {/* Priority and Status - Optional */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="w-full sm:w-1/2">
            <label className="block text-indigo-800 font-medium text-sm mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
              disabled={loading}
            >
              <option value="">Select Priority</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="w-full sm:w-1/2">
            <label className="block text-indigo-800 font-medium text-sm mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
              disabled={loading}
            >
              <option value="">Select Status</option>
              <option>Todo</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>
        </div>

        {/* Employee Selection - Required */}
        <div>
          <label className="block text-indigo-800 font-medium text-sm mb-1">
            Assign to Employees<span className="text-purple-500">*</span>
          </label>
          <div className="bg-indigo-50/50 border border-indigo-200 rounded-lg">
            <Select
              options={employees}
              isMulti
              value={selectedEmployees}
              onChange={setSelectedEmployees}
              className="react-select-container"
              classNamePrefix="react-select"
              isDisabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={loading}
        >
          ✅ Assign Task
        </button>
      </form>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default AssignTasks;