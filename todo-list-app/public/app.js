document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const todoForm = document.getElementById('todo-form');
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');

  const apiUrl = '/api';
  let token = localStorage.getItem('token');

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    try {
      const res = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        alert('Registration successful');
      } else {
        alert('Registration failed');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        token = data.token;
        localStorage.setItem('token', token);
        showTodoForm();
        fetchTodos();
      } else {
        alert('Login failed');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  });

  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newTodoText = todoInput.value.trim();
    if (newTodoText !== '') {
      addTodoItem(newTodoText);
      todoInput.value = '';
    }
  });

  function addTodoItem(todoText) {
    fetch(`${apiUrl}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ text: todoText })
    })
    .then(res => res.json())
    .then(todo => {
      renderTodoItem(todo);
    })
    .catch(err => console.error('Error:', err));
  }

  function renderTodoItem(todo) {
    const li = document.createElement('li');
    li.classList.add('mb-2', 'p-2', 'bg-gray-200', 'rounded', 'flex', 'justify-between', 'items-center');
  
    const span = document.createElement('span');
    span.textContent = todo.text;
    span.classList.add('flex-grow', 'px-2');
  
    const completeButton = document.createElement('button');
    completeButton.textContent = 'Complete';
    completeButton.classList.add('bg-green-500', 'text-white', 'px-2', 'py-1', 'rounded', 'mr-2');
    completeButton.addEventListener('click', () => {
      updateTodoStatus(todo.id, true);
      li.classList.toggle('line-through');
      li.classList.toggle('bg-gray-400');
    });
  
    const checkboxContainer = document.createElement('div');
    checkboxContainer.classList.add('flex', 'items-center');
  
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.classList.add('mr-2');
    checkbox.addEventListener('change', () => {
      updateTodoStatus(todo.id, checkbox.checked);
      li.classList.toggle('line-through');
      li.classList.toggle('bg-gray-400');
    });
  
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('bg-red-500', 'text-white', 'px-2', 'py-1', 'rounded');
    deleteButton.addEventListener('click', () => {
      li.remove();
      deleteTodoItem(todo.id);
    });
  
    checkboxContainer.appendChild(checkbox);
    li.appendChild(checkboxContainer);
    li.appendChild(span);
    li.appendChild(completeButton);
    li.appendChild(deleteButton);
    todoList.appendChild(li);
  }
  
  function updateTodoStatus(id, completed) {
    fetch(`${apiUrl}/todos/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ completed })
    })
    .catch(err => console.error('Error:', err));
  }
  

  function deleteTodoItem(id) {
    fetch(`${apiUrl}/todos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .catch(err => console.error('Error:', err));
  }

  function fetchTodos() {
    fetch(`${apiUrl}/todos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(todos => {
      todos.forEach(todo => renderTodoItem(todo));
    })
    .catch(err => console.error('Error:', err));
  }

  function showTodoForm() {
    todoForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
  }

  if (token) {
    showTodoForm();
    fetchTodos();
  }
});
