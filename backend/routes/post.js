const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const Post = require("../models/Post");
const User = require("../models/Users");

const router = express.Router();

// Pobranie wszystkich aktywnych postów
router.get("/", async (req, res) => {
  try {
    const where = { isActive: true };

    if (req.query.userId) {
      where.userId = req.query.userId;
    }

    const posts = await Post.findAll({
      where,
      include: {
        model: User,
        attributes: ['id', 'username', 'profilePicture']
      },
      order: [["createdAt", "DESC"]]
    });

    res.json(posts);
  } catch (error) {
    console.error("Błąd pobierania postów:", error);
    res.status(500).json({ message: "Błąd serwera", error: error.message });
  }
});

// Pobranie postów konkretnego użytkownika (używane w profilach)
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { userId: req.params.userId, isActive: true },
      include: {
        model: User,
        attributes: ['id', 'username', 'profilePicture']
      },
      order: [["createdAt", "DESC"]]
    });

    res.json(posts);
  } catch (error) {
    console.error("Błąd pobierania postów użytkownika:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
});


// Pobranie pojedynczego posta
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, { include: ["User"] });

    if (!post) {
      return res.status(404).json({ message: "Post nie znaleziony" });
    }

    res.json(post);
  } catch (error) {
    console.error("Błąd pobierania posta:", error);
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
    const { title, description, locationData, travelDate, duration, priceFrom, priceTo, maxPeople } = req.body;
    console.log(req.user)
    const userId = req.user.id;

    // Sprawdzenie limitu aktywnych postów
    const userPosts = await Post.count({ where: { userId } });
    if (userPosts >= 5) {
      return res.status(400).json({ message: "Możesz mieć maksymalnie 5 aktywnych postów." });
    }

    // Po utworzeniu posta, pobierz go ponownie z include: User i dopiero wtedy zwróć
const newPost = await Post.create({
  title,
  description,
  locationData,
  travelDate,
  duration,
  priceFrom,
  priceTo,
  maxPeople,
  userId,
});

// Pobierz nowo utworzony post wraz z użytkownikiem
const fullPost = await Post.findByPk(newPost.id, {
  include: {
    model: User,
    attributes: ['username', 'profilePicture'],
  },
});

res.status(201).json(fullPost);

  } catch (error) {
    console.error("Błąd tworzenia posta:", error.message);
    console.error(error); // szczegóły błędu
    res.status(500).json({ message: "Błąd serwera", error });
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
