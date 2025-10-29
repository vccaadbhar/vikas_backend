const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");

// (Simple placeholder route just to fix error)
router.get("/", (req, res) => {
  res.json({ message: "Attempts route working ✅" });
});

module.exports = router;
