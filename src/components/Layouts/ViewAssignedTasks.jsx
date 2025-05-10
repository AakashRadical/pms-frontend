import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaMale, FaFemale, FaEdit, FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      setFilteredTasks(grouped);
    } catch (error) {
      console.error('Error fetching data:', error.response?.data || error.message);
      toast.error('Failed to fetch tasks');
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTasks(groupedTasks);
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
          tasks: matchesEmployee ? employee.tasks : matchingTasks,
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
    <div className="w-full px-4 sm:px-6 py-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-indigo-900 text-center sm:text-left">
          📋 Assigned Tasks
        </h2>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center w-full sm:w-64">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-indigo-200 bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
            />
            <FaSearch className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-indigo-400 text-sm" />
          </div>
        </div>
      </div>

      {Object.keys(filteredTasks).length === 0 ? (
        <p className="text-center text-indigo-600 text-sm sm:text-base font-medium">
          {searchQuery ? 'No matching tasks found.' : 'No employees found.'}
        </p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {Object.entries(filteredTasks).map(([employeeId, { employeeName, gender, tasks }]) => (
              <div
                key={employeeId}
                className="bg-white border border-indigo-100 rounded-xl shadow-md p-4 sm:p-5 mb-4 break-inside-avoid bg-gradient-to-r from-indigo-50/50 to-purple-50/50"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-indigo-900 flex items-center gap-1.5 mb-2 sm:mb-0">
                    {gender === 'female' ? (
                      <FaFemale className="text-indigo-500 text-lg" />
                    ) : (
                      <FaMale className="text-purple-500 text-lg" />
                    )}
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">{employeeName}</span>
                    <span className="text-indigo-500 text-xs sm:text-sm ml-1">
                      ({tasks.length} task{tasks.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  <button
                    onClick={() => handleAddClick(employeeId)}
                    className="bg-indigo-500 cursor-pointer hover:bg-indigo-600 text-white px-2 py-1 rounded-md text-xs sm:text-sm flex items-center gap-1 transition-all duration-200"
                  >
                    <FaPlus className="text-lg" />
                  </button>
                </div>

                <Droppable droppableId={employeeId}>
                  {(provided) => (
                    <ul
                      className="space-y-2"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {tasks.length === 0 ? (
                        <li className="text-center text-indigo-600 text-xs sm:text-sm py-3 font-medium">
                          No active tasks.
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
                                className="bg-indigo-50/50 border border-indigo-200 rounded-md p-2 flex items-center justify-between"
                              >
                                <span className="text-indigo-800 text-xs sm:text-sm font-medium truncate flex-1 mr-2">
                                  {task.title}
                                </span>
                                <button
                                  onClick={() => handleEditClick(task)}
                                  className="text-purple-600 hover:text-purple-800 transition-all duration-200"
                                >
                                  <FaEdit className="text-lg" />
                                </button>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
            {!showDeleteConfirm ? (
              <>
                <h3 className="text-lg sm:text-xl font-semibold text-indigo-900 mb-4">Edit Task</h3>
                <div className="grid grid-cols-1 gap-3">
                  {['title', 'description'].map((field) => (
                    <div key={field}>
                      <label className="block text-indigo-800 text-sm font-medium capitalize mb-1">
                        {field}
                      </label>
                      {field === 'description' ? (
                        <textarea
                          name={field}
                          value={editForm[field] || ''}
                          onChange={(e) => handleChange(e, 'edit')}
                          placeholder={field}
                          className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200 resize-none"
                          rows="3"
                        />
                      ) : (
                        <input
                          name={field}
                          value={editForm[field] || ''}
                          onChange={(e) => handleChange(e, 'edit')}
                          placeholder={field}
                          className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
                        />
                      )}
                    </div>
                  ))}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-indigo-800 text-sm font-medium mb-1">Start Date</label>
                      <input
                        type="date"
                        name="start_date"
                        value={formatDate(editForm.start_date)}
                        onChange={(e) => handleChange(e, 'edit')}
                        className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-indigo-800 text-sm font-medium mb-1">Due Date</label>
                      <input
                        type="date"
                        name="due_date"
                        value={formatDate(editForm.due_date)}
                        onChange={(e) => handleChange(e, 'edit')}
                        className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-indigo-800 text-sm font-medium mb-1">Priority</label>
                    <select
                      name="priority"
                      value={editForm.priority || ''}
                      onChange={(e) => handleChange(e, 'edit')}
                      className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
                    >
                      <option value="">Select Priority</option>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-indigo-800 text-sm font-medium mb-1">Status</label>
                    <select
                      name="status"
                      value={editForm.status || ''}
                      onChange={(e) => handleChange(e, 'edit')}
                      className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
                    >
                      <option value="">Select Status</option>
                      <option>Todo</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>
                  {editForm.status === 'Completed' && (
                    <div>
                      <label className="block text-indigo-800 text-sm font-medium mb-1">Completion Date</label>
                      <input
                        type="date"
                        name="completion_date"
                        value={editForm.completion_date}
                        onChange={(e) => handleChange(e, 'edit')}
                        className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
                      />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="bg-purple-500 cursor-pointer hover:bg-purple-600 text-white px-4 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all duration-200"
                    >
                      <FaTrash className="text-xs" /> Delete
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        className="bg-indigo-500 cursor-pointer hover:bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all duration-200"
                      >
                        <span>✅ Save</span>
                      </button>
                      <button
                        onClick={closeEditModal}
                        className="bg-gray-400 cursor-pointer hover:bg-gray-500 text-white px-4 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all duration-200"
                      >
                        <span>❌ Cancel</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg sm:text-xl font-semibold text-indigo-900 mb-4">Confirm Deletion</h3>
                <p className="text-indigo-700 text-sm mb-4">
                  Are you sure you want to delete the task "<strong>{editForm.title}</strong>"? This action cannot be undone.
                </p>
                <div className="flex justify-end  gap-2">
                  <button
                    onClick={handleDelete}
                    className="bg-purple-500 cursor-pointer hover:bg-purple-600 text-white px-4 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all duration-200"
                  >
                    <FaTrash className="text-xs" /> Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-gray-400 cursor-pointer hover:bg-gray-500 text-white px-4 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all duration-200"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-md rounded-xl p-4 sm:p-6 max-h-[85vh] overflow-y-auto bg-gradient-to-br from-indigo-50/50 to-purple-50/50">
            <h3 className="text-lg sm:text-xl font-semibold text-indigo-900 mb-4">Add New Task</h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-indigo-800 text-sm font-medium mb-1">
                  Title <span className="text-purple-500">*</span>
                </label>
                <input
                  name="title"
                  value={addForm.title}
                  onChange={(e) => handleChange(e, 'add')}
                  placeholder="Enter task title"
                  className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-indigo-800 text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={addForm.description}
                  onChange={(e) => handleChange(e, 'add')}
                  placeholder="Enter task description"
                  className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200 resize-none"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-indigo-800 text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={addForm.start_date}
                    onChange={(e) => handleChange(e, 'add')}
                    className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-indigo-800 text-sm font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    value={addForm.due_date}
                    onChange={(e) => handleChange(e, 'add')}
                    className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-indigo-800 text-sm font-medium mb-1">Priority</label>
                <select
                  name="priority"
                  value={addForm.priority}
                  onChange={(e) => handleChange(e, 'add')}
                  className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
                >
                  <option value="">Select Priority</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>
              <div>
                <label className="block text-indigo-800 text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={addForm.status}
                  onChange={(e) => handleChange(e, 'add')}
                  className="w-full border border-indigo-200 px-3 py-1.5 rounded-md bg-indigo-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-all duration-200"
                >
                  <option value="">Select Status</option>
                  <option>Todo</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleAddTask}
                  className="bg-indigo-500 cursor-pointer hover:bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all duration-200"
                >
                  <FaPlus className="text-xs" /> Add Task
                </button>
                <button
                  onClick={closeAddModal}
                  className="bg-gray-400 cursor-pointer hover:bg-gray-500 text-white px-4 py-1.5 rounded-md text-sm flex items-center gap-1 transition-all duration-200"
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