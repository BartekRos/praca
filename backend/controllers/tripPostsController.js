const TripPost = require('../models/TripPost');
const User = require('../models/Users');
const db = require('../config/db');
const { QueryTypes } = require('sequelize');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
    const { title, description, duration, price } = req.body;
    const userId = req.user.id;

    const locationData = JSON.parse(req.body.locationData || "[]");

    const photos = req.files.map((file) => file.filename);

    const post = await TripPost.create({
      title,
      description,
      locationData,
      duration: duration || null,
      price: price || null,
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


exports.toggleLike = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `INSERT INTO trip_likes (tripPostId, userId) VALUES (:postId, :userId)
       ON DUPLICATE KEY UPDATE deleted=IF(deleted=1, 0, 1)`,
      {
        replacements: { postId, userId },
        type: QueryTypes.INSERT
      }
    );
    res.json({ message: 'Like toggled' });
  } catch (err) {
    console.error('❌ Błąd przy lajkowaniu:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

exports.addComment = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const { content } = req.body;

  try {
    await db.query(
      `INSERT INTO trip_comments (tripPostId, userId, content) VALUES (:postId, :userId, :content)`,
      {
        replacements: { postId, userId, content },
        type: QueryTypes.INSERT
      }
    );
    res.status(201).json({ message: 'Komentarz dodany' });
  } catch (err) {
    console.error('❌ Błąd dodawania komentarza:', err);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

exports.uploadPhotos = upload.array("photos");