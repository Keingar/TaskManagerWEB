import React, { useState, useEffect } from 'react';  
import '../styles/Content.css';  
import { supabase } from '../supabaseClient';  
import { Navigate } from 'react-router-dom';
import EditPopup from '../popups/EditPopup'; 
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const TaskTypeEnum = {
  INT: 'int',
  BOOL: 'bool',
  COMPLEX: 'complex',
};

function Content() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState(TaskTypeEnum.INT);
  const [dueDate, setDueDate] = useState('');
  const [maxProgress, setMaxProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTasks, setFilteredTasks] = useState(tasks);
  const [activePopup, setActivePopup] = useState({ type: null, taskId: null });
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user:', error.message);
        } else {
          console.log('Fetched user:', user);
          setUser(user);
        }
      } catch (error) {
        console.error('Error during user fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('Tasks')  
          .select('*');
        
        if (error) {
          console.error('Error fetching tasks:', error.message);
        } else {
          console.log('Fetched tasks:', data); 
          setTasks(data);
          setFilteredTasks(data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
  
    fetchTasks();
  }, []); 
  

  useEffect(() => {
    setFilteredTasks(
      tasks.filter(task =>
        (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase())) 
      )
    );
  }, [searchTerm, tasks]);
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const togglePopup = () => {
    setPopupVisible(!popupVisible);
  };

  const toggleTaskPopup = (type, taskId) => {
    setActivePopup((prev) => {
      if (prev.type === type && prev.taskId === taskId) {
        return { type: null, taskId: null }; 
      }
      return { type, taskId }; 
    });
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      console.error('Title cannot be empty');

      setErrorMessage('Title cannot be empty');
      return; 
    }
    setErrorMessage('');

    const taskDueDate = dueDate || null;
  
    const validMaxIntProgress = maxProgress < 1 ? 1 : maxProgress;
  
    const newTask = {
      title,
      description,
      isDone: false,
      taskType,
      dateOfCreation: new Date().toISOString(),
      dueDate: taskDueDate,  
      currentIntProgress: 0,
      maxIntProgress: taskType === TaskTypeEnum.BOOL || taskType === TaskTypeEnum.COMPLEX ? 1 : validMaxIntProgress, 
    };
  
    try {
      const { data, error } = await supabase
        .from('Tasks')
        .insert([newTask])
        .select()
        .single(); 
  
      if (error) {
        console.error('Error creating task:', error.message);
      } else if (data) {
        console.log('Task created successfully:', data);
  
        setTasks((prevTasks) => [...prevTasks, data]);
        setFilteredTasks((prevFilteredTasks) => [...prevFilteredTasks, data]);
  
        setTitle('');
        setDescription('');
        setTaskType(TaskTypeEnum.INT);
        setDueDate(''); 
        setMaxProgress(0);
        setPopupVisible(false);
      } else {
        console.error('Task creation failed: No valid data returned from Supabase.');
      }
    } catch (error) {
      console.error('Error during task creation:', error.message);
    }
  };
  
  const getComplexTasks = (filteredTasks = []) => {
  
    return filteredTasks.filter(task => task.taskType === TaskTypeEnum.COMPLEX);
  };
  
  const handleSaveTaskChanges = async (updatedTask) => {
    try {
      const { data, error } = await supabase
        .from('Tasks') 
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          dueDate: updatedTask.dueDate,
          maxIntProgress: updatedTask.maxProgress,
        })
        .eq('id', updatedTask.id)
        .select();
  
      if (error) {
        console.error('Error updating task:', error.message);
      } else if (data && data.length > 0) {
        console.log('Task updated successfully:', data[0]);
  
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === updatedTask.id ? { ...task, ...updatedTask } : task
          )
        );
        setFilteredTasks((prevFilteredTasks) =>
          prevFilteredTasks.map((task) =>
            task.id === updatedTask.id ? { ...task, ...updatedTask } : task
          )
        );
      } else {
        console.error('Task update failed: No valid data returned from Supabase.');
      }
    } catch (error) {
      console.error('Error during task update:', error.message);
    } finally {
      setActivePopup({ type: null, taskId: null }); 
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('Tasks') 
        .delete()
        .eq('id', taskId);
  
      if (error) {
        console.error('Error deleting task:', error.message);
        return;
      }
  
      console.log('Task deleted successfully:', taskId);
  
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      setFilteredTasks((prevFilteredTasks) =>
        prevFilteredTasks.filter((task) => task.id !== taskId)
      );
  
      setActivePopup({ type: null, taskId: null });
    } catch (error) {
      console.error('Error during task deletion:', error.message);
    }
  };
  
  const handleProgressChange = async (task, newProgress = null) => {

    newProgress = newProgress < 0 ? 0 : newProgress;

    try {
      let updatedFields = {};
  
      if (task.taskType === 'bool') {
        const isDone = !task.isDone; 
        updatedFields = {
          isDone: isDone,
          currentIntProgress: isDone ? 1 : 0,
        };
      } else if (task.taskType === 'int') {
        const currentIntProgress = Math.min(
          newProgress !== null ? newProgress : task.currentIntProgress,
          task.maxIntProgress
        );
        const isDone = currentIntProgress === task.maxIntProgress;
  
        updatedFields = {
          currentIntProgress: currentIntProgress,
          isDone: isDone,
        };
      } else {
        console.warn(`Progress update is not handled for task type: ${task.taskType}`);
        return;
      }
  
      const { data, error } = await supabase
        .from('Tasks') 
        .update(updatedFields)
        .eq('id', task.id)
        .select(); 
  
      if (error) {
        console.error('Error updating progress:', error.message);
      } else if (data && data.length > 0) {
        console.log('Progress updated successfully:', data[0]);
  
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.id === task.id ? { ...t, ...updatedFields } : t
          )
        );
        setFilteredTasks((prevFilteredTasks) =>
          prevFilteredTasks.map((t) =>
            t.id === task.id ? { ...t, ...updatedFields } : t
          )
        );
      } else {
        console.error('Progress update failed: No valid data returned from Supabase.');
      }
    } catch (error) {
      console.error('Error during progress update:', error.message);
    }
  };

  const onDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) return; 

    if (destination.index === source.index) return;

    const updatedTasks = Array.from(filteredTasks);
    const [removed] = updatedTasks.splice(source.index, 1);
    updatedTasks.splice(destination.index, 0, removed);

    setFilteredTasks(updatedTasks);
  };

  return (
    <div className="app-container">
      <div className="top-block-1"></div>

      <div className="top-block-2">
        <div className="top-left">
          <button className="button button-plan-tasks" onClick={togglePopup}>
            Plan Tasks
          </button>
        </div>
        <div className="top-right">
          <input
            type="text"
            placeholder="Search tasks"
            className="input-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="button button-search">Search</button>
          <button className="button button-sort">Sort</button>
          <button className="button button-filter">Filter</button>
        </div>
      </div>

      {popupVisible && (
        <div className="popup">
          <h3>Create a New Task</h3>
          <div className="form-group">
            <label className="label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-search"
            />
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}

          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-description"
            />
          </div>
          <div className="form-group">
            <label className="label">Task Type</label>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              className="input-search"
            >
              <option value={TaskTypeEnum.INT}>Integer</option>
              <option value={TaskTypeEnum.BOOL}>Boolean</option>
              <option value={TaskTypeEnum.COMPLEX}>Complex</option>
            </select>
          </div>
          <div className="form-group">
            <label className="label">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input-search"
            />
          </div>
          <div className="form-group">
            <label className="label">Max Progress</label>
            <input
              type="number"
              value={maxProgress}
              onChange={(e) => setMaxProgress(e.target.value)}
              className="input-search"
            />
          </div>
          <button className="button-create-task" onClick={handleCreateTask}>
            Create Task
          </button>
        </div>
      )}

      <div className="block-3">
        <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="block3" key={filteredTasks.length}>
            {(provided) => (
              <div
                ref={provided.innerRef} 
                {...provided.droppableProps}  
                className="task-list"
              >
                {filteredTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}  
                        {...provided.draggableProps}  
                        {...provided.dragHandleProps} 
                        className="task-card"
                      >
                        <div className="task-card-top">
                          <div className="task-card-title">
                            <span className="task-title">{task.title}</span>
                          </div>
                          <div className="task-card-date">
                            <span className="task-date">{task.dueDate}</span>
                          </div>
                          
                          <EditPopup
                          task={task}
                          activePopup={activePopup}
                          toggleTaskPopup={toggleTaskPopup}
                          saveTaskChanges={handleSaveTaskChanges}
                          deleteTask={handleDeleteTask}
                          handleProgressChange={handleProgressChange}
                          getComplexTasks={getComplexTasks}

                        />

                        </div>
                        <div className="task-card-middle">
                        <div className="task-card-description">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: (task.description || '').replace(/\n/g, '<br />'),
                          }}
                        />
                        </div>
                        </div>
                        <div className="task-card-bottom">
                          <div className="progress-bar-container">
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${(task.currentIntProgress / task.maxIntProgress) * 100}%`,

                                }}
                              />
                            </div>
                            <div className="progress-text-container">
                              <span className="progress-text">
                                {task.currentIntProgress}/{task.maxIntProgress} 
                                Percentage: {((task.currentIntProgress / task.maxIntProgress) * 100).toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder} 
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default Content;
