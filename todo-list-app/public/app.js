document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
  
    // Fetch initial todos
    fetchTodos();
  
    todoForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newTodoText = todoInput.value.trim();
      if (newTodoText !== '') {
        await addTodoItem(newTodoText);
        todoInput.value = '';
      }
    });
  
    async function fetchTodos() {
      const response = await fetch('/api/todos');
      const todos = await response.json();
      todoList.innerHTML = ''; // Clear existing todos
      todos.forEach(todo => addTodoItemToDOM(todo));
    }
  
    async function addTodoItem(text) {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const newTodo = await response.json();
      addTodoItemToDOM(newTodo);
    }
  
    function addTodoItemToDOM(todo) {
      const li = document.createElement('li');
      li.classList.add('mb-2', 'p-2', 'bg-gray-200', 'rounded', 'flex', 'justify-between', 'items-center');
      li.dataset.id = todo.id;
  
      const span = document.createElement('span');
      span.textContent = todo.text;
      span.classList.add('flex-grow', 'px-2');
  
      const completeButton = document.createElement('button');
      completeButton.textContent = 'Complete';
      completeButton.classList.add('bg-green-500', 'text-white', 'px-2', 'py-1', 'rounded', 'mr-2');
      completeButton.addEventListener('click', async () => {
        const completed = !li.classList.contains('line-through');
        await updateTodoStatus(todo.id, completed);
        li.classList.toggle('line-through');
        li.classList.toggle('bg-gray-400');
      });
  
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('bg-red-500', 'text-white', 'px-2', 'py-1', 'rounded');
      deleteButton.addEventListener('click', async () => {
        await deleteTodoItem(todo.id);
        li.remove();
      });
  
      li.appendChild(span);
      li.appendChild(completeButton);
      li.appendChild(deleteButton);
      todoList.appendChild(li);
  
      if (todo.completed) {
        li.classList.add('line-through', 'bg-gray-400');
      }
    }
  
    async function deleteTodoItem(id) {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' });
    }
  
    async function updateTodoStatus(id, completed) {
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
    }
  });
  