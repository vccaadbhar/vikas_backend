const express = require("express");
const router = express.Router();
const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");

// 📌 Submit attempt
router.post("/", async (req, res) => {
  try {
    const { quizId, studentId, answers } = req.body;

    const quiz = await Quiz.findById(quizId).populate("questionIds");
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    let score = 0;

    // Grade answers
    const gradedAnswers = quiz.questionIds.map((q) => {
      const ans = answers.find((a) => a.questionId == q._id.toString());
      const isCorrect = ans && ans.selectedIndex === q.correctIndex;

      if (isCorrect) score++;

      return {
        question: q._id,
        selectedIndex: ans ? ans.selectedIndex : null,
        isCorrect,
        timeTaken: ans?.timeTaken || 0,
      };
    });

    // Save attempt
    const attempt = await Attempt.create({
      quiz: quiz._id,
      student: studentId,
      answers: gradedAnswers,
      score,
      total: quiz.questionIds.length,
      duration: answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0),
    });

    // Build response with populated questions for frontend analysis
    const result = {
      _id: attempt._id,
      quiz: { _id: quiz._id, name: quiz.name },
      score,
      total: quiz.questionIds.length,
      answers: quiz.questionIds.map((q) => {
        const attemptAns = gradedAnswers.find((a) => a.question == q._id.toString());
        return {
          question: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          selectedIndex: attemptAns?.selectedIndex,
          isCorrect: attemptAns?.isCorrect || false,
          timeTaken: attemptAns?.timeTaken || 0,
        };
      }),
    };

    res.status(201).json(result);
  } catch (err) {
    console.error("Error saving attempt:", err);
    res.status(400).json({ error: err.message });
  }
});

// 📌 Leaderboard
router.get("/leaderboard/:quizId", async (req, res) => {
  try {
    const attempts = await Attempt.find({ quiz: req.params.quizId })
      .populate("student")
      .sort({ score: -1, duration: 1, createdAt: 1 }) // sort by score, then fastest
      .limit(20);
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Results (role-based and teacher/admin filters)
router.get("/results", async (req, res) => {
  try {
    const { role, studentId, className, subject } = req.query;
    let filter = {};

    // Student or parent can only see one student's results
    if ((role === "student" || role === "parent") && studentId) {
      filter.student = studentId;
    }

    // Teacher/Admin filters
    if (className) filter.className = className;
    if (subject) filter.subject = subject;

    const results = await Attempt.find(filter)
      .populate("quiz")
      .populate("student")
      .sort({ createdAt: -1 });

    res.json(results);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 Get attempts by student (quick lookup)
router.get("/", async (req, res) => {
  try {
    const { studentId } = req.query;
    const filter = studentId ? { student: studentId } : {};
    const attempts = await Attempt.find(filter).populate("quiz");
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
