import React, { useState, useEffect } from 'react';
import './App.css';

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setStoredValueAndLocalStorage = (value) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setStoredValueAndLocalStorage];
};


const App = () => {
  const [lists, setLists] = useState([
    { id: 1, name: 'Todo', tasks: [] },
    { id: 2, name: 'In Progress', tasks: [] },
    { id: 3, name: 'Done', tasks: [] },
  ]);

  const [tasks, setTasks] = useLocalStorage('tasks', []);

  useEffect(() => {
    // Load tasks from localStorage when the component mounts
    if (tasks.length === 0) {
      // If no tasks are stored, initialize with the default lists
      setLists([
        { id: 1, name: 'Todo', tasks: [] },
        { id: 2, name: 'In Progress', tasks: [] },
        { id: 3, name: 'Done', tasks: [] },
      ]);
    } else {
      // If tasks are stored, update the lists with the loaded tasks
      const updatedLists = lists.map((list) => ({
        ...list,
        tasks: tasks.filter((task) => task.listId === list.id),
      }));
      setLists(updatedLists);
    }
  }, [tasks]);

  const addTask = (listId, taskName) => {
    const newTask = { id: Date.now(), name: taskName, completed: false, listId };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const deleteTask = (listId, taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const updateTask = (listId, taskId, updatedTaskName) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, name: updatedTaskName } : task
      )
    );
  };

  const transferTask = (sourceListId, targetListId, taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, listId: targetListId } : task
      )
    );
  };

  return (
    <div className="app">
      <div className="list-container">
        {lists.map((list) => (
          <List
            key={list.id}
            list={list}
            addTask={addTask}
            deleteTask={deleteTask}
            updateTask={updateTask}
            transferTask={transferTask}
            lists={lists}
          />
        ))}
      </div>
    </div>
  );
};

const List = ({ list, addTask, deleteTask, updateTask, transferTask, lists }) => {
  const [newTaskName, setNewTaskName] = useState('');

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      addTask(list.id, newTaskName);
      setNewTaskName('');
    }
  };

  return (
    <div className="list">
      <h2>{list.name}</h2>
      <div className="task-input">
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="Add a new task"
        />
        <button onClick={handleAddTask}>Add</button>
      </div>
      <ul>
        {list.tasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            deleteTask={() => deleteTask(list.id, task.id)}
            updateTask={updateTask}
            transferTask={transferTask}
            lists={lists}
            currentListId={list.id}
          />
        ))}
      </ul>
    </div>
  );
};

const Task = ({ task, deleteTask, updateTask, transferTask, lists, currentListId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [taskName, setTaskName] = useState(task.name);

  const handleUpdateTask = () => {
    if (taskName.trim()) {
      updateTask(currentListId, task.id, taskName);
      setIsEditing(false);
    }
  };

  const handleTransferTask = (targetListId) => {
    transferTask(currentListId, targetListId, task.id);
  };

  return (
    <li className="task">
      {isEditing ? (
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onBlur={handleUpdateTask}
          autoFocus
        />
      ) : (
        <span onDoubleClick={() => setIsEditing(true)}>{task.name}</span>
      )}
      <div className="task-actions">
        <button onClick={deleteTask}>Delete</button>
        <select onChange={(e) => handleTransferTask(parseInt(e.target.value))}>
          <option value="">Move to...</option>
          {lists.filter((list) => list.id !== currentListId).map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
      </div>
    </li>
  );
};

export default App;
