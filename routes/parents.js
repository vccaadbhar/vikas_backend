const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Student = require("../models/Student");
const StudentTest = require("../models/StudentTest");
const { auth, permit } = require("../middleware/auth");

// 📌 Get child's info
router.get("/child", auth, permit("parent"), async (req, res) => {
  try {
  const parent = await User.findById(req.user.id).populate("child");
  if (!parent) return res.status(404).json({ msg: "Parent not found" });
  res.json(parent.child);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get child's test results
router.get("/child/results", auth, permit("parent"), async (req, res) => {
  const parent = await User.findById(req.user.id);
  const results = await StudentTest.find({ student: parent.child })
    .populate("test")
    .populate("student");
  res.json(results);
});

// 📌 Get child's fee status (if you added fees collection)
router.get("/child/fees", auth, permit("parent"), async (req, res) => {
  const parent = await User.findById(req.user.id).populate({
    path: "child",
    populate: { path: "fees" }
  });
  res.json(parent.child.fees || []);
});

module.exports = router;
