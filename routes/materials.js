const express = require("express");
const router = express.Router();
const Material = require("../models/Material");
const { auth, permit } = require("../middleware/auth");

// 📌 Add material (admin/teacher only)
router.post("/", auth, permit("superadmin", "teacher"), async (req, res) => {
  try {
    const material = new Material({
      ...req.body,
      uploadedBy: req.user._id,
    });
    await material.save();
    res.json(material);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📌 Get all materials (everyone)
router.get("/", auth, async (req, res) => {
  try {
    const materials = await Material.find().populate("uploadedBy", "name email");
    res.json(materials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Delete material (admin/teacher only)
router.delete("/:id", auth, permit("superadmin", "teacher"), async (req, res) => {
  try {
    await Material.findByIdAndDelete(req.params.id);
    res.json({ msg: "Material deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;   // ✅ don't forget this!
