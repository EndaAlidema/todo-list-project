document.addEventListener('DOMContentLoaded', () => {
    const projectList = document.getElementById('projects-list');
    const addTodoButton = document.getElementById('add-todo-button');
    const newTodoForm = document.getElementById('new-todo-form');
    const todoForm = document.getElementById('todo-form');
    const todoProjectDropdown = document.getElementById('todo-project');
    const newProjectRow = document.getElementById('new-project-row');
    const cancelTodoFormButton = document.getElementById('cancel-todo-form');

    let projects = JSON.parse(localStorage.getItem('projects')) || [{ name: 'DEFAULT', todos: [] }];
    let editIndex = null;  

    
    const setMinDateForTodo = () => {
        const dateInput = document.getElementById('todo-due-date');
        const today = new Date().toISOString().split('T')[0]; 
        dateInput.setAttribute('min', today); 
    };

  
    newTodoForm.classList.add('hidden');
    newProjectRow.classList.add('hidden');
    setMinDateForTodo(); 

   
    addTodoButton.addEventListener('click', () => {
        newTodoForm.classList.remove('hidden'); 
        todoForm.reset();
        setMinDateForTodo(); 
        editIndex = null;  
    });

    cancelTodoFormButton.addEventListener('click', () => {
        newTodoForm.classList.add('hidden');
    });

    todoProjectDropdown.addEventListener('change', () => {
        if (todoProjectDropdown.value === 'NEW') {
            newProjectRow.classList.remove('hidden');
        } else {
            newProjectRow.classList.add('hidden');
        }
    });

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const todoName = document.getElementById('todo-name').value;
        const todoDescription = document.getElementById('todo-description').value;
        const todoDueDate = document.getElementById('todo-due-date').value;
        const todoPriority = document.getElementById('todo-priority').value;


        let todoProject = todoProjectDropdown.value;
        if (todoProject === 'NEW') {
            todoProject = document.getElementById('new-project-name').value;
            projects.push({ name: todoProject, todos: [] });
            addProjectToDropdown(todoProject);
        }

        const todo = {
            name: todoName,
            description: todoDescription,
            dueDate: todoDueDate,
            priority: todoPriority,
            completed: false
        };

        const selectedProject = todoProject || 'DEFAULT';
        const project = projects.find(proj => proj.name === selectedProject);
        if (editIndex === null) {
            
            project.todos.push(todo);
        } else {
           
            project.todos[editIndex] = todo;
        }

        saveProjectsToLocalStorage();  
        renderProjects();
        newTodoForm.classList.add('hidden'); 
    });

    function addProjectToDropdown(projectName) {
        const newOption = document.createElement('option');
        newOption.value = projectName;
        newOption.textContent = projectName;
        todoProjectDropdown.appendChild(newOption);
    }

    function renderProjects() {
        projectList.innerHTML = '';

        const defaultProject = projects.find(p => p.name === 'DEFAULT');
        renderProject(defaultProject);

        projects.filter(p => p.name !== 'DEFAULT').forEach(renderProject);
    }

    
    function renderProject(project) {
        const projectItem = document.createElement('li');
        projectItem.classList.add('project-item');
        
    
        const projectHTML = `
            <div class="project-info">
                <div class="project-name-container">
                    <span class="dot">•</span>
                    <span>${project.name === 'DEFAULT' ? 'ToDo (Default)' : project.name}</span>
                </div>
                ${project.name !== 'DEFAULT' ? '<div class="project-actions"><button class="delete-button">&times;</button></div>' : ''}
            </div>
            <ul class="todos-container"></ul>
        `;

        projectItem.innerHTML = projectHTML;

        const todosContainer = projectItem.querySelector('.todos-container');
        project.todos.forEach((todo, index) => {
            const todoItem = document.createElement('li');
            todoItem.classList.add('todo-item');
            todoItem.innerHTML = `
                <div>
                    <span class="check-icon" data-checked="${todo.completed}">&#10003;</span>
                    <span class="todo-title ${todo.completed ? 'completed' : ''}">${todo.name}</span>
                </div>
                <div class="todo-actions">
                    <button class="edit-todo-button">Edit</button>
                    <button class="delete-todo-button">&times;</button>
                </div>
            `;

            todoItem.querySelector('.check-icon').addEventListener('click', () => {
                todo.completed = !todo.completed;
                todoItem.querySelector('.check-icon').setAttribute('data-checked', todo.completed);
                todoItem.querySelector('.todo-title').classList.toggle('completed', todo.completed);
                saveProjectsToLocalStorage();  
            });

            todoItem.querySelector('.edit-todo-button').addEventListener('click', (e) => {
                e.stopPropagation();
                editIndex = index;
                document.getElementById('todo-name').value = todo.name;
                document.getElementById('todo-description').value = todo.description;
                document.getElementById('todo-due-date').value = todo.dueDate;
                document.getElementById('todo-priority').value = todo.priority;
                newTodoForm.classList.remove('hidden');
            });

            todoItem.querySelector('.delete-todo-button').addEventListener('click', (e) => {
                e.stopPropagation();
                project.todos.splice(index, 1);
                saveProjectsToLocalStorage(); 
                renderProjects();
            });

            todosContainer.appendChild(todoItem);
        });

        projectItem.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-button')) return;
            projectItem.classList.toggle('active');
        });

        if (project.name !== 'DEFAULT') {
            projectItem.querySelector('.delete-button').addEventListener('click', (e) => {
                e.stopPropagation(); 
                projects = projects.filter(p => p.name !== project.name);
                saveProjectsToLocalStorage();  
                renderProjects();
            });
        }

        projectList.appendChild(projectItem);
    }
   function saveProjectsToLocalStorage() {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    renderProjects();
});
