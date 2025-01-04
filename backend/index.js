const express = require('express');
const app = express();
require('dotenv').config(); // Wczytanie zmiennych środowiskowych

app.use(express.json()); // Middleware do obsługi JSON

// Dodamy ścieżki do rejestracji i logowania później
app.get('/', (req, res) => {
  res.send('Serwer działa!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
