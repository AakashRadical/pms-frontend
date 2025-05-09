import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const UserCompletedTasks = ({ tasks }) => {
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  const handleToggleDetails = (taskId) => {
    setExpandedTaskId((prevId) => (prevId === taskId ? null : taskId));
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';

  // Handle date picker change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Format date to YYYY-MM-DD Old function to get local YYYY-MM-DD
  const toLocalYYYYMMDD = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter tasks based on selected date
  const filteredTasks = selectedDate
    ? tasks.filter((task) => {
        if (!task.completion_date) return false;
        const taskDate = toLocalYYYYMMDD(task.completion_date);
        return taskDate === selectedDate;
      })
    : tasks;

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto">
      {/* Date Picker */}
      <div className="flex items-center gap-3 mb-4">
        <label
          htmlFor="completion-date"
          className="text-sm font-medium text-gray-700"
        >
          Filter by Completion Date:
        </label>
        <input
          type="date"
          id="completion-date"
          value={selectedDate}
          onChange={handleDateChange}
          className="border border-gray-200 rounded-lg p-2 text-sm text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-200"
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate('')}
            className="text-xs text-green-600 hover:text-green-800 transition duration-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        filteredTasks.map((task) => (
          <div
            key={task.task_id}
            className={`relative bg-white rounded-lg p-4 shadow-sm transition-all duration-300 hover:shadow-md border border-gray-100 bg-gradient-to-r from-green-50 via-white to-green-50 ${
              expandedTaskId === task.task_id ? 'ring-2 ring-green-400 ring-opacity-50' : ''
            }`}
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => handleToggleDetails(task.task_id)}
            >
              <h3 className="text-base font-medium text-gray-900 truncate">
                {task.title}
              </h3>
              {expandedTaskId === task.task_id ? (
                <FaChevronUp className="text-green-500 text-sm" />
              ) : (
                <FaChevronDown className="text-green-500 text-sm" />
              )}
            </div>

            {/* Details section with controlled height and fade transition */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                expandedTaskId === task.task_id ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {expandedTaskId === task.task_id && (
                <div className="mt-3 text-sm text-gray-600 space-y-1.5">
                  <p>
                    <strong className="font-semibold">Description:</strong>{' '}
                    {task.description || 'No description'}
                  </p>
                  <p>
                    <strong className="font-semibold">Completed On:</strong>{' '}
                    {formatDate(task.completion_date)}
                  </p>
                  <p>
                    <strong className="font-semibold">Start Date:</strong>{' '}
                    {formatDate(task.start_date)}
                  </p>
                  <p>
                    <strong className="font-semibold">Due Date:</strong>{' '}
                    {formatDate(task.due_date)}
                  </p>
                  <p>
                    <strong className="font-semibold">Priority:</strong>{' '}
                    {task.priority || 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-600 text-center">
          No tasks completed on {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'the selected date'}.
        </p>
      )}
    </div>
  );
};

export default UserCompletedTasks;