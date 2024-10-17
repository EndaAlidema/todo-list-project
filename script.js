document.addEventListener('DOMContentLoaded', () => {
    const projectList = document.getElementById('projects-list');
    const addTodoButton = document.getElementById('add-todo-button');
    const newTodoForm = document.getElementById('new-todo-form');
    const todoForm = document.getElementById('todo-form');
    const todoProjectDropdown = document.getElementById('todo-project');
    const newProjectRow = document.getElementById('new-project-row');
    const cancelTodoFormButton = document.getElementById('cancel-todo-form');

    // Load projects from localStorage or initialize with 'DEFAULT' project
    let projects = JSON.parse(localStorage.getItem('projects')) || [{ name: 'DEFAULT', todos: [] }];
    let editIndex = null;  // Track if we're editing an existing todo

    // Function to set the minimum date for the date input
    const setMinDateForTodo = () => {
        const dateInput = document.getElementById('todo-due-date');
        const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
        dateInput.setAttribute('min', today); // Set the min attribute to today's date
    };

    // Initially hide the form when the page loads
    newTodoForm.classList.add('hidden');
    newProjectRow.classList.add('hidden');
    setMinDateForTodo(); // Set minimum date for todo form when the page loads

    // Show the form when "Add New Todo" is clicked
    addTodoButton.addEventListener('click', () => {
        newTodoForm.classList.remove('hidden');  // Show form
        todoForm.reset();
        setMinDateForTodo(); // Ensure the date is reset and can't be in the past
        editIndex = null;  // Reset edit mode
    });

    // Close the form without adding a todo
    cancelTodoFormButton.addEventListener('click', () => {
        newTodoForm.classList.add('hidden');
    });

    // Handle selecting new project in dropdown
    todoProjectDropdown.addEventListener('change', () => {
        if (todoProjectDropdown.value === 'NEW') {
            newProjectRow.classList.remove('hidden');
        } else {
            newProjectRow.classList.add('hidden');
        }
    });

    // Function to populate the project dropdown with all projects
    const populateProjectDropdown = () => {
        // Clear existing options
        todoProjectDropdown.innerHTML = '';
        
        // Add "To Do (Default)" and "Add New Project" options
        addProjectToDropdown('DEFAULT');
        const newOption = document.createElement('option');
        newOption.value = 'NEW';
        newOption.textContent = '+ Add New Project';
        todoProjectDropdown.appendChild(newOption);
        
        // Add all existing projects except default
        projects.filter(p => p.name !== 'DEFAULT').forEach(project => {
            addProjectToDropdown(project.name);
        });
    };

    // Function to add a project to the dropdown
    function addProjectToDropdown(projectName) {
        const newOption = document.createElement('option');
        newOption.value = projectName;
        newOption.textContent = projectName === 'DEFAULT' ? 'To Do (Default)' : projectName;
        todoProjectDropdown.appendChild(newOption);
    }

    // Handle form submission to create or edit a todo
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const todoName = document.getElementById('todo-name').value;
        const todoDescription = document.getElementById('todo-description').value;
        const todoDueDate = document.getElementById('todo-due-date').value;
        const todoPriority = document.getElementById('todo-priority').value;

        if (!todoName || !todoDueDate) {
            alert('Please fill out the required fields');
            return;
        }

        // If the user adds a new project
        let todoProject = todoProjectDropdown.value;
        if (todoProject === 'NEW') {
            const newProjectName = document.getElementById('new-project-name').value.trim();

            // Check if a project with the same name already exists
            const existingProject = projects.find(proj => proj.name.toLowerCase() === newProjectName.toLowerCase());
            if (existingProject) {
                alert('A project with this name already exists. Please choose a different name.');
                return; // Stop the form submission if the project already exists
            }

            todoProject = newProjectName;
            projects.push({ name: todoProject, todos: [] });
            populateProjectDropdown(); // Repopulate the dropdown with the new project
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
            // If not editing, add a new todo
            project.todos.push(todo);
        } else {
            // If editing, update the existing todo
            project.todos[editIndex] = todo;
        }

        saveProjectsToLocalStorage();  // Save the projects to localStorage
        renderProjects();
        newTodoForm.classList.add('hidden');  // Hide the form after submission
    });

    // Render the projects and their todos
    function renderProjects() {
        projectList.innerHTML = '';  // Clear previous projects

        // Find the default project (if not found, fallback to manually add one)
        let defaultProject = projects.find(p => p.name === 'DEFAULT');
        if (!defaultProject) {
            defaultProject = { name: 'DEFAULT', todos: [] };
            projects.push(defaultProject);
        }

        // Render default project
        renderProject(defaultProject);

        // Render other projects
        projects.filter(p => p.name !== 'DEFAULT').forEach(renderProject);
    }

    // Function to render a single project and its todos
    function renderProject(project) {
        const projectItem = document.createElement('li');
        projectItem.classList.add('project-item');
        
        // If it's the "DEFAULT" project, name it "To Do (Default)"
        const projectHTML = `
            <div class="project-info">
                <div class="project-name-container">
                    <span class="dot">•</span>
                    <span>${project.name === 'DEFAULT' ? 'To Do (Default)' : project.name}</span>
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
                <div class="todo-details hidden">
                    <p><strong>Description:</strong> ${todo.description || 'No description'}</p>
                    <p><strong>Due Date:</strong> ${todo.dueDate}</p>
                    <p><strong>Priority:</strong> ${todo.priority}</p>
                </div>
            `;

            // Handle expanding and collapsing the details
            todoItem.addEventListener('click', (e) => {
                // Ignore clicks on the edit and delete buttons
                if (!e.target.classList.contains('edit-todo-button') && !e.target.classList.contains('delete-todo-button')) {
                    const details = todoItem.querySelector('.todo-details');
                    details.classList.toggle('hidden');  // Show or hide the details
                }
            });

            // Handle todo completion with check icon (toggle state)
            todoItem.querySelector('.check-icon').addEventListener('click', (e) => {
                e.stopPropagation();  // Prevent clicking the todo item itself
                todo.completed = !todo.completed;
                todoItem.querySelector('.check-icon').setAttribute('data-checked', todo.completed);
                todoItem.querySelector('.todo-title').classList.toggle('completed', todo.completed);
                saveProjectsToLocalStorage();  // Save the updated projects
            });

            // Handle todo editing
            todoItem.querySelector('.edit-todo-button').addEventListener('click', (e) => {
                e.stopPropagation();  // Prevent clicking the todo item itself
                editIndex = index;
                document.getElementById('todo-name').value = todo.name;
                document.getElementById('todo-description').value = todo.description;
                document.getElementById('todo-due-date').value = todo.dueDate;
                document.getElementById('todo-priority').value = todo.priority;
                newTodoForm.classList.remove('hidden');
            });

            // Handle todo deletion
            todoItem.querySelector('.delete-todo-button').addEventListener('click', (e) => {
                e.stopPropagation();  // Prevent clicking the todo item itself
                project.todos.splice(index, 1);
                saveProjectsToLocalStorage();  // Save the updated projects
                renderProjects();
            });

            todosContainer.appendChild(todoItem);
        });

        // Handle project expansion and collapse
        projectItem.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-button')) return;
            projectItem.classList.toggle('active');
        });

        // Handle project deletion (only for non-default projects)
        if (project.name !== 'DEFAULT') {
            projectItem.querySelector('.delete-button').addEventListener('click', (e) => {
                e.stopPropagation();  // Prevent expanding when deleting
                projects = projects.filter(p => p.name !== project.name);
                saveProjectsToLocalStorage();  // Save the updated projects
                renderProjects();
            });
        }

        projectList.appendChild(projectItem);
    }

    // Save projects to localStorage
    function saveProjectsToLocalStorage() {
        localStorage.setItem('projects', JSON.stringify(projects));
    }

    // Initial render to display the default project and populate the dropdown
    renderProjects();
    populateProjectDropdown(); // Populate the dropdown with all projects
});
