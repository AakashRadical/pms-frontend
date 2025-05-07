import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMale, FaFemale } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';


const ViewAssignedTasks = () => {
  const [groupedTasks, setGroupedTasks] = useState({});
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const adminId = localStorage.getItem('id');

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (adminId) {
      fetchTasks();
    }
  }, [adminId]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/tasks/assigned/${adminId}`);
      const activeTasks = res.data.filter((task) => task.status !== 'Completed');
      const grouped = activeTasks.reduce((acc, task) => {
        const key = task.employee_id;
        if (!acc[key]) {
          acc[key] = {
            employeeName: `${task.first_name} ${task.last_name}`,
            gender: task.gender,
            tasks: [],
          };
        }
        acc[key].tasks.push(task);
        return acc;
      }, {});
      // Sort tasks by position
      Object.values(grouped).forEach((employee) => {
        employee.tasks.sort((a, b) => a.position - b.position);
      });
      setGroupedTasks(grouped);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleEditClick = (task) => {
    setEditTask(task);
    setEditForm({
      ...task,
      completion_date: task.completion_date ? formatDate(task.completion_date) : '',
    });
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';

  const handleUpdate = async () => {
    const updatedForm = {
      ...editForm,
      completion_date:
        editForm.status === 'Completed'
          ? editForm.completion_date || formatDate(new Date())
          : null,
    };

    try {
      await axios.put(`${BACKEND_URL}/api/tasks/${editTask.task_id}`, updatedForm);
      setEditTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const closeEditModal = () => {
    setEditTask(null);
    setEditForm({});
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // If no destination or dropped in the same position
    if (!destination || (source.index === destination.index && source.droppableId === destination.droppableId)) {
      return;
    }

    // Find the employee group
    const employeeId = source.droppableId;
    const newGroupedTasks = { ...groupedTasks };
    const tasks = [...newGroupedTasks[employeeId].tasks];

    // Reorder tasks
    const [reorderedTask] = tasks.splice(source.index, 1);
    tasks.splice(destination.index, 0, reorderedTask);

    // Update positions
    const updatedTasks = tasks.map((task, index) => ({
      ...task,
      position: index,
    }));

    newGroupedTasks[employeeId].tasks = updatedTasks;
    setGroupedTasks(newGroupedTasks);

    // Update backend with new task positions
    try {
      const updatePromises = updatedTasks.map((task) =>
        axios.put(`${BACKEND_URL}/api/tasks/${task.task_id}`, {
          title: task.title,
          description: task.description,
          start_date: task.start_date,
          due_date: task.due_date,
          priority: task.priority,
          status: task.status,
          completion_date: task.completion_date,
          position: task.position,
        })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating task order:', error);
      // Revert state if backend update fails
      fetchTasks();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-indigo-700 mb-8 sm:mb-12">
        📋 Assigned Tasks
      </h2>

      {Object.keys(groupedTasks).length === 0 ? (
        <p className="text-center text-gray-600 text-base sm:text-lg">No active tasks found.</p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(groupedTasks).map(([employeeId, { employeeName, gender, tasks }]) => (
              <div
                key={employeeId}
                className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl shadow-md hover:shadow-xl transition-all p-4 sm:p-6"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-blue-700 mb-3 sm:mb-4 flex items-center gap-2">
                  {gender === 'female' ? (
                    <FaFemale className="text-pink-500" />
                  ) : (
                    <FaMale className="text-blue-500" />
                  )}
                  {employeeName} —{' '}
                  <span className="text-gray-600 text-sm sm:text-base font-normal">
                    {tasks.length} task{tasks.length > 1 ? 's' : ''}
                  </span>
                </h3>

                <Droppable droppableId={employeeId}>
                  {(provided) => (
                    <ul
                      className="space-y-3 sm:space-y-4"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {tasks.map((task, index) => (
                        <Draggable
                          key={task.task_id}
                          draggableId={task.task_id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div className="flex justify-between items-center bg-white border border-gray-200 px-3 py-2 sm:px-4 sm:py-2.5 rounded-md shadow-sm hover:bg-gray-50">
                                <span className="text-gray-800 font-medium truncate">{task.title}</span>
                                <button
                                  onClick={() => handleEditClick(task)}
                                  className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm font-medium"
                                >
                                  ✏️ Edit
                                </button>
                              </div>
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {editTask && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-lg p-4 sm:p-6 shadow-lg max-h-[90vh] overflow-y-auto relative">
            <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
            <div className="grid grid-cols-1 gap-3">
              {['title', 'description'].map((field) => (
                <input
                  key={field}
                  name={field}
                  value={editForm[field]}
                  onChange={handleChange}
                  placeholder={field}
                  className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              ))}
              <input
                type="date"
                name="start_date"
                value={formatDate(editForm.start_date)}
                onChange={handleChange}
                className="border border-gray-300 px-3 py-2 rounded-md"
              />
              <input
                type="date"
                name="due_date"
                value={formatDate(editForm.due_date)}
                onChange={handleChange}
                className="border border-gray-300 px-3 py-2 rounded-md"
              />
              <select
                name="priority"
                value={editForm.priority}
                onChange={handleChange}
                className="border border-gray-300 px-3 py-2 rounded-md"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
              <select
                name="status"
                value={editForm.status}
                onChange={handleChange}
                className="border border-gray-300 px-3 py-2 rounded-md"
              >
                <option>Todo</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>

              {editForm.status === 'Completed' && (
                <input
                  type="date"
                  name="completion_date"
                  value={editForm.completion_date}
                  onChange={handleChange}
                  className="border border-gray-300 px-3 py-2 rounded-md"
                />
              )}

              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  ✅ Save
                </button>
                <button
                  onClick={closeEditModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm"
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAssignedTasks;