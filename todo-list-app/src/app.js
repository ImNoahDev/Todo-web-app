document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
  
    todoForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newTodoText = todoInput.value.trim();
      if (newTodoText !== '') {
        addTodoItem(newTodoText);
        todoInput.value = '';
      }
    });
  
    function addTodoItem(todoText) {
      const li = document.createElement('li');
      li.textContent = todoText;
      li.classList.add('mb-2', 'flex', 'justify-between', 'items-center');
      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('bg-red-500', 'text-white', 'px-2', 'py-1', 'rounded');
      deleteButton.addEventListener('click', () => {
        li.remove();
      });
      li.appendChild(deleteButton);
      todoList.appendChild(li);
    }
  });
  