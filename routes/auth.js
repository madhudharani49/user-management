const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { check, validationResult } = require("express-validator");

router.post(
  "/register",
  [
    check("name", "name is required").not().isEmpty(),
    check("location", "location is required").not().isEmpty(),
    check("dob", "date of birth is required").not().isEmpty(),
    check("email", "please enter a valid email").isEmail(),
    check(
      "password",
      "please password should have atleast 5 characters"
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json("user already exits");
    }
    try {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        hobbies: req.body.hobbies,
        location: req.body.location,
        dob: req.body.dob,
        password: await bcrypt.hash(req.body.password, 12),
      });
      console.log(newUser);
      const savedUser = await newUser.save();
      const { password, ...info } = savedUser._doc;
      res.status(201).json({
        message: "successfully registered",
        data: info,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
);
router.post(
  "/login",
  [
    check("email", "please enter a valid email").isEmail(),
    check("password", "please password is required").exists(),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(401).json({
          message: "invalid user",
        });
      }
      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "invalid password",
        });
      }

      const accessToken = jwt.sign(
        { id: user._id, name: user.name },
        process.env.JWT_SECRETE,
        {
          expiresIn: "3d",
        }
      );

      res.status(200).json({
        message: "login successful",
        token: accessToken,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

module.exports = router;
