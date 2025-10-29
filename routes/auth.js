// backend/routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

const router = express.Router();
const upload = multer();

// ---------- LOGIN ----------
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // If parent, return child profile also
    let childProfile = null;
    if (user.role === "parent" && user.child) {
      const child = await User.findById(user.child).select("_id name className section");
      if (child) childProfile = child;
    }

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        child: user.child || null,
      },
      childProfile,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------- REGISTER ----------
router.post("/register", upload.none(), authOptional, async (req, res) => {
  try {
    const { role, email, password, childAadhaar } = req.body;

    // Public signup → only student or parent allowed
    if (!req.user) {
      if (role !== "student" && role !== "parent") {
        return res.status(403).json({ msg: "You can only sign up as student or parent" });
      }
    }

    // If logged in → check who can add what
    if (req.user) {
      const creatorRole = req.user.role;
      const allowed = {
        superadmin: ["student", "parent", "teacher", "staff", "superadmin"],
        staff: ["student", "parent", "teacher"],
        teacher: ["student", "parent"],
      };

      if (!allowed[creatorRole] || !allowed[creatorRole].includes(role)) {
        return res
          .status(403)
          .json({ msg: `As ${creatorRole}, you cannot create ${role}` });
      }
    }

    // Email must be unique
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already in use" });

    // Password hash
    const hashed = await bcrypt.hash(password, 10);

    // Parent Aadhaar linking
    let child = null;
    if (role === "parent" && childAadhaar) {
      child = await User.findOne({
        role: "student",
        aadhaarNumber: childAadhaar,
      });
    }

    // Create new user
    const user = new User({
      ...req.body,
      password: hashed,
      role,
      child: child ? child._id : null,
    });

    await user.save();

    // JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Safe child profile
    let childProfile = null;
    if (child) {
      childProfile = {
        _id: child._id,
        name: child.name,
        className: child.className,
        section: child.section,
      };
    }

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        child: user.child,
      },
      childProfile,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------- FORGOT PASSWORD ----------
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword)
      return res.status(400).json({ msg: "Email and new password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error("Forgot-password error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------- PROFILE (fixed to return full details) ----------
router.get("/profile/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ---------- AUTH OPTIONAL MIDDLEWARE ----------
async function authOptional(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return next();
  try {
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id).select("-password");
  } catch (e) {
    // ignore invalid token
  }
  next();
}

module.exports = router;
