const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const multer = require("multer");
const upload = multer();
const parse = require("csv-parse/sync");

// Create quiz
router.post("/", async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get quizzes
router.get("/", async (req, res) => {
  try {
    const { className, subject, topic } = req.query;
    const filter = {};
    if (className) filter.className = className;
    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const quizzes = await Quiz.find(filter).populate("questionIds");
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get quiz by ID (with questions)
router.get("/:id", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("questionIds");
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update quiz
router.put("/:id", async (req, res) => {
  try {
    const updated = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete quiz
router.delete("/:id", async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CSV Import
router.post("/import", upload.single("file"), async (req, res) => {
  try {
    const csv = req.file.buffer.toString();
    const records = parse.parse(csv, { columns: true, skip_empty_lines: true });
    const questions = records.map(r => ({
      text: r.Question,
      options: [
        { text: r.OptionA, isCorrect: r.Correct === "A" },
        { text: r.OptionB, isCorrect: r.Correct === "B" },
        { text: r.OptionC, isCorrect: r.Correct === "C" },
        { text: r.OptionD, isCorrect: r.Correct === "D" },
        { text: r.OptionE, isCorrect: r.Correct === "E" },
        { text: r.OptionF, isCorrect: r.Correct === "F" }
      ].filter(o => o.text),
      explanation: r.Explanation,
      timeLimit: parseInt(r.TimeLimitSeconds || "30")
    }));
    const quiz = await Quiz.create({
      name: req.body.name || "Imported Quiz",
      className: req.body.className,
      subject: req.body.subject,
      topic: req.body.topic,
      questions
    });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// CSV Export
router.get("/:id/export", async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Not found" });
    let lines = ["Question,OptionA,OptionB,OptionC,OptionD,OptionE,OptionF,Correct,Explanation,TimeLimitSeconds"];
    quiz.questions.forEach(q => {
      const opts = q.options.map(o => o.text);
      while (opts.length < 6) opts.push("");
      const correctIdx = q.options.findIndex(o => o.isCorrect);
      const correctLetter = correctIdx >= 0 ? String.fromCharCode(65 + correctIdx) : "";
      lines.push([
        q.text,
        opts[0]||"", opts[1]||"", opts[2]||"", opts[3]||"", opts[4]||"", opts[5]||"",
        correctLetter,
        q.explanation || "",
        q.timeLimit || 30
      ].join(","));
    });
    const csv = lines.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="quiz_${quiz._id}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ close with this
module.exports = router;
