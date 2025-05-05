import React, { useEffect, useState } from 'react';
import axios from 'axios';


const CompletedTasks = () => {
  const [groupedCompleted, setGroupedCompleted] = useState({});
  const [allCompletedTasks, setAllCompletedTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDateLocal());
  const [editTask, setEditTask] = useState(null);
  const [editStatus, setEditStatus] = useState("");

  const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
  const adminId = localStorage.getItem('id');

  function getTodayDateLocal() {
    const today = new Date();
    return today.toLocaleDateString('sv-SE');
  }

  function getLocalDateString(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('sv-SE');
  }

  const formatDateDisplay = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : '';

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/tasks/assigned/${adminId}`);
      const completed = res.data.filter(t => t.status === 'Completed');
      setAllCompletedTasks(completed);
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
    }
  };

  useEffect(() => {
    if (!selectedDate) return setGroupedCompleted({});

    const filtered = allCompletedTasks.filter(task => {
      return getLocalDateString(task.completion_date) === selectedDate;
    });

    const grouped = filtered.reduce((acc, task) => {
      const key = `${task.employee_id}-${task.first_name} ${task.last_name}`;
      acc[key] = acc[key] || [];
      acc[key].push(task);
      return acc;
    }, {});
    setGroupedCompleted(grouped);
  }, [selectedDate, allCompletedTasks]);

  const handleEdit = (task) => {
    setEditTask(task);
    setEditStatus(task.status);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${BACKEND_URL}/api/tasks/${editTask.task_id}`, {
        ...editTask,
        status: editStatus,
        completion_date: editStatus === 'Completed' ? getTodayDateLocal() : null,
      });

      setEditTask(null);
      fetchCompletedTasks();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-6 py-12">
      <h2 className="text-4xl font-extrabold text-blue-800 text-center mb-8 drop-shadow">
        ✅ Completed Tasks by Date
      </h2>

      <div className="max-w-xl mx-auto mb-12 flex justify-center">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-blue-300 px-4 py-2 rounded-lg shadow-md text-gray-700"
        />
      </div>

      {selectedDate && Object.keys(groupedCompleted).length > 0 ? (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {Object.keys(groupedCompleted).map(employeeKey => (
            <div
              key={employeeKey}
              className="bg-white/70 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-lg p-6 transition-all hover:shadow-blue-200"
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-3 flex items-center gap-2">
                👤 {employeeKey.split('-')[1]}
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm">
                {groupedCompleted[employeeKey].map(task => (
                  <li key={task.task_id}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-800">{task.title}</span>{' '}
                        <span className="text-gray-500">
                          (Completed on: {formatDateDisplay(task.completion_date)})
                        </span>
                      </div>
                      <button
                        onClick={() => handleEdit(task)}
                        className="ml-3 px-3 py-1 text-sm bg-blue-200 hover:bg-blue-300 rounded"
                      >
                        Edit
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : selectedDate ? (
        <div className="text-center text-gray-500 text-lg italic mt-12">
          No completed tasks found for {formatDateDisplay(selectedDate)}.
        </div>
      ) : (
        <div className="text-center text-gray-500 text-lg italic mt-12">
          Please select a date to view completed tasks.
        </div>
      )}

      {editTask && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-gray-800">Edit Task Status</h3>
            <p className="text-gray-600 font-medium">{editTask.title}</p>

            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="Completed">Completed</option>
              <option value="ToDo">ToDo</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditTask(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedTasks;
