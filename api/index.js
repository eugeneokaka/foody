require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
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

app.use(cors(corsOptions));
// multer

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.listen(3000);
