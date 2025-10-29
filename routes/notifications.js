const express = require("express");
const multer = require("multer");
const path = require("path");
const { auth, permit } = require("../middleware/auth");
const Notification = require("../models/Notification");

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/notifications"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// ✅ Create notification
router.post(
  "/",
  auth,
  permit("superadmin", "staff", "teacher"),
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, message, audience, link, type, student, className, section } = req.body;

      let fileUrl = null;
      if (req.file) fileUrl = `/uploads/notifications/${req.file.filename}`;

      const note = new Notification({
        title,
        message,
        audience,
        link,
        type: type || (req.file ? "file" : "text"),
        fileUrl,
        student: student || null,
        className: className || null,
        section: section || null,
        createdBy: req.user._id,
      });

      await note.save();
      res.status(201).json(note);
    } catch (err) {
      console.error("Notification create error:", err);
      res.status(500).json({ msg: "Server error", error: err.message });
    }
  }
);

// ✅ Get notifications (student/parent fetch)
router.get("/:studentId", auth, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const User = require("../models/User");
    const user = await User.findById(studentId);

    if (!user) {
      return res.json([]); // no such student
    }

    const conditions = [
      { audience: "all" },
      { audience: user.role },   // match student OR parent role
      { student: studentId }
    ];

    if (user.className && user.section) {
      conditions.push({ className: user.className, section: user.section });
    }

    const notes = await Notification.find({ $or: conditions }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error("Fetch notifications error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;
