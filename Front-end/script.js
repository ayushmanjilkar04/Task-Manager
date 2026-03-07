const API = "http://localhost:5000";
// type url "http://localhost:5000/login.html" to access login page

const username = document.getElementById("username");
const password = document.getElementById("password");
const title = document.getElementById("title");
const deadline = document.getElementById("deadline");
const taskList = document.getElementById("task-list");

function register() {
    fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: username.value,
            password: password.value
        })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        window.location.href = "login.html";
    });
}

function login() {
    fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username: username.value,
            password: password.value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("userId", parseJwt(data.token).id);
            window.location.href = "index.html";
        } else {
            alert(data.message);
        }
    });
}

function parseJwt(token) {
    return JSON.parse(atob(token.split('.')[1]));
}

function addTask() {
    fetch(`${API}/add-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: localStorage.getItem("userId"),
            title: title.value,
            deadline: deadline.value
        })
    }).then(() => loadTasks());
}

function loadTasks() {
    fetch(`${API}/tasks/${localStorage.getItem("userId")}`)
    .then(res => res.json())
    .then(tasks => {
        taskList.innerHTML = "";
        tasks.forEach(task => {
            taskList.innerHTML += `
                <li>
                    <b>${task.title}</b><br>
                    Deadline: ${task.deadline}<br>
                    Status: ${task.status}<br>
                    <button onclick="completeTask('${task._id}')">Complete</button>
                    <button onclick="deleteTask('${task._id}')">Delete</button>
                </li>
            `;
        });
    });
}

function deleteTask(id) {
    fetch(`${API}/delete-task/${id}`, { method: "DELETE" })
    .then(() => loadTasks());
}

function completeTask(id) {
    fetch(`${API}/update-status/${id}`, { method: "PUT" })
    .then(() => loadTasks());
}

if (window.location.pathname.includes("index.html")) {
    loadTasks();
}
