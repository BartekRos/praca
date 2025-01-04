const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false, // Wyłącz logi SQL w konsoli
});

sequelize.authenticate()
  .then(() => console.log('Połączono z bazą danych!'))
  .catch((err) => console.error('Błąd połączenia z bazą:', err));

module.exports = sequelize;
