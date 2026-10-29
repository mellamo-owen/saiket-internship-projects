const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskCategory = document.getElementById("taskCategory");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const formMessage = document.getElementById("formMessage");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const taskBadge = document.getElementById("taskBadge");

const progressRing = document.getElementById("progressRing");
const progressPercent = document.getElementById("progressPercent");
const progressMessage = document.getElementById("progressMessage");
const progressBar = document.getElementById("progressBar");
const progressSummary = document.getElementById("progressSummary");

const todayDate = document.getElementById("todayDate");
const footerYear = document.getElementById("footerYear");
const filterButtons = document.querySelectorAll(".filter-button");

const STORAGE_KEY = "novatasks_tasks_v1";

let tasks = loadTasks();
let currentFilter = "all";
let searchTerm = "";

todayDate.textContent = new Date().toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric"
});
footerYear.textContent = new Date().getFullYear();

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            typeof task.completed === "boolean" &&
            ["Personal", "Work", "Study"].includes(task.category) &&
            ["Low", "Medium", "High"].includes(task.priority)
        );
    } catch (error) {
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        showMessage(
            "Could not save tasks in this browser. Check your browser storage settings.",
            true
        );
        return false;
    }
}

function showMessage(message, isError = false) {
    formMessage.textContent = message;
    formMessage.classList.toggle("error", isError);
}

function createTag(className, text) {
    const tag = document.createElement("span");
    tag.className = className;
    tag.textContent = text;
    return tag;
}

function renderTasks() {
    taskList.replaceChildren();

    const visibleTasks = tasks.filter(task => {
        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        const matchesSearch = task.title
            .toLocaleLowerCase()
            .includes(searchTerm.toLocaleLowerCase());

        return matchesFilter && matchesSearch;
    });

    visibleTasks.forEach(task => {
        const item = document.createElement("article");
        item.className = "task-item";
        if (task.completed) {
            item.classList.add("is-completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark " + task.title + " as completed");

        checkbox.addEventListener("change", () => {
            const previous = task.completed;
            task.completed = checkbox.checked;

            if (!saveTasks()) {
                task.completed = previous;
                renderTasks();
                return;
            }

            showMessage("");
            renderTasks();
            updateStats();
        });

        const main = document.createElement("div");
        main.className = "task-main";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.title;

        const meta = document.createElement("div");
        meta.className = "task-meta";
        meta.append(
            createTag("category-tag", task.category),
            createTag("priority-tag priority-" + task.priority.toLowerCase(), task.priority + " priority")
        );

        if (task.completed) {
            meta.append(createTag("status-tag", "Completed"));
        }

        main.append(title, meta);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute("aria-label", "Delete " + task.title);

        deleteButton.addEventListener("click", () => {
            const previousTasks = tasks;
            tasks = tasks.filter(item => item.id !== task.id);

            if (!saveTasks()) {
                tasks = previousTasks;
                renderTasks();
                return;
            }

            showMessage("Task deleted.");
            renderTasks();
            updateStats();
        });

        item.append(checkbox, main, deleteButton);
        taskList.append(item);
    });

    emptyState.hidden = visibleTasks.length > 0;

    const emptyHeading = emptyState.querySelector("h3");
    const emptyDescription = emptyState.querySelector("p");

    if (tasks.length === 0) {
        emptyHeading.textContent = "No tasks here yet";
        emptyDescription.textContent = "Add a task above to get started.";
    } else if (visibleTasks.length === 0 && searchTerm) {
        emptyHeading.textContent = "No matching tasks";
        emptyDescription.textContent = "Try a different search or filter.";
    } else if (visibleTasks.length === 0) {
        emptyHeading.textContent = "Nothing to show";
        emptyDescription.textContent = "Choose another filter to view your tasks.";
    }
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    totalCount.textContent = total;
    pendingCount.textContent = pending;
    completedCount.textContent = completed;
    taskBadge.textContent = total + (total === 1 ? " task" : " tasks");

    progressPercent.textContent = percentage + "%";
    progressRing.style.background =
        "conic-gradient(var(--primary) " + percentage + "%, #edf0f7 " + percentage + "%)";
    progressRing.setAttribute(
        "aria-label",
        percentage + " percent of tasks completed"
    );

    progressBar.style.width = percentage + "%";
    progressSummary.textContent = completed + " of " + total;

    if (total === 0) {
        progressMessage.textContent = "Add your first task to begin.";
    } else if (percentage === 100) {
        progressMessage.textContent = "All tasks completed. Excellent work!";
    } else if (completed > 0) {
        progressMessage.textContent = "Good progress. Keep going!";
    } else {
        progressMessage.textContent = "Every completed task moves you forward.";
    }
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (title.length < 2) {
        showMessage("Enter a task with at least two characters.", true);
        taskInput.focus();
        return;
    }

    const task = {
        id: window.crypto && typeof window.crypto.randomUUID === "function"
            ? window.crypto.randomUUID()
            : Date.now().toString(36) + Math.random().toString(36).slice(2),
        title,
        category: taskCategory.value,
        priority: taskPriority.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(task);

    if (!saveTasks()) {
        tasks = tasks.filter(item => item.id !== task.id);
        return;
    }

    taskForm.reset();
    taskCategory.value = "Personal";
    taskPriority.value = "Medium";
    currentFilter = "all";
    searchInput.value = "";
    searchTerm = "";

    filterButtons.forEach(button => {
        const active = button.dataset.filter === "all";
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
    });

    showMessage("Task added successfully.");
    renderTasks();
    updateStats();
    taskInput.focus();
});

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(item => {
            const active = item === button;
            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });

        renderTasks();
    });
});

searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim();
    renderTasks();
});

renderTasks();
updateStats();
