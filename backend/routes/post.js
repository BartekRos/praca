const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const Post = require("../models/Post");

const router = express.Router();

// Pobranie wszystkich aktywnych postów
router.get("/", async (req, res) => {
  try {
    const posts = await Post.findAll({ where: { isActive: true }, include: ["User"] });
    console.log("Pobrane posty:", posts);
    res.json(posts);
  } catch (error) {
    console.error("Błąd pobierania postów:", error);
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
});

// Pobranie postów danego użytkownika
router.get("/my-posts", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.findAll({ where: { userId: req.user.id } });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// Dodanie nowego posta
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, country, travelDate, duration, priceFrom, priceTo, maxPeople } = req.body;
    const userId = req.user.id;

    // Sprawdzenie limitu aktywnych postów
    const userPosts = await Post.count({ where: { userId } });
    if (userPosts >= 5) {
      return res.status(400).json({ message: "Możesz mieć maksymalnie 5 aktywnych postów." });
    }

    const newPost = await Post.create({
      title, description, country, travelDate, duration, priceFrom, priceTo, maxPeople, userId
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// Usuwanie posta
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post || post.userId !== req.user.id) {
      return res.status(403).json({ message: "Nie masz uprawnień do tego posta." });
    }

    await post.destroy();
    res.json({ message: "Post usunięty!" });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera" });
  }
});

// Aktywacja/dezaktywacja posta
router.patch("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post || post.userId !== req.user.id) {
      return res.status(403).json({ message: "Nie masz uprawnień do tego posta." });
    }

    post.isActive = !post.isActive;
    await post.save();
    res.json({ message: `Post ${post.isActive ? "aktywowany" : "dezaktywowany"}.` });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera" });
  }
});

module.exports = router;
