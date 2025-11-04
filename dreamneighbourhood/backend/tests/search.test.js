import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import app from '../app.js';

jest.mock('../config/db.js', () => ({
  pool: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn()
  }
}));

jest.mock('../utils/geoapify.js', () => ({
  fetchAmenitiesAroundProperty: jest.fn()
}));

jest.mock('../utils/scoringUtils.js', () => ({
  scoreProperty: jest.fn()
}));

import { pool } from '../config/db.js';
import { fetchAmenitiesAroundProperty } from '../utils/geoapify.js';
import { scoreProperty } from '../utils/scoringUtils.js';

describe('Search API', () => {
  
  const mockProperties = [
    {
      id: 1,
      block: '123',
      street_name: 'TEST STREET',
      town: 'TAMPINES',
      flat_type: '4 ROOM',
      floor_area_sqm: 100,
      storey_range: '07 TO 09',
      remaining_lease: '70 years',
      resale_price: 500000,
      latitude: 1.3521,
      longitude: 103.8198
    },
    {
      id: 2,
      block: '456',
      street_name: 'ANOTHER STREET',
      town: 'TAMPINES',
      flat_type: '5 ROOM',
      floor_area_sqm: 120,
      storey_range: '10 TO 12',
      remaining_lease: '75 years',
      resale_price: 600000,
      latitude: 1.3522,
      longitude: 103.8199
    }
  ];

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Exit after all tests are completed
  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/search/rank-properties', () => {
    it('should return 400 if town is not provided', async () => {
      const rankings = [
        { amenityTheme: 'school', rank: 1, maxDistance: 1000 }
      ];

      const response = await request(app)
        .post('/api/v1/search/rank-properties')
        .send({ rankings })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        message: 'town is required'
      });
    });

    it('should return 400 if rankings array is not provided', async () => {
      const response = await request(app)
        .post('/api/v1/search/rank-properties')
        .query({ town: 'TAMPINES' })
        .send({})
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        message: 'rankings array is required in body'
      });
    });

    it('should return ranked properties for valid input', async () => {
      const rankings = [
        { amenityTheme: 'school', rank: 1, maxDistance: 1000 },
        { amenityTheme: 'park', rank: 2, maxDistance: 1000 }
      ];

      pool.eq.mockResolvedValue({ data: mockProperties, error: null });

      const mockScoredProperties = mockProperties.map((prop, index) => ({
        ...prop,
        totalScore: 0.8 - index * 0.3,
        amenityScores: {
          school: { score: 0.9 - index * 0.2, amenity: { distance: 200 } },
          park: { score: 0.7 - index * 0.4, amenity: { distance: 400 } }
        }
      }));

      scoreProperty.mockImplementation((prop, _, __) => 
        Promise.resolve(mockScoredProperties.find(p => p.id === prop.id))
      );

      const response = await request(app)
        .post('/api/v1/search/rank-properties')
        .query({ town: 'TAMPINES' })
        .send({ rankings })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Ranked properties');
      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toHaveLength(2);
      expect(response.body.results[0].totalScore).toBeGreaterThan(response.body.results[1].totalScore);

      expect(pool.from).toHaveBeenCalledWith('properties');
      expect(pool.select).toHaveBeenCalledWith('*');
      expect(pool.eq).toHaveBeenCalledWith('town', 'TAMPINES');
      expect(scoreProperty).toHaveBeenCalledTimes(2);
    });

    it('should handle case when no properties are found', async () => {
      pool.eq.mockResolvedValue({ data: [], error: null });

      const rankings = [
        { amenityTheme: 'school', rank: 1, maxDistance: 1000 }
      ];

      const response = await request(app)
        .post('/api/v1/search/rank-properties')
        .query({ town: 'NONEXISTENT' })
        .send({ rankings })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toEqual({
        message: 'No properties found'
      });
    });

    it('should handle database errors', async () => {
      // Mock db error
      pool.eq.mockResolvedValue({ 
        data: null, 
        error: new Error('Database error') 
      });

      const rankings = [
        { amenityTheme: 'school', rank: 1, maxDistance: 1000 }
      ];

      const response = await request(app)
        .post('/api/v1/search/rank-properties')
        .query({ town: 'TAMPINES' })
        .send({ rankings })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Server error');
      expect(response.body).toHaveProperty('error');
    });
  });
});