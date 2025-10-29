const express = require("express");
const router = express.Router();
const TeacherPayment = require("../models/TeacherPayment");
const TeacherStructure = require("../models/TeacherStructure");
const { auth, permit } = require("../middleware/auth");

// ➕ Add teacher payment
router.post("/:id/payments", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const { amount, month, status } = req.body;
    const payment = new TeacherPayment({ teacher: req.params.id, amount, month, status });
    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📜 Get teacher payments
router.get("/:id/payments", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const payments = await TeacherPayment.find({ teacher: req.params.id })
      .populate("teacher", "name email")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Add teacher payment structure
router.post("/structure", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const { teacherId, salaryType, amount, month } = req.body;
    const structure = new TeacherStructure({ teacher: teacherId, salaryType, amount, month });
    await structure.save();
    res.json(structure);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📜 Get all teacher payment structures
router.get("/structure", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const structures = await TeacherStructure.find().populate("teacher", "name email");
    res.json(structures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
