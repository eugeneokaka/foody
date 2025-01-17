const express = require("express");
const path = require("path");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const upload = require("../multer");
const router = express.Router();
// create a post
router.use(cors({ credentials: true, origin: "http://localhost:3001" }));
router.post("/upload", upload.single("file"), async (req, res) => {
  // Access the uploaded file information
  const { title, content, steps, category, id, summary } = req.body;
  console.log(req.body);

  if (!title || !content || !category) {
    return res.status(400).json({ error: "All fields are required" });
  }
  // const parsedSteps = steps ? JSON.parse(steps) : null;

  try {
    const post = await prisma.post.create({
      data: {
        title,
        category,
        content,
        steps: steps,
        userId: id,
        path: "ervvre",
        summary,
      },
    });
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }

  // Send a response (e.g., success message)
});

module.exports = router;
