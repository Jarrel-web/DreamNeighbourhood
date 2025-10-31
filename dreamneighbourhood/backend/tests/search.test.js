import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import app from '../app.js';


// Mock the makeOneMapRequest function
 // jest.mock('../utils/oneMapRequest.js');

describe('Search API', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/search', () => {
    it('should return 400 if no query parameter is provided', async () => {
      const response = await request(app)
        .post('/api/v1/search/rank-properties')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({
        message: 'Search query is required'
      });
    });

    it('should return search results for a valid query', async () => {
      // Mock the OneMap API response
      const mockResults = {
        results: [
          {
            SEARCHVAL: 'TEST LOCATION',
            BLK_NO: '123',
            ROAD_NAME: 'Test Road',
            BUILDING: 'Test Building',
            ADDRESS: '123 Test Road',
            POSTAL: '123456',
            X: '123.456',
            Y: '456.789',
            LATITUDE: '1.3521',
            LONGITUDE: '103.8198'
          }
        ]
      };

      makeOneMapRequest.mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/search?query=test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Search results',
        results: mockResults.results
      });

      expect(makeOneMapRequest).toHaveBeenCalledWith(
        'common/elastic/search',
        {
          searchVal: 'test',
          returnGeom: 'Y',
          getAddrDetails: 'Y'
        },
        expect.any(String)
      );
    });

    it('should handle search with amenity filter', async () => {
      const mockResults = {
        results: [
          {
            SEARCHVAL: 'TEST PARK',
            BLK_NO: '123',
            ROAD_NAME: 'Park Road',
            BUILDING: 'Test Park',
            ADDRESS: '123 Park Road',
            POSTAL: '123456',
            X: '123.456',
            Y: '456.789',
            LATITUDE: '1.3521',
            LONGITUDE: '103.8198'
          }
        ]
      };

      makeOneMapRequest.mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/v1/search?query=test&amenity=park')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Search results',
        results: mockResults.results
      });

      expect(makeOneMapRequest).toHaveBeenCalledWith(
        'common/elastic/search',
        {
          searchVal: 'test park',
          returnGeom: 'Y',
          getAddrDetails: 'Y'
        },
        expect.any(String)
      );
    });

    it('should handle server errors gracefully', async () => {
      makeOneMapRequest.mockRejectedValue(new Error('API Error'));

      const response = await request(app)
        .get('/api/v1/search?query=test')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Server error',
        error: 'API Error'
      });
    });
  });
});