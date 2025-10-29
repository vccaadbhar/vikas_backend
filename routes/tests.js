const express = require("express");
const router = express.Router();
const Test = require("../models/Test");
const Question = require("../models/Question");
const StudentTest = require("../models/StudentTest");
const { auth, permit } = require("../middleware/auth");

// 📌 Create a new test
router.post("/", auth, permit("superadmin", "teacher"), async (req, res) => {
  try {
    const test = new Test({
      ...req.body,
      createdBy: req.user._id
    });
    await test.save();
    res.json(test);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --------- Get all tests ----------
router.get("/", auth, async (req, res) => {
  try {
    const tests = await Test.find();
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- Upcoming tests for a student ----------
router.get("/student/:id", auth, permit("student"), async (req, res) => {
  try {
    const tests = await Test.find(); // later filter by class/section if needed
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- Completed tests for a student ----------
router.get("/completed/:id", auth, permit("student"), async (req, res) => {
  try {
    const attempts = await StudentTest.find({ student: req.params.id })
      .populate("test");
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------- Attempt a test ----------
router.post("/:id/attempt", auth, permit("student"), async (req, res) => {
  try {
    const { answers, score } = req.body;
    const attempt = new StudentTest({
      student: req.user.id,
      test: req.params.id,
      answers,
      score,
    });
    await attempt.save();
    res.json(attempt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get results for a test (admin/teacher)
router.get("/:id/results", auth, permit("superadmin", "teacher"), async (req, res) => {
  const results = await StudentTest.find({ test: req.params.id })
    .populate("student")
    .populate("test");
  res.json(results);
});
// 📌 Update a test (e.g., add questions)
router.put("/:id", auth, permit("superadmin", "teacher"), async (req, res) => {
  try {
    const updated = await Test.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("questions");
    if (!updated) return res.status(404).json({ msg: "Test not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
