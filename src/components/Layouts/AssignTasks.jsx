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

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const adminId = localStorage.getItem('id');

  useEffect(() => {
    if (adminId) {
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
        });
    }
  }, [adminId]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || selectedEmployees.length === 0) {
      toast.error('Please fill in the Title and assign at least one employee.');
      return;
    }

    const assignedEmployees = selectedEmployees.map((emp) => emp.value);

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
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 sm:p-8 bg-white rounded-xl shadow-lg bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
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
            className="w-full px-4 py-2 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
            required
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
            className="w-full px-4 py-2 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200 resize-none"
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
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
            />
          </div>
          <div className="w-full sm:w-1/2">
            <label className="block text-indigo-800 font-medium text-sm mb-1">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-indigo-200 rounded-lg bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
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
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
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