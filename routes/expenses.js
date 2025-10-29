const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const { auth, permit } = require("../middleware/auth");

// ➕ Add expense
router.post("/", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const { title, amount, category } = req.body;
    const exp = new Expense({ title, amount, category });
    await exp.save();
    res.json(exp);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📜 Get all expenses
router.get("/", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
