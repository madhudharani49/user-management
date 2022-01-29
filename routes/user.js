const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const router = express.Router();
const auth = require("../verifyToken");

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "all users",
      data: users,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.json(500).json(error);
  }
});

router.delete("/:id", auth, async (req, res) => {
  if (req.user.id === req.params.id) {
    try {
      await User.findByIdAndDelete(req.params.id);

      res.status(200).json({
        message: "user deleted",
      });
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json({
      message: "you can update only your account",
    });
  }
});

router.put("/:id", auth, async (req, res) => {
  if (req.user.id === req.params.id) {
    const hashedPassword = await bcrypt.hash(req.body.password, 12);
    if (req.body.password) {
      req.body.password = hashedPassword;
    }
    try {
      const updateUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      const { password, ...updatedInfo } = updateUser._doc;
      res.status(200).json({
        message: "user updated",
        data: updatedInfo,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json({
      message: "you can update only your account",
    });
  }
});
module.exports = router;
