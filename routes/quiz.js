const express = require("express");
const router = express.Router();
const QuizQuestion = require("../models/QuizQuestion");
const { auth, permit } = require("../middleware/auth");

// 👉 Add a question (admin/teacher only)
router.post("/", auth, permit("superadmin", "teacher"), async (req, res) => {
  try {
    const { question, options } = req.body;
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ msg: "Provide a question with at least 2 options" });
    }

    const newQ = new QuizQuestion({
      question,
      options,
      createdBy: req.user._id
    });

    await newQ.save();
    res.json(newQ);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 Get all quiz questions
router.get("/", auth, async (req, res) => {
  const questions = await QuizQuestion.find();
  res.json(questions);
});

// 👉 Student attempts quiz
router.post("/:id/attempt", auth, permit("student"), async (req, res) => {
  try {
    const { selectedOption } = req.body;
    const question = await QuizQuestion.findById(req.params.id);

    if (!question) return res.status(404).json({ msg: "Question not found" });

    const option = question.options.id(selectedOption);
    if (!option) return res.status(400).json({ msg: "Invalid option" });

    res.json({ correct: option.isCorrect });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
