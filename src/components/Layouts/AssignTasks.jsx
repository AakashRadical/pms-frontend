import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';


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
  });

  const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
  const adminId = localStorage.getItem('id');

  useEffect(() => {
    if (adminId) {
      axios.get(`${BACKEND_URL}/api/tasks/employees/${adminId}`)
        .then(res => {
          const formatted = res.data.map(emp => ({
            value: emp.id,
            label: `${emp.first_name} ${emp.last_name}`
          }));
          setEmployees(formatted);
        });
    }
  }, [adminId]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only require title and selectedEmployees
    if (!form.title || selectedEmployees.length === 0) {
      alert("Please fill in the Title and assign at least one employee.");
      return;
    }

    const assignedEmployees = selectedEmployees.map(emp => emp.value);

    try {
      await axios.post(`${BACKEND_URL}/api/tasks/create-task`, {
        ...form,
        admin_id: adminId,
        assignedEmployees,
      });
      alert("✅ Task assigned successfully");
      setForm({
        title: '',
        description: '',
        start_date: '',
        due_date: '',
        priority: '',
        status: '',
      });
      setSelectedEmployees([]);
    } catch (err) {
      alert("❌ Failed to assign task");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-xl">
      <h2 className="text-3xl font-semibold text-center text-blue-800 mb-6">Assign New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Title - Required */}
        <div>
          <label className="block text-blue-900 font-medium capitalize mb-1">Title<span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            required
          />
        </div>

        {/* Description - Optional */}
        <div>
          <label className="block text-blue-900 font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows="3"
            value={form.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
          />
        </div>

        {/* Dates - Optional */}
        <div className="flex gap-6">
          <div className="w-1/2">
            <label className="block text-blue-900 font-medium mb-1">Start Date</label>
            <input
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white focus:outline-none"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-blue-900 font-medium mb-1">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Priority and Status - Optional */}
        <div className="flex gap-6">
          <div className="w-1/2">
            <label className="block text-blue-900 font-medium mb-1">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white focus:outline-none"
            >
              <option value="">Select Priority</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="w-1/2">
            <label className="block text-blue-900 font-medium mb-1">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white focus:outline-none"
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
          <label className="block text-blue-900 font-medium mb-1">Assign to Employees<span className="text-red-500">*</span></label>
          <div className="bg-white border border-blue-300 rounded-lg">
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
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          ✅ Assign Task
        </button>
      </form>
    </div>
  );
};

export default AssignTasks;
