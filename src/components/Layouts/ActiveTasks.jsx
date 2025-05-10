import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ActiveTasks = ({ tasks }) => {
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const handleToggleDetails = (taskId) => {
    setExpandedTaskId((prevId) => (prevId === taskId ? null : taskId));
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : 'N/A';

  return (
    <div className="flex flex-col gap-4 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {tasks.map((task) => (
        <div
          key={task.task_id}
          className={`relative bg-white rounded-xl p-4 sm:p-5 shadow-md transition-all duration-300 hover:shadow-lg ${
            expandedTaskId === task.task_id
              ? 'ring-2 ring-purple-400 ring-opacity-50'
              : 'border border-indigo-100'
          } bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50`}
        >
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => handleToggleDetails(task.task_id)}
          >
            <h3 className="text-base sm:text-lg font-semibold text-indigo-900 truncate">
              {task.title}
            </h3>
            {expandedTaskId === task.task_id ? (
              <FaChevronUp className="text-purple-600 text-sm sm:text-base" />
            ) : (
              <FaChevronDown className="text-purple-600 text-sm sm:text-base" />
            )}
          </div>

          {/* Details section with controlled height and fade transition */}
          <div
            className={`overflow-hidden transition-all duration-300 ${
              expandedTaskId === task.task_id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            {expandedTaskId === task.task_id && (
              <div className="mt-3 text-xs sm:text-sm text-indigo-700 space-y-2">
                <p>
                  <strong className="font-semibold">Description:</strong>{' '}
                  {task.description || 'No description'}
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
                <p>
                  <strong className="font-semibold">Status:</strong>{' '}
                  {task.status}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActiveTasks;