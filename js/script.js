// Ambil elemen
const todoInput = document.querySelector('.text-input');
const dateInput = document.querySelector('.date-input');
const addBtn = document.querySelector('.add-btn');
const deleteAllBtn = document.querySelector('.danger-btn');
const filterBtn = document.querySelector('.outline-btn');
let currentFilter = 'all';

// Data
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let mode = 'add-task';
let targetTaskIdx = null;
let targetSubtaskIdx = null;

// Helper
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Mode input
function setInputMode(newMode, idx = null, sidx = null) {
  mode = newMode;
  targetTaskIdx = idx;
  targetSubtaskIdx = sidx;
  if (mode === 'add-task') {
    todoInput.placeholder = 'Add a todo . . .';
    todoInput.value = '';
    dateInput.style.display = '';
    addBtn.innerHTML = '+';
  } else if (mode === 'edit-task') {
    todoInput.placeholder = 'Edit task: ' + (todos[idx]?.text || '');
    todoInput.value = todos[idx]?.text || '';
    dateInput.style.display = '';
    dateInput.value = todos[idx]?.date || '';
    addBtn.innerHTML = '✓';
  } else if (mode === 'add-subtask') {
    todoInput.placeholder = 'Add subtask to: ' + (todos[idx]?.text || '');
    todoInput.value = '';
    dateInput.style.display = 'none';
    addBtn.innerHTML = '✓';
  } else if (mode === 'edit-subtask') {
    todoInput.placeholder = 'Edit subtask: ' + (todos[idx]?.subtasks[sidx]?.text || '');
    todoInput.value = todos[idx]?.subtasks[sidx]?.text || '';
    dateInput.style.display = 'none';
    addBtn.innerHTML = '✓';
  }
  todoInput.focus();
}

addBtn.onclick = function() {
  const text = todoInput.value.trim();
  if (mode === 'add-task') {
    const date = dateInput.value;
    if (!text) return;
    todos.push({ text, date, completed: false, subtasks: [] });
    saveTodos();
    renderTodos();
    todoInput.value = '';
    dateInput.value = '';
  } else if (mode === 'edit-task') {
    if (!text || targetTaskIdx === null) return;
    todos[targetTaskIdx].text = text;
    todos[targetTaskIdx].date = dateInput.value;
    saveTodos();
    renderTodos();
    setInputMode('add-task');
  } else if (mode === 'add-subtask') {
    if (!text || targetTaskIdx === null) return;
    if (!todos[targetTaskIdx].subtasks) todos[targetTaskIdx].subtasks = [];
    todos[targetTaskIdx].subtasks.push({ text, completed: false });
    saveTodos();
    renderTodos();
    setInputMode('add-task');
  } else if (mode === 'edit-subtask') {
    if (!text || targetTaskIdx === null || targetSubtaskIdx === null) return;
    todos[targetTaskIdx].subtasks[targetSubtaskIdx].text = text;
    saveTodos();
    renderTodos();
    setInputMode('add-task');
  }
};

// Delete all
deleteAllBtn.onclick = function() {
  if (confirm('Delete all tasks?')) {
    todos = [];
    saveTodos();
    renderTodos();
  }
};

// Toggle done
window.toggleTodo = function(idx) {
  todos[idx].completed = !todos[idx].completed;
  saveTodos();
  renderTodos();
};
window.toggleSubtask = function(idx, sidx) {
  todos[idx].subtasks[sidx].completed = !todos[idx].subtasks[sidx].completed;
  saveTodos();
  renderTodos();
};

// Delete
window.deleteTodo = function(idx) {
  todos.splice(idx, 1);
  saveTodos();
  renderTodos();
};
window.deleteSubtask = function(idx, sidx) {
  todos[idx].subtasks.splice(sidx, 1);
  saveTodos();
  renderTodos();
};

// Edit
window.startEditTask = function(idx) {
  setInputMode('edit-task', idx);
};
window.startEditSubtask = function(idx, sidx) {
  setInputMode('edit-subtask', idx, sidx);
};

// Add subtask
window.showSubtaskInput = function(idx) {
  setInputMode('add-subtask', idx);
};

// Filter
filterBtn.innerHTML = 'Filter: <span id="filter-label">All Task</span> ▼';
filterBtn.style.position = 'relative';
let filterMenu = document.createElement('div');
filterMenu.style.position = 'absolute';
filterMenu.style.top = '110%';
filterMenu.style.left = '0';
filterMenu.style.background = '#fff';
filterMenu.style.border = '1px solid #b5c99a';
filterMenu.style.borderRadius = '8px';
filterMenu.style.boxShadow = '0 2px 8px 0 rgba(135,152,106,0.08)';
filterMenu.style.display = 'none';
filterMenu.style.zIndex = '10';
filterMenu.innerHTML = `
  <div class="filter-item" data-filter="all" style="padding:8px 18px;cursor:pointer;">All Task</div>
  <div class="filter-item" data-filter="completed" style="padding:8px 18px;cursor:pointer;">Completed</div>
  <div class="filter-item" data-filter="pending" style="padding:8px 18px;cursor:pointer;">Pending</div>
`;
filterBtn.appendChild(filterMenu);

filterBtn.onclick = function(e) {
  filterMenu.style.display = filterMenu.style.display === 'block' ? 'none' : 'block';
  e.stopPropagation();
};
document.body.addEventListener('click', () => {
  filterMenu.style.display = 'none';
});
filterMenu.querySelectorAll('.filter-item').forEach(item => {
  item.onclick = function(e) {
    currentFilter = this.dataset.filter;
    document.getElementById('filter-label').textContent = this.textContent;
    filterMenu.style.display = 'none';
    renderTodos();
    e.stopPropagation();
  };
});

// Enter key support
[todoInput, dateInput].forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') addBtn.click();
  });
});

// Render
function renderTodos() {
  const table = document.querySelector('.todos-table');
  let filteredTodos = todos;
  if (currentFilter === 'completed') {
    filteredTodos = todos.filter(t => t.completed);
  } else if (currentFilter === 'pending') {
    filteredTodos = todos.filter(t => !t.completed);
  }
  table.innerHTML = `
    <thead>
      <tr>
        <th>TASK</th>
        <th>DUE DATE</th>
        <th>STATUS</th>
        <th>ACTIONS</th>
      </tr>
    </thead>
    <tbody class="todos-list-body">
      ${filteredTodos.length === 0 ? `
        <tr class="empty-row"><td colspan="4" style="text-align:center;">No task found</td></tr>
      ` : filteredTodos.map((todo, idx) => {
        // Cari index asli di todos (karena filter)
        const realIdx = todos.indexOf(todo);
        return `
        <tr>
          <td>
            ${todo.text}
            ${todo.subtasks && todo.subtasks.length > 0 ? `<span class="subtask-count">${todo.subtasks.length}</span>` : ''}
          </td>
          <td>${todo.date || ''}</td>
          <td>
            <span class="badge ${todo.completed ? 'badge-done' : 'badge-pending'}">
              ${todo.completed ? 'Done' : 'Pending'}
            </span>
          </td>
          <td>
            <button class="icon-btn icon-blue" title="Add Subtask" onclick="window.showSubtaskInput(${realIdx})">+</button>
            <button class="icon-btn icon-yellow" title="Edit" onclick="window.startEditTask(${realIdx})">&#9998;</button>
            <button class="icon-btn icon-green" title="Toggle" onclick="window.toggleTodo(${realIdx})">&#10003;</button>
            <button class="icon-btn icon-red" title="Delete" onclick="window.deleteTodo(${realIdx})">&#128465;</button>
          </td>
        </tr>
        ${
          todo.subtasks && todo.subtasks.length > 0
            ? todo.subtasks.map((sub, sidx) => `
              <tr class="subtask-row" style="background:#f6f6f6;">
                <td style="padding-left:32px;">${sub.text}</td>
                <td></td>
                <td>
                  <span class="badge ${sub.completed ? 'badge-done' : 'badge-pending'}">
                    ${sub.completed ? 'Done' : 'Pending'}
                  </span>
                </td>
                <td>
                  <button class="icon-btn icon-yellow" title="Edit" onclick="window.startEditSubtask(${realIdx},${sidx})">&#9998;</button>
                  <button class="icon-btn icon-green" title="Toggle" onclick="window.toggleSubtask(${realIdx},${sidx})">&#10003;</button>
                  <button class="icon-btn icon-red" title="Delete" onclick="window.deleteSubtask(${realIdx},${sidx})">&#128465;</button>
                </td>
              </tr>
            `).join('')
            : ''
        }
      `}).join('')}
    </tbody>
  `;
}

// Inisialisasi
renderTodos();
setInputMode('add-task');
