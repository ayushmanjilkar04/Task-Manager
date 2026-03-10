const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("Front-end"));

const path = require("path");

app.use(express.static(path.join(__dirname, "../Front-end")));

mongoose
  .connect("mongodb://127.0.0.1:27017/taskmanager")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Models

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const TaskSchema = new mongoose.Schema({
  userId: String,
  title: String,
  deadline: String,
  status: { type: String, default: "Pending" },
});

const User = mongoose.model("User", UserSchema);
const Task = mongoose.model("Task", TaskSchema);

// Auth Routes

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });

  await user.save();
  res.json({ message: "User Registered" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.json({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, "secretkey");
  res.json({ token });
});

// Task Routes

app.post("/add-task", async (req, res) => {
  const { userId, title, deadline } = req.body;

  const task = new Task({ userId, title, deadline });
  await task.save();

  res.json({ message: "Task Added" });
});

app.get("/tasks/:userId", async (req, res) => {
  const tasks = await Task.find({ userId: req.params.userId });
  res.json(tasks);
});

app.delete("/delete-task/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task Deleted" });
});

app.put("/update-status/:id", async (req, res) => {
  await Task.findByIdAndUpdate(req.params.id, { status: "Completed" });
  res.json({ message: "Status Updated" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
