// vikas_backend/routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Fetch all teachers
router.get("/teachers", async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all students
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch all parents
router.get("/parents", async (req, res) => {
  try {
    const parents = await User.find({ role: "parent" });
    res.json(parents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user by ID (teacher/student/parent)
router.delete("/user/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
