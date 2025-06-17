// models/Conversation.js
const { DataTypes } = require('sequelize');
const db            = require('../config/db');

/**
 *  W tabeli conversations trzymamy dokładnie JEDEN wiersz
 *  dla danej pary użytkowników. Unikalny indeks (user1Id,user2Id)
 *  tego dopilnuje – duplikaty zostaną odrzucone przez bazę.
 *
 *  Konwencja: zawsze zapisujemy mniejszy ID w user1Id.
 *  (W kontrolerze startConversation robimy sortowanie).
 */
const Conversation = db.define('Conversation', {
  id: {
    type         : DataTypes.INTEGER,
    primaryKey   : true,
    autoIncrement: true
  },
  user1Id: {
    type      : DataTypes.INTEGER,
    allowNull : false
  },
  user2Id: {
    type      : DataTypes.INTEGER,
    allowNull : false
  }
}, {
  tableName : 'conversations',
  timestamps: true,
  indexes   : [
    {
      // ★ para userów musi być unikalna
      unique : true,
      fields : ['user1Id', 'user2Id']
    }
  ]
});

module.exports = Conversation;
