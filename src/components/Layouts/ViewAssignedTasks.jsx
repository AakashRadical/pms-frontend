import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMale, FaFemale, FaEdit, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LOCAL_URL } from '../../utils/constant';

const ViewAssignedTasks = () => {
  const [groupedTasks, setGroupedTasks] = useState({});
  const [filteredTasks, setFilteredTasks] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [editTask, setEditTask] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addTask, setAddTask] = useState(null);
  const [addForm, setAddForm] = useState({
    title: '',
    description: '',
    start_date: '',
    due_date: '',
    priority: '',
    status: '',
    position: 0,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const adminId = localStorage.getItem('id');

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (adminId) {
      fetchTasks();
    }
  }, [adminId]);

  const fetchTasks = async () => {
    try {
      const employeeRes = await axios.get(`${BACKEND_URL}/api/employee/${adminId}`);
      const employees = employeeRes.data;

      const taskRes = await axios.get(`${BACKEND_URL}/api/tasks/assigned/${adminId}`);
      console.log('Fetched tasks:', taskRes.data);
      const activeTasks = taskRes.data.filter((task) => task.status !== 'Completed');

      const grouped = employees.reduce((acc, emp) => {
        acc[emp.id] = {
          employeeName: `${emp.first_name} ${emp.last_name}`,
          gender: emp.gender,
          tasks: [],
        };
        return acc;
      }, {});

      activeTasks.forEach((task) => {
        const key = task.employee_id;
        if (grouped[key]) {
          grouped[key].tasks.push(task);
        }
      });

      Object.values(grouped).forEach((employee) => {
        employee.tasks.sort((a, b) => (a.position || 0) - (b.position || 0));
      });

      setGroupedTasks(grouped);
      setFilteredTasks(grouped); // Initialize filtered tasks
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message);
      toast.error('Failed to fetch tasks');
    }
  };

  // Handle search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTasks(groupedTasks); // Show all tasks if search is empty
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = Object.entries(groupedTasks).reduce((acc, [employeeId, employee]) => {
      const matchesEmployee = employee.employeeName.toLowerCase().includes(query);
      const matchingTasks = employee.tasks.filter((task) =>
        task.title.toLowerCase().includes(query)
      );

      if (matchesEmployee || matchingTasks.length > 0) {
        acc[employeeId] = {
          ...employee,
          tasks: matchesEmployee ? employee.tasks : matchingTasks, // Show all tasks if employee matches, else only matching tasks
        };
      }
      return acc;
    }, {});

    setFilteredTasks(filtered);
  }, [searchQuery, groupedTasks]);

  const handleEditClick = (task) => {
    setEditTask(task);
    setEditForm({
      ...task,
      completion_date: task.completion_date ? formatDate(task.completion_date) : '',
    });
  };

  const handleChange = (e, formType) => {
    const { name, value } = e.target;
    if (formType === 'edit') {
      setEditForm((prev) => ({ ...prev, [name]: value }));
    } else {
      setAddForm((prev) => ({ ...prev, [name]: value }));
    }
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
      toast.success(`Task updated successfully`);
      setEditTask(null);
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error.response?.data || error.message);
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/tasks/${editTask.task_id}`);
      toast.success(`Task deleted successfully`);
      setEditTask(null);
      setShowDeleteConfirm(false);
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        toast.error('Task not found');
        await fetchTasks();
      } else {
        toast.error('Failed to delete task');
      }
    }
  };

  const closeEditModal = () => {
    setEditTask(null);
    setEditForm({});
    setShowDeleteConfirm(false);
  };

  const handleAddClick = (employeeId) => {
    setAddTask({ employeeId });
    setAddForm({
      title: '',
      description: '',
      start_date: '',
      due_date: '',
      priority: '',
      status: '',
      position: groupedTasks[employeeId].tasks.length,
    });
  };

  const closeAddModal = () => {
    setAddTask(null);
    setAddForm({
      title: '',
      description: '',
      start_date: '',
      due_date: '',
      priority: '',
      status: '',
      position: 0,
    });
  };

  const handleAddTask = async () => {
    if (!addForm.title) {
      toast.error('Please fill in the Title.');
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/tasks/create-task`, {
        ...addForm,
        admin_id: adminId,
        assignedEmployees: [addTask.employeeId],
      });
      toast.success('✅ Task assigned successfully');
      closeAddModal();
      await fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error.response?.data || error.message);
      toast.error('❌ Failed to assign task');
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination || (source.index === destination.index && source.droppableId === destination.droppableId)) {
      return;
    }

    const employeeId = source.droppableId;
    const newGroupedTasks = { ...groupedTasks };
    const tasks = [...newGroupedTasks[employeeId].tasks];

    const [reorderedTask] = tasks.splice(source.index, 1);
    tasks.splice(destination.index, 0, reorderedTask);

    const updatedTasks = tasks.map((task, index) => ({
      ...task,
      position: index,
    }));

    newGroupedTasks[employeeId].tasks = updatedTasks;
    setGroupedTasks(newGroupedTasks);

    try {
      const updatePromises = updatedTasks.map((task) =>
        axios.put(`${BACKEND_URL}/api/tasks/${task.task_id}`, {
          position: task.position,
        })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating task order:', error.response?.data || error.message);
      toast.error('Failed to update task order');
      await fetchTasks();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-center sm:text-left text-indigo-700">
          📋 Assigned Tasks
        </h2>
        <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center w-full sm:w-auto max-w-sm">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by employee or task..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {Object.keys(filteredTasks).length === 0 ? (
        <p className="text-center text-gray-600 text-base sm:text-lg">
          {searchQuery ? 'No matching employees or tasks found.' : 'No employees found.'}
        </p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(filteredTasks).map(([employeeId, { employeeName, gender, tasks }]) => (
              <div
                key={employeeId}
                className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-700 flex items-center gap-2 mb-2 sm:mb-0">
                    {gender === 'female' ? (
                      <FaFemale className="text-pink-500 text-xl" />
                    ) : (
                      <FaMale className="text-blue-500 text-xl" />
                    )}
                    <span className="truncate">{employeeName}</span>
                    <span className="text-gray-600 text-sm sm:text-base font-normal ml-2">
                      ({tasks.length} task{tasks.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  <button
                    onClick={() => handleAddClick(employeeId)}
                    className="bg-emerald-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors duration-200"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                </div>

                <Droppable droppableId={employeeId}>
                  {(provided) => (
                    <ul
                      className="space-y-3"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {tasks.length === 0 ? (
                        <li className="text-center text-gray-600 text-sm sm:text-base py-4">
                          No active tasks found.
                        </li>
                      ) : (
                        tasks.map((task, index) => (
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
                                className="bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors duration-200"
                              >
                                <div className="flex items-center justify-between p-3 sm:p-4">
                                  <span className="text-gray-800 text-sm sm:text-base font-medium flex-1 mr-4 break-words">
                                    {task.title}
                                  </span>
                                  <button
                                    onClick={() => handleEditClick(task)}
                                    className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                                  >
                                    <FaEdit className="text-xl" />
                                  </button>
                                </div>
                              </li>
                            )}
                          </Draggable>
                        ))
                      )}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4 sm:px-6">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {!showDeleteConfirm ? (
              <>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Edit Task</h3>
                <div className="grid grid-cols-1 gap-4">
                  {['title', 'description'].map((field) => (
                    <div key={field}>
                      <label className="block text-gray-700 font-medium capitalize mb-2">
                        {field}
                      </label>
                      {field === 'description' ? (
                        <textarea
                          name={field}
                          value={editForm[field] || ''}
                          onChange={(e) => handleChange(e, 'edit')}
                          placeholder={field}
                          className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 resize-none"
                          rows="4"
                        />
                      ) : (
                        <input
                          name={field}
                          value={editForm[field] || ''}
                          onChange={(e) => handleChange(e, 'edit')}
                          placeholder={field}
                          className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                        />
                      )}
                    </div>
                  ))}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Start Date</label>
                      <input
                        type="date"
                        name="start_date"
                        value={formatDate(editForm.start_date)}
                        onChange={(e) => handleChange(e, 'edit')}
                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Due Date</label>
                      <input
                        type="date"
                        name="due_date"
                        value={formatDate(editForm.due_date)}
                        onChange={(e) => handleChange(e, 'edit')}
                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Priority</label>
                    <select
                      name="priority"
                      value={editForm.priority || ''}
                      onChange={(e) => handleChange(e, 'edit')}
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      <option value="">Select Priority</option>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Status</label>
                    <select
                      name="status"
                      value={editForm.status || ''}
                      onChange={(e) => handleChange(e, 'edit')}
                      className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      <option value="">Select Status</option>
                      <option>Todo</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  {editForm.status === 'Completed' && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Completion Date</label>
                      <input
                        type="date"
                        name="completion_date"
                        value={editForm.completion_date}
                        onChange={(e) => handleChange(e, 'edit')}
                        className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                      />
                    </div>
                  )}
                  <div className="flex justify-between gap-3 mt-6">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                    >
                      <FaTrash className="text-sm" /> Delete
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdate}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                      >
                        <span>✅ Save</span>
                      </button>
                      <button
                        onClick={closeEditModal}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                      >
                        <span>❌ Cancel</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Confirm Deletion</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete the task "<strong>{editForm.title}</strong>"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                  >
                    <FaTrash className="text-sm" /> Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                  >
                    <span>❌ Cancel</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {addTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4 sm:px-6">
          <div className="bg-white w-full max-w-lg rounded-xl p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">Add New Task</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={addForm.title}
                  onChange={(e) => handleChange(e, 'add')}
                  placeholder="Enter task title"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={addForm.description}
                  onChange={(e) => handleChange(e, 'add')}
                  placeholder="Enter task description"
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200 resize-none"
                  rows="4"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={addForm.start_date}
                    onChange={(e) => handleChange(e, 'add')}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    value={addForm.due_date}
                    onChange={(e) => handleChange(e, 'add')}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Priority</label>
                <select
                  name="priority"
                  value={addForm.priority}
                  onChange={(e) => handleChange(e, 'add')}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <option value="">Select Priority</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Status</label>
                <select
                  name="status"
                  value={addForm.status}
                  onChange={(e) => handleChange(e, 'add')}
                  className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <option value="">Select Status</option>
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleAddTask}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                >
                  <FaPlus className="text-sm" /> Add Task
                </button>
                <button
                  onClick={closeAddModal}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200"
                >
                  <span>❌ Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default ViewAssignedTasks;