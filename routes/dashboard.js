const express = require("express");
const router = express.Router();

const User = require("../models/User"); 
const StudentTest = require("../models/StudentTest");
const FeePayment  = require("../models/FeePayment");
const Test        = require("../models/Test");
const Student     = require("../models/Student");
const { auth, permit } = require("../middleware/auth");

/**
 * GET /api/dashboard/parent
 * Role: parent
 */
router.get("/parent", auth, permit("parent"), async (req, res) => {
  try {
    const parent = await User.findById(req.user._id).populate("child");
    if (!parent || !parent.child) {
      return res.status(404).json({ msg: "No child linked to this parent" });
    }

    const studentId = parent.child._id;

    const pendingFees = await FeePayment.find({
      student: studentId,
      status: { $in: ["pending", "partial"] }
    }).select("_id feeType amountPaid status dueDate createdAt");

    const attempts = await StudentTest.find({ student: studentId })
      .populate("test", "title subject")
      .select("_id test answers score attemptedAt");

    let totalScore = 0, totalQuestions = 0, totalCorrect = 0;
    attempts.forEach(attempt => {
      totalScore += (attempt.score || 0);
      attempt.answers.forEach(ans => {
        totalQuestions++;
        if (ans.isCorrect) totalCorrect++;
      });
    });

    const accuracy =
      totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(2) : "0.00";

    return res.json({
      parent: parent.name,
      child: parent.child.name,
      pendingFees,
      performance: {
        totalTests: attempts.length,
        totalScore,
        totalQuestions,
        totalCorrect,
        accuracy: `${accuracy}%`
      }
    });
  } catch (err) {
    console.error("Parent dashboard error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/dashboard/student
 * Role: student
 */
router.get("/student", auth, permit("student"), async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;

    const upcomingTests = await Test.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("_id title subject duration createdAt");

    const pendingFees = await FeePayment.find({
      student: studentId,
      status: { $in: ["pending", "partial"] }
    }).select("_id feeType amountPaid status dueDate createdAt");

    const attempts = await StudentTest.find({ student: studentId })
      .populate("test", "title subject")
      .select("_id test answers score attemptedAt");

    let totalScore = 0, totalQuestions = 0, totalCorrect = 0;
    attempts.forEach(attempt => {
      totalScore += (attempt.score || 0);
      attempt.answers.forEach(ans => {
        totalQuestions++;
        if (ans.isCorrect) totalCorrect++;
      });
    });

    const accuracy =
      totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(2) : "0.00";

    return res.json({
      upcomingTests,
      pendingFees,
      progress: {
        totalTests: attempts.length,
        totalScore,
        totalQuestions,
        totalCorrect,
        accuracy: `${accuracy}%`
      },
      todayClasses: []
    });
  } catch (err) {
    console.error("Student dashboard error:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/dashboard/admin
 * Roles: superadmin, staff, teacher
 */
router.get("/admin", auth, permit("superadmin", "staff", "teacher"), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalTests = await Test.countDocuments();

    const payments = await FeePayment.find();
    let collected = 0, pending = 0, partial = 0;

    payments.forEach(p => {
      if (p.status === "paid") {
        collected += p.amountPaid;
      } else if (p.status === "pending") {
        pending += p.amountPaid;
      } else if (p.status === "partial") {
        collected += p.amountPaid;
        partial += p.amountPaid;
      }
    });

    const latestStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt");

    const latestTests = await Test.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title subject createdAt");

    res.json({
      stats: {
        totalStudents,
        totalTeachers,
        totalTests,
        fees: { collected, pending, partial }
      },
      latestStudents,
      latestTests
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
