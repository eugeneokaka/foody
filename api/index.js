require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authenticateToken = require("./auth");
const jwt = require("jsonwebtoken");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const path = require("path");
app.use(express.json());
const login = require("./routes/login");
const post = require("./routes/post");
app.use("/auth", login);
app.use("/post", post);
const corsOptions = {
  origin: "http://localhost:3001", // Allow requests from the frontend
  methods: ["GET", "POST"], // Allow specific methods
  allowedHeaders: ["Content-Type"], // Allow specific headers
};

app.use(cors({ credentials: true, origin: "http://localhost:3001" }));
// multer
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.get("/check", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, process.env.SECRETE, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});
app.post("/logout", (req, res) => {
  res.cookie("token", "").json("ok");
});
app.listen(3000);
