const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const sequelize = require('./config/db'); // Import konfiguracji bazy danych
const authRoutes = require('./routes/auth'); // Import routingu dla autoryzacji
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const postRoutes = require("./routes/post");
const path = require('path');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const chatRoutes = require('./routes/chats');
const friendsRoutes = require('./routes/friends');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const User = require('./models/Users');
const GroupMessage = require('./models/GroupMessage');
const ChatParticipant = require('./models/ChatParticipant');
const Chat = require('./models/Chat');
const tripPostsRoutes = require('./routes/tripPosts');

Conversation.hasMany(Message, { foreignKey: 'conversationId' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId' });

Message.belongsTo(User, { foreignKey: 'senderId', as: 'Sender' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'SentMessages' });

Chat.hasMany(ChatParticipant, { foreignKey: 'chatId' });
ChatParticipant.belongsTo(Chat, { foreignKey: 'chatId' });

ChatParticipant.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(ChatParticipant, { foreignKey: 'userId' });

Chat.hasMany(GroupMessage, { foreignKey: 'chatId' });
GroupMessage.belongsTo(Chat, { foreignKey: 'chatId' });

User.hasMany(GroupMessage, { foreignKey: 'senderId' });
GroupMessage.belongsTo(User, { foreignKey: 'senderId' });

Chat.belongsToMany(User, { through: ChatParticipant, as: 'participants', foreignKey: 'chatId' });
User.belongsToMany(Chat, { through: ChatParticipant, as: 'chats',        foreignKey: 'userId' });



require('./models/Users');
require('./models/Post');
require('./models/UserActivity');
require('./models/TripComment');
require('./models/TripLike');

dotenv.config();

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Synchronizacja bazy danych
sequelize
  .sync({ force: false })
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routing
app.use('/api/auth', authRoutes); // Obsługa endpointów z pliku auth.js

// Domyślny endpoint
app.get('/', (req, res) => {
  res.send('Serwer działa!');
});

// Start serwera tylko, jeśli plik nie jest importowany (np. w testach)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
  });
}

// Eksport aplikacji dla testów
module.exports = app;

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Dokumentacja',
      version: '1.0.0',
      description: 'Dokumentacja naszego API',
    },
    servers: [{ url: 'http://localhost:5000' }],
  },
  apis: ['./routes/*.js'], // Ścieżki do plików z endpointami
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use("/api/posts", postRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/users', userRoutes);

app.use('/api/messages', messageRoutes);

app.use('/api/chats', chatRoutes);

app.use('/api/friends', friendsRoutes);

app.use('/api/trip-posts', tripPostsRoutes);