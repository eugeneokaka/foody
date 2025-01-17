const express = require("express");
require("dotenv").config();
const serect = "$2b$10$gVs9bty/ljv6k6sy.Q.xUu";
module.exports = serect;
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const router = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const saltRounds = 10; // Number of salt rounds
const salt = bcrypt.genSaltSync(saltRounds);
router.use(cors({ credentials: true, origin: "http://localhost:5173" }));
router.use(express.json());
router.post("/signup", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    const check = await prisma.user.findFirst({
      where: { email: email, firstname: firstname },
    });
    if (check) {
      return res.json("this email exists");
    }
    if (!email || !password || !firstname || !lastname) {
      return res.json("not all arguments were receved");
    }
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
      const newuser = await prisma.user.create({
        data: {
          firstname: firstname,
          email,
          lastname: lastname,
          password: hashedPassword,
        },
      });
      return res.json({ mess: "user was created succesfully", newuser });
    } catch (err) {
      return res.json(err);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});
router.post("/login", async (req, res) => {
  console.log("visited");
  const { name, password } = req.body;
  console.log(req.body);
  if (!name || !password) {
    return res.json("missing some arguments");
  }
  const user = await prisma.user.findFirst({
    // where: { password: password },
    where: { firstname: name },
  });
  if (!user) {
    console.log("not found");
    return res.status(401).json({ message: "no user found maching this name" });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    console.log("wrong passc");
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Create JWT
  console.log("passed");
  const token = jwt.sign(
    { name: user.name, id: user.id, email: user.email },
    process.env.SECRETE,
    {
      expiresIn: "1h",
    }
  ); // Example: expires in 1 hour

  // Set JWT in HttpOnly cookie
  res.cookie("token", token, {
    httpOnly: true, // Important: Prevents client-side JavaScript access
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: "strict", // Helps prevent CSRF attacks
    maxAge: 3600000, // 1 hour in milliseconds
    path: "/", // Cookie available for all routes
  });
  console.log("ok");
  res.json({ message: "Login successful", token });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  res.json({ message: "Logout successful" });
});

module.exports = router;
