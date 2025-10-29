const express = require("express");
const router = express.Router();

const StudentTest = require("../models/StudentTest");
const Student = require("../models/Student");
const FeePayment = require("../models/FeePayment");
const TeacherPayment = require("../models/TeacherPayment"); // ✅ add
const Expense = require("../models/Expense");               // ✅ add

const { auth, permit } = require("../middleware/auth");

// 📌 Student Progress Report
router.get("/student/:id", auth, permit("superadmin", "teacher", "parent", "staff"), async (req, res) => {
  try {
    const studentId = req.params.id;

    const attempts = await StudentTest.find({ student: studentId })
      .populate("test")
      .populate("student", "name email role");

    if (!attempts.length) {
      return res.json({ msg: "No test attempts found for this student." });
    }

    let totalScore = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;

    attempts.forEach(attempt => {
      totalScore += attempt.score;
      attempt.answers.forEach(ans => {
        totalQuestions++;
        if (ans.isCorrect) totalCorrect++;
      });
    });

    const accuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(2) : "0.00";

    res.json({
      student: attempts[0].student,
      totalTests: attempts.length,
      totalScore,
      totalQuestions,
      totalCorrect,
      accuracy: accuracy + "%",
      attempts
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 Finance (fees only)
router.get("/finance", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const payments = await FeePayment.find().populate("student", "name email");

    let totalCollected = 0;
    let totalPending = 0;
    let totalPartial = 0;

    payments.forEach(p => {
      if (p.status === "paid") totalCollected += p.amountPaid;
      else if (p.status === "pending") totalPending += p.amountPaid;
      else if (p.status === "partial") {
        totalCollected += p.amountPaid;
        totalPartial += p.amountPaid;
      }
    });

    res.json({ totalCollected, totalPending, totalPartial, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Finance for one student
router.get("/finance/:studentId", auth, permit("superadmin", "staff", "parent"), async (req, res) => {
  try {
    const { studentId } = req.params;
    const payments = await FeePayment.find({ student: studentId }).populate("student", "name email");
    if (!payments.length) return res.json({ msg: "No fee records found for this student." });

    let totalCollected = 0, totalPending = 0, totalPartial = 0;
    payments.forEach(p => {
      if (p.status === "paid") totalCollected += p.amountPaid;
      else if (p.status === "pending") totalPending += p.amountPaid;
      else if (p.status === "partial") { totalCollected += p.amountPaid; totalPartial += p.amountPaid; }
    });

    res.json({ student: payments[0].student, totalCollected, totalPending, totalPartial, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Finance for a class
router.get("/finance/class/:className", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const { className } = req.params;
    const students = await Student.find({ className }).select("_id name email");
    if (!students.length) return res.json({ msg: "No students found in this class." });

    const studentIds = students.map(s => s._id);
    const payments = await FeePayment.find({ student: { $in: studentIds } }).populate("student", "name email");

    let totalCollected = 0, totalPending = 0, totalPartial = 0;
    payments.forEach(p => {
      if (p.status === "paid") totalCollected += p.amountPaid;
      else if (p.status === "pending") totalPending += p.amountPaid;
      else if (p.status === "partial") { totalCollected += p.amountPaid; totalPartial += p.amountPaid; }
    });

    res.json({ className, totalStudents: students.length, totalCollected, totalPending, totalPartial, payments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Overall (fees + salaries + expenses)
router.get("/overview", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const fees = await FeePayment.find();
    const salaries = await TeacherPayment.find();
    const expenses = await Expense.find();

    const totalCollected = fees.reduce((s,f)=> f.status==="paid" ? s + f.amountPaid : s, 0);
    const totalPending   = fees.reduce((s,f)=> f.status!=="paid" ? s + f.amountPaid : s, 0);
    const totalSalaries  = salaries.reduce((s,p)=> s + (p.amount||0), 0);
    const totalExpenses  = expenses.reduce((s,e)=> s + (e.amount||0), 0);

    const debit   = totalSalaries + totalExpenses;
    const balance = totalCollected - debit;

    res.json({ totalCollected, totalPending, totalSalaries, totalExpenses, debit, balance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
