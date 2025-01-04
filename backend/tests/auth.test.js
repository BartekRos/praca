const request = require('supertest');
const app = require('../server'); // Ścieżka do pliku server.js w folderze backend

describe('Auth API', () => {
  it('should return 400 for invalid registration data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: "invalid", password: "short" });
    
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });
});
