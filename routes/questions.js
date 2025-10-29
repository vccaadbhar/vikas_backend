const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const { auth, permit } = require("../middleware/auth");

// Add a new question
router.post("/", auth, permit("superadmin", "teacher"), async (req, res) => {
  try {
    const question = new Question({ ...req.body, createdBy: req.user._id });
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all questions
router.get("/", auth, async (req, res) => {
  const questions = await Question.find().sort({ createdAt: -1 });
  res.json(questions);
});

// Filter questions by subject/chapter/topic
router.get("/filter", auth, async (req, res) => {
  const { subject, chapter, topic } = req.query;
  const filter = {};
  if (subject) filter.subject = subject;
  if (chapter) filter.chapter = chapter;
  if (topic) filter.topic = topic;

  const questions = await Question.find(filter);
  res.json(questions);
});

// Update question
router.put("/:id", auth, permit("superadmin", "teacher"), async (req, res) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete question
router.delete("/:id", auth, permit("superadmin"), async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ msg: "Question deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
