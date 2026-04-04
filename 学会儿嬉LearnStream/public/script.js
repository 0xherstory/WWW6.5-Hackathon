// TodoList 应用
class TodoList {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    // 初始化应用
    init() {
        this.bindEvents();
        this.render();
        this.updateStats();
    }

    // 绑定事件
    bindEvents() {
        // 添加任务事件
        document.getElementById('add-btn').addEventListener('click', () => this.addTask());
        document.getElementById('task-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // 筛选按钮事件
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // 清空已完成任务事件
        document.getElementById('clear-completed').addEventListener('click', () => {
            this.clearCompletedTasks();
        });
    }

    // 加载本地存储的任务
    loadTasks() {
        const tasks = localStorage.getItem('todos');
        return tasks ? JSON.parse(tasks) : [];
    }

    // 保存任务到本地存储
    saveTasks() {
        localStorage.setItem('todos', JSON.stringify(this.tasks));
    }

    // 添加新任务
    addTask() {
        const input = document.getElementById('task-input');
        const text = input.value.trim();

        if (text === '') {
            alert('请输入任务内容');
            return;
        }

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask); // 新增任务显示在顶部
        this.saveTasks();
        this.render();
        this.updateStats();
        input.value = '';
    }

    // 切换任务完成状态
    toggleTaskCompletion(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    // 删除任务
    deleteTask(id) {
        if (confirm('确定要删除这个任务吗？')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    // 设置筛选条件
    setFilter(filter) {
        this.currentFilter = filter;
        
        // 更新筛选按钮样式
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    // 清空所有已完成任务
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        if (completedCount === 0) {
            alert('没有已完成的任务');
            return;
        }

        if (confirm(`确定要清空所有 ${completedCount} 个已完成任务吗？`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.render();
            this.updateStats();
        }
    }

    // 根据筛选条件过滤任务
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    // 渲染任务列表
    render() {
        const taskList = document.getElementById('task-list');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = '<li class="empty-list">暂无任务</li>';
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="todoList.toggleTaskCompletion(${task.id})">
                <span class="task-content">${this.escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="todoList.deleteTask(${task.id})">&times;</button>
            </li>
        `).join('');
    }

    // 更新统计信息
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const active = total - completed;

        document.getElementById('total-count').textContent = `全部任务：${total}`;
        document.getElementById('active-count').textContent = `未完成：${active}`;
        document.getElementById('completed-count').textContent = `已完成：${completed}`;
    }

    // 转义HTML特殊字符，防止XSS攻击
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化应用
const todoList = new TodoList();