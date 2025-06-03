const TripPost = require('../models/TripPost');
const User = require('../models/Users');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const TripComment = require("../models/TripComment");
const TripLike = require("../models/TripLike");

exports.getAllTripPosts = async (req, res) => {
  try {
    const posts = await TripPost.findAll({
      where: { isActive: true },
      include: {
        model: User,
        attributes: ['id', 'username', 'profilePicture'],
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(posts);
  } catch (err) {
    console.error('❌ Błąd pobierania postów z podróży:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};


exports.createTripPost = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;

    const locationData = JSON.parse(req.body.locationData || "[]");

    // ⛔️ WALIDACJA: lokalizacja wymagana
    if (!title || !locationData.length) {
      return res.status(400).json({ message: "Tytuł i lokalizacja są wymagane." });
    }

    // 📸 WALIDACJA: przynajmniej 1 zdjęcie
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Dodaj przynajmniej jedno zdjęcie z podróży." });
    }

    const photos = req.files.map((file) => file.filename);
    const durationParsed = req.body.duration ? parseInt(req.body.duration) : null;
    const priceParsed = req.body.price ? parseFloat(req.body.price) : null;

    const post = await TripPost.create({
      title,
      description: req.body.description || null,
      locationData,
      duration: durationParsed,
      price: priceParsed,
      photos,
      userId,
    });

    const full = await TripPost.findByPk(post.id, {
      include: { model: User, attributes: ["id", "username", "profilePicture"] },
    });

    res.status(201).json(full);
  } catch (err) {
    console.error("❌ Błąd tworzenia trip posta:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};


// GET komentarze posta
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await TripComment.findAll({
      where: { tripPostId: postId },
      include: {
        model: User,
        attributes: ['id', 'username', 'profilePicture']
      },
      order: [['createdAt', 'ASC']]
    });
    res.json(comments);
  } catch (err) {
    console.error("❌ Błąd pobierania komentarzy:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

// DODAJ komentarz
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const comment = await TripComment.create({
      content,
      userId: req.user.id,
      tripPostId: postId,
    });
    const full = await TripComment.findByPk(comment.id, {
      include: {
        model: User,
        attributes: ['id', 'username', 'profilePicture']
      }
    });
    res.status(201).json(full);
  } catch (err) {
    console.error("❌ Błąd dodawania komentarza:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

// USUŃ komentarz (autor komentarza lub właściciel posta)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await TripComment.findByPk(commentId);
    if (!comment) return res.status(404).json({ message: "Komentarz nie znaleziony" });

    const post = await TripPost.findByPk(comment.tripPostId);
    if (
      comment.userId !== req.user.id &&
      post.userId !== req.user.id
    ) {
      return res.status(403).json({ message: "Brak uprawnień do usunięcia" });
    }

    await comment.destroy();
    res.json({ message: "Komentarz usunięty" });
  } catch (err) {
    console.error("❌ Błąd usuwania komentarza:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

// LAJKI
exports.getLikesCount = async (req, res) => {
  try {
    const count = await TripLike.count({
      where: { tripPostId: req.params.postId }
    });
    res.json({ count });
  } catch (err) {
    console.error("❌ Błąd pobierania liczby lajków:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const existing = await TripLike.findOne({
      where: {
        userId: req.user.id,
        tripPostId: req.params.postId
      }
    });

    if (existing) {
      await existing.destroy();
      return res.json({ liked: false });
    }

    await TripLike.create({
      userId: req.user.id,
      tripPostId: req.params.postId
    });

    res.json({ liked: true });
  } catch (err) {
    console.error("❌ Błąd lajkowania:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

// Sprawdzenie czy użytkownik już polubił
exports.checkLiked = async (req, res) => {
  try {
    const existing = await TripLike.findOne({
      where: {
        userId: req.user.id,
        tripPostId: req.params.postId,
      },
    });
    res.json({ liked: !!existing });
  } catch (err) {
    console.error("❌ Błąd sprawdzania lajku:", err);
    res.status(500).json({ message: "Błąd serwera" });
  }
};


exports.uploadPhotos = upload.array("photos");