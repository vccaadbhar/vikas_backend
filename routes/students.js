const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const User = require("../models/User");
const multer = require("multer");
const bcrypt = require("bcrypt");

// File upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/students");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// 📌 Create student (also create login user)
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.photo = `/uploads/students/${req.file.filename}`;
    }

    // Save student profile
    const student = new Student(data);
    await student.save();

    // Create User account for login
    const hashedPass = await bcrypt.hash(data.password, 10);
    const user = new User({
      name: data.name,
      email: data.email,
      password: hashedPass,
      role: "student",
      photo: student.photo,
      child: student._id, // link to student
    });
    await user.save();

    res.status(201).json({ student, user });
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(400).json({ error: err.message });
  }
});

// 📌 Get all students (with filters)
router.get("/", async (req, res) => {
  try {
    const { class: classFilter, section, name } = req.query;
    const filter = {};
    if (classFilter) filter.class = classFilter;
    if (section) filter.section = section;
    if (name) filter.name = new RegExp(name, "i");

    const students = await Student.find(filter).sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Get single student
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Not found" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Update profile
router.put("/:id", upload.single("photo"), async (req, res) => {
  const updateData = { ...req.body };
  if (req.file) updateData.photo = `uploads/${req.file.filename}`;
  const updated = await Student.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });
  res.json(updated);
});

// Change password
router.put("/:id/password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ msg: "Student not found" });
  if (student.password !== oldPassword)
    return res.status(400).json({ msg: "Incorrect current password" });
  student.password = newPassword;
  await student.save();
  res.json({ msg: "Password updated successfully" });
});

// 📌 Update student
router.put("/:id", upload.single("photo"), async (req, res) => {
  try {
    const data = req.body;
    if (req.file) {
      data.photo = `/uploads/students/${req.file.filename}`;
    }

    const updated = await Student.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Not found" });

    // Also update user (name, email, photo if changed)
    await User.findOneAndUpdate(
      { child: updated._id, role: "student" },
      {
        name: updated.name,
        email: updated.email,
        photo: updated.photo,
      }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 Delete student
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });

    // Also remove linked user
    await User.findOneAndDelete({ child: deleted._id, role: "student" });

    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
