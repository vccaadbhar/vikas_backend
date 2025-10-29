const express = require("express");
const router = express.Router();
const ClassModel = require("../models/Class");
const LiveClass = require("../models/LiveClass");
const RecordedClass = require("../models/RecordedClass");
const { auth, permit } = require("../middleware/auth");
const Class = require("../models/Class");
const { isTeacherOrAdmin } = require("../middleware/auth");

// 📌 Create a new class
router.post("/", async (req, res) => {
  try {
    const { title, type, subject, date, link, uploadedBy } = req.body;
    const newClass = await Class.create({ title, type, subject, date, link, uploadedBy });
    res.status(201).json(newClass);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 Get all classes
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    let filter = {};
    if (type) filter.type = type; // recorded or online
    const classes = await Class.find(filter).sort({ date: 1, createdAt: -1 });
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Assign students to class
router.post("/:classId/add-students", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const updated = await ClassModel.findByIdAndUpdate(
      req.params.classId,
      { $addToSet: { students: { $each: req.body.students } } }, // array of student IDs
      { new: true }
    ).populate("students");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 Schedule a live class
router.post("/:classId/live", auth, permit("superadmin", "teacher"), async (req, res) => {
  try {
    const live = new LiveClass({ ...req.body, classRef: req.params.classId, createdBy: req.user._id });
    await live.save();
    res.json(live);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 Get live classes for a class
router.get("/:classId/live", auth, async (req, res) => {
  const lives = await LiveClass.find({ classRef: req.params.classId }).populate("createdBy");
  res.json(lives);
});

// 📌 Upload a recorded class
router.post("/:classId/recorded", auth, permit("superadmin", "teacher"), async (req, res) => {
  try {
    const recorded = new RecordedClass({ ...req.body, classRef: req.params.classId, uploadedBy: req.user._id });
    await recorded.save();
    res.json(recorded);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 Get recorded classes for a class
router.get("/:classId/recorded", auth, async (req, res) => {
  const recs = await RecordedClass.find({ classRef: req.params.classId }).populate("uploadedBy");
  res.json(recs);
});
// GET /api/classes
router.get("/", auth, async (req, res) => {
  let filter = {};
  if (req.query.teacher) filter.teacher = req.query.teacher;
  const classes = await Class.find(filter);
  res.json(classes);
});

router.post("/", isTeacherOrAdmin, async (req, res) => {
  // only teachers/admins can add
  const { title, type, subject, date, link, uploadedBy } = req.body;
  try {
    const newClass = await Class.create({ title, type, subject, date, link, uploadedBy });
    res.status(201).json(newClass);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", isTeacherOrAdmin, async (req, res) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
