const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Post = require("./models/Post");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// Create new post
app.post("/posts", async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.create({ text });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "Post creation failed" });
  }
});

// Get all posts
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// Vote on a post
app.patch("/posts/:id/vote", async (req, res) => {
  try {
    const { type } = req.body;
    const update = {};

    if (type === "up") update.$inc = { upvotes: 1 };
    else if (type === "down") update.$inc = { downvotes: 1 };
    else return res.status(400).json({ error: "Invalid vote type" });

    const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to vote" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})
