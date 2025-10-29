const express = require("express");
const router = express.Router();

const FeeStructure = require("../models/FeeStructure");
const FeePayment = require("../models/FeePayment");
const User = require("../models/User");       // ✅ needed for name search
const Student = require("../models/Student"); // used in /pending (all)

const { auth, permit } = require("../middleware/auth");

// ➕ Add fee structure
router.post("/structure", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const { className, feeType, amount, dueDate } = req.body;
    const structure = new FeeStructure({ className, feeType, amount, dueDate });
    await structure.save();
    res.json(structure);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📜 Get all fee structures
router.get("/structure", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const structures = await FeeStructure.find();
    res.json(structures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➕ Record a fee payment  (single, clean)
router.post("/payment", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const { studentId, feeType, month, receiptNo, amountPaid, status } = req.body;
    const payment = new FeePayment({ student: studentId, feeType, month, receiptNo, amountPaid, status });
    await payment.save();
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔍 Filter fee payments (name/class/section/status)
router.get("/filter", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const { className, section, status, name } = req.query;
    let query = {};
    if (status) query.status = status; // "paid" | "pending" | "partial"

    if (name) {
      const students = await User.find({ role: "student", name: { $regex: name, $options: "i" } });
      query.student = { $in: students.map(s => s._id) };
    }

    let payments = await FeePayment.find(query)
      .populate("student", "name className section")
      .sort({ createdAt: -1 });

    if (className || section) {
      payments = payments.filter(p =>
        (!className || p.student?.className === className) &&
        (!section || p.student?.section === section)
      );
    }
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✏️ Update a fee record
router.put("/:id", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const updated = await FeePayment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Fee record not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📜 All fee records
router.get("/", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const fees = await FeePayment.find().populate("student", "name email");
    res.json(fees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📜 Payments by student
router.get("/payment/:studentId", auth, permit("superadmin", "staff", "parent"), async (req, res) => {
  try {
    const payments = await FeePayment.find({ student: req.params.studentId }).populate("student");
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Pending fees for a student
router.get("/pending/:studentId", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const structures = await FeeStructure.find();
    const payments = await FeePayment.find({ student: req.params.studentId });

    let pending = [];
    structures.forEach((f) => {
      const paid = payments
        .filter((p) => p.feeType === f.feeType)
        .reduce((sum, p) => sum + p.amountPaid, 0);

      if (paid < f.amount) {
        pending.push({
          feeType: f.feeType,
          total: f.amount,
          paid,
          due: f.amount - paid,
          dueDate: f.dueDate,
        });
      }
    });

    res.json({ studentId: req.params.studentId, pending });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 Pending fees for ALL students
router.get("/pending", auth, permit("superadmin", "staff"), async (req, res) => {
  try {
    const students = await Student.find();
    const structures = await FeeStructure.find();
    const allPayments = await FeePayment.find();

    let report = [];

    for (let stu of students) {
      let pending = [];
      structures.forEach((f) => {
        const paid = allPayments
          .filter((p) => p.student.toString() === stu._id.toString() && p.feeType === f.feeType)
          .reduce((sum, p) => sum + p.amountPaid, 0);

        if (paid < f.amount) {
          pending.push({
            feeType: f.feeType,
            total: f.amount,
            paid,
            due: f.amount - paid,
            dueDate: f.dueDate,
          });
        }
      });

      if (pending.length > 0) {
        report.push({ student: stu.name, studentId: stu._id, pending });
      }
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
