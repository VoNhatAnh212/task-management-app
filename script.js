// ========================
// To-Do List Application
// ========================

// DOM Elements
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const emptyMessage = document.getElementById('emptyMessage');

// Initialize tasks from localStorage on page load
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// ========================
// Initialize Application
// ========================

document.addEventListener('DOMContentLoaded', function () {
    // Set today's date as the default value in the date input
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dueDateInput.value = `${year}-${month}-${day}`;

    renderTasks();
    updateTaskCount();
});

// ========================
// Event Listeners
// ========================

// Add task on button click
addBtn.addEventListener('click', addTask);

// Add task on Enter key press
taskInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

// Clear focus state after typing
taskInput.addEventListener('focus', function () {
    this.style.borderColor = '#667eea';
});

// ========================
// Add Task Function
// ========================

function addTask() {
    // Get input value and trim whitespace
    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;

    // Validation: Check if input is empty
    if (taskText === '') {
        showAlert('Please enter a task before adding!');
        taskInput.focus();
        return;
    }

    // Validation: Check if due date is empty
    if (dueDate === '') {
        showAlert('Please select a due date!');
        dueDateInput.focus();
        return;
    }

    // Validation: Check if due date is valid (not in the past)
    if (!isDateValid(dueDate)) {
        showAlert('Due date cannot be in the past. Please select today or a future date.');
        dueDateInput.focus();
        return;
    }

    // Validation: Check if task already exists
    if (tasks.some(task => task.text.toLowerCase() === taskText.toLowerCase())) {
        showAlert('This task already exists!');
        taskInput.value = '';
        taskInput.focus();
        return;
    }

    // Create new task object with due date
    const newTask = {
        id: Date.now(), // Unique identifier using timestamp
        text: taskText,
        dueDate: dueDate, // Store date in YYYY-MM-DD format
        completed: false
    };

    // Add task to array
    tasks.push(newTask);

    // Save to localStorage
    saveTasks();

    // Clear input fields
    taskInput.value = '';
    dueDateInput.value = '';
    taskInput.focus();

    // Re-render task list
    renderTasks();
    updateTaskCount();
}

// ========================
// Delete Task Function
// ========================

function deleteTask(id) {
    // Find task index
    const index = tasks.findIndex(task => task.id === id);

    // Remove task if found
    if (index > -1) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
}

// ========================
// Toggle Task Completion
// ========================

function toggleTaskCompletion(id) {
    // Find task and toggle completed status
    const task = tasks.find(task => task.id === id);

    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// ========================
// Render Task List
// ========================

function renderTasks() {
    // Clear existing task list
    taskList.innerHTML = '';

    // Check if there are no tasks
    if (tasks.length === 0) {
        emptyMessage.classList.add('show');
        return;
    }

    // Hide empty message if there are tasks
    emptyMessage.classList.remove('show');

    // Create and add each task to the list
    tasks.forEach(task => {
        // Create list item
        const li = document.createElement('li');

        // Determine task status and apply appropriate classes
        let statusClass = '';
        if (!task.completed) {
            const dayStatus = getDayStatus(task.dueDate);
            if (dayStatus === 'overdue') {
                li.classList.add('task-item', 'overdue');
                statusClass = 'overdue';
            } else if (dayStatus === 'due-today') {
                li.classList.add('task-item', 'due-today');
                statusClass = 'due-today';
            } else {
                li.classList.add('task-item', 'due-upcoming');
                statusClass = 'due-upcoming';
            }
        } else {
            li.className = 'task-item completed';
        }

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompletion(task.id));

        // Create task content container
        const contentDiv = document.createElement('div');
        contentDiv.className = 'task-content';

        // Create task text span
        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = task.text;

        // Create metadata container
        const metaDiv = document.createElement('div');
        metaDiv.className = 'task-meta';

        // Add due date display
        const dueDateSpan = document.createElement('span');
        dueDateSpan.className = 'task-due-date';
        dueDateSpan.textContent = `Due: ${formatDate(task.dueDate)}`;

        // Add status indicator (only if not completed)
        if (!task.completed && statusClass) {
            const statusSpan = document.createElement('span');
            statusSpan.className = `task-status ${statusClass}`;
            statusSpan.textContent = getDayStatusText(task.dueDate);
            metaDiv.appendChild(statusSpan);
        }

        metaDiv.appendChild(dueDateSpan);

        // Append text and metadata to content div
        contentDiv.appendChild(span);
        contentDiv.appendChild(metaDiv);

        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        // Append elements to list item
        li.appendChild(checkbox);
        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);

        // Append list item to task list
        taskList.appendChild(li);
    });
}

// ========================
// Update Task Counter
// ========================

function updateTaskCount() {
    taskCount.textContent = tasks.length;
}

// ========================
// Date Validation Function
// ========================

function isDateValid(dateString) {
    // Parse the date string (format: YYYY-MM-DD)
    const selectedDate = new Date(dateString);
    const today = new Date();

    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // Check if selected date is today or in the future
    return selectedDate >= today;
}

// ========================
// Format Date Function
// ========================

function formatDate(dateString) {
    // Convert YYYY-MM-DD to readable format (e.g., "May 28, 2026")
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', options);
}

// ========================
// Get Day Status Function
// ========================

function getDayStatus(dateString) {
    // Returns: 'overdue', 'due-today', or 'due-upcoming'
    const selectedDate = new Date(dateString);
    const today = new Date();

    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    // Calculate difference in days
    const timeDiff = selectedDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) {
        return 'overdue';
    } else if (daysDiff === 0) {
        return 'due-today';
    } else {
        return 'due-upcoming';
    }
}

// ========================
// Get Day Status Text Function
// ========================

function getDayStatusText(dateString) {
    // Returns readable status text
    const status = getDayStatus(dateString);

    if (status === 'overdue') {
        return 'Overdue';
    } else if (status === 'due-today') {
        return 'Due Today';
    } else {
        return 'Upcoming';
    }
}

// ========================
// Save Tasks to localStorage
// ========================

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ========================
// Show Alert Function
// ========================

function showAlert(message) {
    alert(message);
}

// ========================
// Optional: Clear All Tasks Function
// ========================

function clearAllTasks() {
    if (tasks.length === 0) {
        showAlert('No tasks to clear!');
        return;
    }

    if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
        tasks = [];
        saveTasks();
        renderTasks();
        updateTaskCount();
    }
}

// ========================
// Keyboard Shortcuts (Optional Enhancement)
// ========================

document.addEventListener('keydown', function (event) {
    // Focus input field on Ctrl+N or Cmd+N
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        taskInput.focus();
    }
});
