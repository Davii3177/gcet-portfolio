// To-Do App with Local Storage
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.storageKey = 'todos';
        
        this.todoInput = document.getElementById('todoInput');
        this.addBtn = document.getElementById('addBtn');
        this.todoList = document.getElementById('todoList');
        this.clearBtn = document.getElementById('clearBtn');
        this.deleteAllBtn = document.getElementById('deleteAllBtn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        
        this.totalCount = document.getElementById('totalCount');
        this.activeCount = document.getElementById('activeCount');
        this.completedCount = document.getElementById('completedCount');
        
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.render();
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Add todo on button click
        this.addBtn.addEventListener('click', () => this.addTodo());
        
        // Add todo on Enter key
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTodo();
            }
        });

        // Filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Clear completed
        this.clearBtn.addEventListener('click', () => this.clearCompleted());
        
        // Delete all
        this.deleteAllBtn.addEventListener('click', () => this.deleteAll());
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        
        if (text === '') {
            alert('Please enter a task!');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: 'medium',
            createdAt: new Date().toLocaleString()
        };

        this.todos.push(todo);
        this.saveToStorage();
        this.render();
        this.todoInput.value = '';
        this.todoInput.focus();
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
        }
    }

    clearCompleted() {
        if (this.todos.some(t => t.completed)) {
            if (confirm('Delete all completed tasks?')) {
                this.todos = this.todos.filter(t => !t.completed);
                this.saveToStorage();
                this.render();
            }
        } else {
            alert('No completed tasks to clear!');
        }
    }

    deleteAll() {
        if (this.todos.length === 0) {
            alert('No tasks to delete!');
            return;
        }

        if (confirm('Delete all tasks? This cannot be undone.')) {
            this.todos = [];
            this.saveToStorage();
            this.render();
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'active':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            default:
                return this.todos;
        }
    }

    updateStats() {
        const total = this.todos.length;
        const active = this.todos.filter(t => !t.completed).length;
        const completed = this.todos.filter(t => t.completed).length;

        this.totalCount.textContent = total;
        this.activeCount.textContent = active;
        this.completedCount.textContent = completed;
    }

    render() {
        const filtered = this.getFilteredTodos();
        this.updateStats();

        if (this.todos.length === 0) {
            this.todoList.innerHTML = '<div class="empty-state"><p>✨ No tasks yet. Add one to get started!</p></div>';
            return;
        }

        if (filtered.length === 0) {
            this.todoList.innerHTML = `<div class="empty-state"><p>🎉 No tasks in this filter!</p></div>`;
            return;
        }

        this.todoList.innerHTML = filtered.map(todo => this.createTodoElement(todo)).join('');
        this.attachTodoListeners();
    }

    createTodoElement(todo) {
        const priorityClass = `priority-${todo.priority || 'medium'}`;
        const isCompleted = todo.completed ? 'completed' : '';
        
        return `
            <div class="todo-item ${isCompleted}">
                <input 
                    type="checkbox" 
                    class="checkbox" 
                    ${todo.completed ? 'checked' : ''} 
                    data-id="${todo.id}"
                >
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <span class="todo-priority ${priorityClass}">${todo.priority}</span>
                <button class="delete-btn" data-id="${todo.id}">🗑️</button>
            </div>
        `;
    }

    attachTodoListeners() {
        // Checkbox listeners
        this.todoList.querySelectorAll('.checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleTodo(parseInt(e.target.dataset.id));
            });
        });

        // Delete button listeners
        this.todoList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteTodo(parseInt(e.target.dataset.id));
            });
        });
    }

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
    }

    loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.todos = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading todos from storage:', e);
                this.todos = [];
            }
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
