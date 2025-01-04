const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const sequelize = require('./config/db'); // Import konfiguracji bazy danych
const authRoutes = require('./routes/auth'); // Import routingu dla autoryzacji
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

dotenv.config();

const app = express();

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
