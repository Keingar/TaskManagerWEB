import React, { useState, useEffect } from 'react';
import '../styles/EditPopup.css'; 

const TaskTypeEnum = {
  INT: 'int',
  BOOL: 'bool',
  COMPLEX: 'complex',
};

const EditPopup = ({ task, activePopup, toggleTaskPopup, saveTaskChanges, deleteTask,  handleProgressChange,getComplexTasks }) => {

  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [maxProgress, setMaxProgress] = useState(task.maxIntProgress);
  const [parentTask, setParentTask] = useState(task.parentTask || '');
  const [complexTasks, setComplexTasks] = useState([]);  

  const handleSaveChanges = () => {
    saveTaskChanges({
      ...task,
      title,
      description,
      dueDate,
      maxProgress,  
      parentTask,
      
    });
  };

  useEffect(() => {
    const fetchedComplexTasks = getComplexTasks();
    setComplexTasks(fetchedComplexTasks);
  }, [getComplexTasks]);
  

  const handleDeleteTask = () => {
    deleteTask(task.id);
  };

  return (
    <>
      <div className="task-card-button edit-popup-container">
        <button
          className="progress-button"
          onClick={() => toggleTaskPopup('progress', task.id)}
        >
          Progress
        </button>
        {activePopup.type === 'progress' && activePopup.taskId === task.id && (
          <div className="edit-popup">
            {task.taskType === TaskTypeEnum.BOOL && (
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={task.isDone}
                    onChange={() => handleProgressChange(task)}
                  />
                  Is task done?
                </label>
              </div>
            )}
            {task.taskType === TaskTypeEnum.INT && (
              <div>
                <label>
                  Current Progress:
                  <input
                    type="number"
                    value={task.currentIntProgress}
                    onChange={(e) => {
                      const newProgress = parseInt(e.target.value, 10);
                      handleProgressChange(task, newProgress);
                    }}
                  />
                </label>
              </div>
            )}
            {task.taskType === TaskTypeEnum.COMPLEX && (
              <div>
                <p>To progress in complex tasks, you need to progress in subtasks.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="task-card-button edit-popup-container">
        <button
          className="edit-button"
          onClick={() => toggleTaskPopup('edit', task.id)}
        >
          Edit
        </button>
        {activePopup.type === 'edit' && activePopup.taskId === task.id && (
          <div className="edit-popup">
            {/* Title */}
            <div className="edit-popup-row">
              <label className="edit-popup-label">Title:</label>
              <input
                className="edit-popup-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="edit-popup-row">
              <label className="edit-popup-label">Description:</label>
              <textarea
                className="edit-popup-input edit-popup-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Due Date */}
            <div className="edit-popup-row">
              <label className="edit-popup-label">Due Date:</label>
              <input
                className="edit-popup-input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Max Progress */}
            <div className="edit-popup-row">
              <label className="edit-popup-label">Max Progress:</label>
              <input
              className="edit-popup-input"
              type="number"
              value={maxProgress}
              onChange={(e) => setMaxProgress(Number(e.target.value))} 
            />
            </div>

            {/* Parent Task */}
            <div className="edit-popup-row">
              <label className="edit-popup-label">Current Parent Task:</label>
              <select
                className="edit-popup-input"
                value={parentTask}
                onChange={(e) => setParentTask(e.target.value)}
              >
                <option value="">Select Parent Task</option>
                {complexTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <button className="edit-popup-button" onClick={handleSaveChanges}>
              Apply
            </button>
            <button className="edit-popup-button delete-button" onClick={handleDeleteTask}>
              Delete Task
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default EditPopup;
