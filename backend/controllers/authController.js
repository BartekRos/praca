const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/Users'); // Upewnij się, że ścieżka jest poprawna
const { Op } = require("sequelize");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const GroupMessage = require("../models/GroupMessage");
const ChatParticipant = require("../models/ChatParticipant");
const Conversation = require("../models/Conversation");
const Friendship = require("../models/Friendships");

// Rejestracja użytkownika
exports.register = async (req, res) => {
  try {
    const { email, password, username, name, age, city} = req.body;
    const profilePicture = req.file ? req.file.filename : null;


    // Sprawdzenie, czy użytkownik istnieje
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'Użytkownik już istnieje' });
    }


    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tworzenie nowego użytkownika
    const newUser = await User.create({
      email,
      password: hashedPassword,
      username,
      name,
      age,
      city,
      profilePicture,
    });


    // Usuń hasło z odpowiedzi
    const { password: _, ...userWithoutPassword } = newUser.toJSON();

    res.status(201).json({
      message: 'Rejestracja zakończona sukcesem!',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Błąd rejestracji:', error);
    res.status(500).json({ message: 'Błąd serwera' });
    console.log(req.body); // Sprawdź, co przychodzi w żądaniu
  }
};

// Logowanie użytkownika
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Znalezienie użytkownika
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "Nieprawidłowy e-mail lub hasło" });
    }

    // Sprawdzenie hasła
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Nieprawidłowy e-mail lub hasło" });
    }

    // Generowanie tokenu JWT
    const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Usunięcie hasła z odpowiedzi
    const { password: _, ...userWithoutPassword } = user.toJSON();

    res.status(200).json({
      message: "Logowanie zakończone sukcesem!",
      token,
      user: userWithoutPassword, // Dodajemy użytkownika do odpowiedzi
    });
  } catch (error) {
    console.error("Błąd logowania:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
};

  //resetowanie hasła
  exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Znalezienie użytkownika
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    // Hashowanie nowego hasła
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Aktualizacja hasła
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Hasło zostało zresetowane' });
  } catch (error) {
    console.error('Błąd resetowania hasła:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

//aktualizacja profilu
exports.updateProfile = async (req, res) => {
  try {
    const { city, age, newPassword, currentPassword } = req.body;
    const userId = req.user.id;
    const profilePicture = req.file ? req.file.filename : null;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "Użytkownik nie znaleziony" });

    // Sprawdzenie poprawności hasła
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Nieprawidłowe aktualne hasło" });

    // Aktualizacje pól
    if (city) user.city = city;
    if (age) user.age = age;
    if (newPassword) user.password = await bcrypt.hash(newPassword, 10);
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    const { password, ...userWithoutPassword } = user.toJSON();
    res.status(200).json({ message: "Profil został zaktualizowany", user: userWithoutPassword });
  } catch (error) {
    console.error("Błąd aktualizacji profilu:", error);
    res.status(500).json({ message: "Błąd serwera" });
  }
};


// Usuwanie konta z potwierdzeniem hasła
exports.deleteAccount = async (req, res) => {
  try {
    const { id } = req.user; // Zakładamy, że id użytkownika jest w tokenie
    const { password } = req.body; // Hasło podane przez użytkownika

    // Znalezienie użytkownika
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    // Sprawdzenie poprawności hasła
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Nieprawidłowe hasło' });
    }

    // Usunięcie konta
    // Usuń powiązane wiadomości i czaty
    await Message.destroy({ where: { senderId: id } });
    await GroupMessage.destroy({ where: { senderId: id } });
    await ChatParticipant.destroy({ where: { userId: id } });
    await Conversation.destroy({
      where: { [Op.or]: [{ user1Id: id }, { user2Id: id }] },
    });
    await Chat.destroy({ where: { createdBy: id } });
    await Friendship.destroy({
      where: {
        [Op.or]: [
          { userId: id },
          { friendId: id },
        ],
      },
    });
    await user.destroy();

    res.status(200).json({ message: 'Konto zostało trwale usunięte' });
  } catch (error) {
    console.error('Błąd usuwania konta:', error);
    res.status(500).json({ message: 'Błąd serwera' });
  }
};

// Wylogowanie użytkownika
exports.logout = (req, res) => {
  try {
    // Wylogowanie polega na poinformowaniu klienta o usunięciu tokenu
    res.status(200).json({ message: 'Wylogowano pomyślnie!' });
  } catch (error) {
    console.error('Błąd wylogowania:', error);
    res.status(500).json({ message: 'Błąd serwera podczas wylogowania' });
  }
};
