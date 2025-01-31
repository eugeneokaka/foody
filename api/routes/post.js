const express = require("express");
const path = require("path");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const upload = require("../multer");
const router = express.Router();
// create a post
// router.use(express.static());

router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

router.use(cors({ credentials: true, origin: "http://localhost:3001" }));
router.post("/upload", upload.single("file"), async (req, res) => {
  // Access the uploaded file information
  let { title, content, steps, category, id, summary } = req.body;
  console.log("visited upl route");
  console.log(req.body);
  steps = steps.split(",");

  if (!title || !content || !category) {
    console.log("All fields are required");
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
        // userId: "ea02f1ff-f452-4a44-aab5-54160d263925",
        path: `/uploads/${req.file.filename}`,
        summary,
      },
    });
    console.log(post);
    res.status(201).json({ mess: "created succesfulyy", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }

  // Send a response (e.g., success message)
});
router.get("/", async (req, res) => {
  try {
    // Destructure and set default values for query parameters
    let { category, page, query } = req.query;
    page = parseInt(page); // Ensure `page` is a number
    const skipby = (page - 1) * 4;

    console.log("Query Parameters:", { category, page, query });

    if (category === "all") {
      console.log("Fetching all categories...");
      const posts = await prisma.post.findMany({
        where: {
          title: { contains: query },
        },
        skip: skipby,
        take: 4,
      });
      return res.json(posts);
    }

    console.log(`Fetching posts for category: ${category}`);
    const posts = await prisma.post.findMany({
      where: {
        category: category, // Filter by category
        title: { contains: query },
      },
      skip: skipby,
      take: 4,
    });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const singlepost = await prisma.post.findUnique({
    where: {
      id: id,
    },
  });
  console.log("single:", singlepost.views);
  const updateview = await prisma.post.update({
    where: { id: id },
    data: {
      views: singlepost.views + 1,
    },
  });
  console.log("updated:", updateview.views);

  res.json(singlepost);
});
router.post("/like", async (req, res) => {
  const { postId } = req.body;
  const { userId } = req.body;
  console.log(req.body);

  try {
    // Fetch the post and check if user already liked it
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        likesnum: true,
        userLikes: true,
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user already liked the post
    const userAlreadyLiked = post.userLikes?.includes(userId);

    if (userAlreadyLiked) {
      return res
        .status(400)
        .json({ message: "You have already liked this post" });
    }

    // Update the post: increment likesnum and push userId to userLikes array
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        likesnum: { increment: 1 },
        userLikes: post.userLikes ? [...post.userLikes, userId] : [userId],
      },
    });

    res.json({ message: "Post liked successfully", updatedPost });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message });
  }
});
// router.get("/", async (req, res) => {
//   let { category, page, query } = req.query;
//   console.log(req.query);
//   const skipby = page * 4;
//   console.log(category);
//   if ((category = "all")) {
//     console.log("all ca55");
//     const post = await prisma.post.findMany({
//       where: {
//         title: { contains: query },
//       },
//     });
//     // console.log(po);
//     return res.json(post);
//   }
//   const posts = await prisma.post.findMany({
//     where: {
//       category: "",
//       title: { contains: query },
//     },
//     skip: skipby,
//     take: 4,
//   });
//   // console.log(posts);
//   res.json(posts);
// });
module.exports = router;
