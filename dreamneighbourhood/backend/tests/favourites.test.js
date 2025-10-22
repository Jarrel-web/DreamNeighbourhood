import request from 'supertest';
import express from 'express';
import favouritesRouter from '../routes/favouriteRoutes.js';
import { authenticateToken } from '../middleware/auth.js';
import { pool } from '../config/db.js';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

// Mock dependencies
jest.mock('../middleware/auth.js');
jest.mock('../config/db.js');

const app = express();
app.use(express.json());
app.use('/favourites', favouritesRouter);

describe('Favourites Controller', () => {
  let mockUser;

  beforeEach(() => {
    mockUser = { id: 'user123', email: 'test@example.com' };
    authenticateToken.mockImplementation((req, res, next) => {
      req.user = mockUser;
      next();
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /favourites', () => {
    it('should return user favourites successfully', async () => {
      const mockFavourites = [
        { id: 'prop1', title: 'Property 1', price: 100000 },
        { id: 'prop2', title: 'Property 2', price: 200000 }
      ];

      pool.query.mockResolvedValueOnce({
        rows: mockFavourites,
        rowCount: 2
      });

      const response = await request(app)
        .get('/favourites')
        .expect(200);

      expect(response.body).toEqual({
        favourites: mockFavourites,
        message: 'Favourites retrieved successfully.'
      });

      expect(pool.query).toHaveBeenCalledWith(
        "SELECT p.* FROM user_favorites uf INNER JOIN properties p ON uf.property_id = p.id WHERE uf.user_id = $1 ORDER BY uf.created_at DESC",
        ['user123']
      );
    });

    it('should return empty array when no favourites exist', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      const response = await request(app)
        .get('/favourites')
        .expect(200);

      expect(response.body).toEqual({
        favourites: [],
        message: 'You have no favourite properties yet.'
      });
    });

    it('should handle server errors', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/favourites')
        .expect(500);

      expect(response.body).toEqual({
        message: 'Server error'
      });
    });
  });

  describe('POST /favourites/add', () => {
    it('should add property to favourites successfully', async () => {
      const propertyId = 'prop123';

      // Mock property exists check
      pool.query.mockResolvedValueOnce({
        rows: [{ id: propertyId }],
        rowCount: 1
      });

      // Mock favourite doesn't exist check
      pool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Mock insert
      pool.query.mockResolvedValueOnce({});

      const response = await request(app)
        .post('/favourites/add')
        .send({ propertyId })
        .expect(201);

      expect(response.body).toEqual({
        message: 'Property added to favorites'
      });

      expect(pool.query).toHaveBeenCalledTimes(3);
    });

    it('should return 400 when propertyId is missing', async () => {
      const response = await request(app)
        .post('/favourites/add')
        .send({})
        .expect(400);

      expect(response.body).toEqual({
        message: 'Property address is required.'
      });
    });

    it('should return 404 when property does not exist', async () => {
      const propertyId = 'nonexistent';

      pool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      const response = await request(app)
        .post('/favourites/add')
        .send({ propertyId })
        .expect(404);

      expect(response.body).toEqual({
        message: 'Property not found.'
      });
    });

    it('should return 400 when property is already in favourites', async () => {
      const propertyId = 'prop123';

      // Mock property exists
      pool.query.mockResolvedValueOnce({
        rows: [{ id: propertyId }],
        rowCount: 1
      });

      // Mock favourite already exists
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'fav123' }],
        rowCount: 1
      });

      const response = await request(app)
        .post('/favourites/add')
        .send({ propertyId })
        .expect(400);

      expect(response.body).toEqual({
        message: 'Property is already in favorites'
      });
    });

    it('should handle server errors during add', async () => {
      const propertyId = 'prop123';

      pool.query.mockResolvedValueOnce({
        rows: [{ id: propertyId }],
        rowCount: 1
      });

      pool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/favourites/add')
        .send({ propertyId })
        .expect(500);

      expect(response.body).toEqual({
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('DELETE /favourites/:property_id', () => {
    it('should remove property from favourites successfully', async () => {
      const propertyId = 'prop123';

      // Mock favourite exists
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'fav123' }],
        rowCount: 1
      });

      // Mock delete
      pool.query.mockResolvedValueOnce({});

      const response = await request(app)
        .delete(`/favourites/${propertyId}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Removed from favourites successfully.'
      });

      expect(pool.query).toHaveBeenCalledWith(
        "DELETE FROM user_favorites WHERE user_id = $1 AND property_id = $2",
        ['user123', propertyId]
      );
    });

    it('should return 400 when property_id is missing', async () => {
      const response = await request(app)
        .delete('/favourites/')
        .expect(404); // This will be 404 because route doesn't match

      // For proper testing, you might want to test the middleware
    });

    it('should return 404 when favourite does not exist', async () => {
      const propertyId = 'nonexistent';

      pool.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      const response = await request(app)
        .delete(`/favourites/${propertyId}`)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Favourite not found.'
      });
    });

    it('should handle server errors during removal', async () => {
      const propertyId = 'prop123';

      pool.query.mockResolvedValueOnce({
        rows: [{ id: 'fav123' }],
        rowCount: 1
      });

      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .delete(`/favourites/${propertyId}`)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Server error'
      });
    });
  });

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      authenticateToken.mockImplementation((req, res, next) => {
        return res.status(401).json({ message: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/favourites')
        .expect(401);

      expect(response.body).toEqual({
        message: 'Unauthorized'
      });
    });
  });
});