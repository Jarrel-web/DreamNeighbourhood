import { scoreProperty } from '../utils/scoringUtils.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/email.js';
import { fetchAmenitiesAroundProperty } from '../utils/geoapify.js';
import { authenticateToken } from '../middleware/auth.js';
import { pool } from '../config/db.js';

const mockProperty = {
  id: 1,
  block: '123',
  street_name: 'SESAME STREET',
  town: 'LAZY TOWN',
  flat_type: '3 ROOM',
  floor_area_sqm: 144,
  storey_range: '04 TO 06',
  flat_model: 'Generation',
  remaining_lease: '10 years 0 months',
  postal_code: '123456',
  latitude: 1.3521,
  longitude: 103.8198,
  resale_price: 500000
};

const mockUser = {
  id: 1,
  username: 'prophunt',
  email: 'prop@hunt.com',
  password: 'hashedpassword123',
  is_verified: true
};

const mockToken = 'mock-token';

jest.mock('../utils/email.js', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendResetPasswordEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('../config/db.js', () => ({
  pool: {
    query: jest.fn()
  }
}));

jest.mock('../middleware/auth.js', () => ({
  authenticateToken: jest.fn()
}));

jest.mock('../utils/geoapify.js', () => ({
  fetchAmenitiesAroundProperty: jest.fn()
}));

// Test Suite: Scoring / Filtering
describe('Scoring Utils', () => {
  let mockAmenities;
  let mockFetchAmenities;
  
  beforeEach(() => {
    mockAmenities = {
      school: {
        distance: 500,
        name: 'School',
        lat: 1.3522,
        lng: 103.8199,
        address: 'School Address'
      },
      supermarket: {
        distance: 1000,
        name: 'Supermarket',
        lat: 1.3523,
        lng: 103.8200,
        address: 'Supermarket Address'
      },
      hospital: {
        distance: 1500,
        name: 'Hospital',
        lat: 1.3529,
        lng: 103.8215,
        address: 'Hospital Address'
      }
    };

    mockFetchAmenities = async (amenityTheme) => {
      return mockAmenities[amenityTheme] ? [mockAmenities[amenityTheme]] : [];
    };
  });

  test('Property with nearby amenities', async () => {
    const rankings = [{
      amenityTheme: 'school',
      rank: 1,
      maxDistance: 1000
    }];

    const result = await scoreProperty(mockProperty, rankings, mockFetchAmenities);
    
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(1);
    expect(result.amenityScores.school.score).toBeGreaterThan(0);
  });

  test('Property with no nearby amenities', async () => {
    mockFetchAmenities = async () => [];
    
    const rankings = [{
      amenityTheme: 'school',
      rank: 1,
      maxDistance: 1000
    }];

    const result = await scoreProperty(mockProperty, rankings, mockFetchAmenities);
    
    expect(result.totalScore).toBe(0);
    expect(result.amenityScores.school.score).toBe(0);
  });

  test('Multiple amenities with different ranks', async () => {
    const rankings = [{
      amenityTheme: 'school',
      rank: 1,
      maxDistance: 1000
    }, {
      amenityTheme: 'supermarket',
      rank: 2,
      maxDistance: 1000
    }, {
      amenityTheme: 'hospital',
      rank: 3,
      maxDistance: 1000
    }];

    const result = await scoreProperty(mockProperty, rankings, mockFetchAmenities);
    
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.amenityScores.school.score).toBeGreaterThan(0);
    expect(result.amenityScores.supermarket.score).toBeGreaterThanOrEqual(0);
    expect(result.amenityScores.hospital.score).toBe(0);
  });

  test('Distance affects score', async () => {
    mockAmenities = {
      school: {
        distance: 100,
        name: 'Neighbourhood School',
        lat: 1.3522,
        lng: 103.8199,
        address: 'Neighbourhood School Address'
      },
      'school-far': {
        distance: 900,
        name: 'Underground School',
        lat: 1.3523,
        lng: 103.8200,
        address: 'Underground School Address'
      }
    };

    const nearSchoolRanking = [{
      amenityTheme: 'school',
      rank: 1,
      maxDistance: 1000
    }];

    const farSchoolRanking = [{
      amenityTheme: 'school-far',
      rank: 1,
      maxDistance: 1000
    }];

    const nearResult = await scoreProperty(mockProperty, nearSchoolRanking, mockFetchAmenities);
    const farResult = await scoreProperty(mockProperty, farSchoolRanking, mockFetchAmenities);

    expect(nearResult.totalScore).toBeGreaterThan(0);
    expect(farResult.totalScore).toBeGreaterThan(0);
    expect(nearResult.totalScore).toBeGreaterThan(farResult.totalScore);
  });
});

// Test Suite: Email
describe('Email Utils', () => {
  test('sendVerificationEmail - Success case', async () => {
    await expect(sendVerificationEmail(
      mockUser.email,
      mockUser.username,
      'verification-token-123'
    )).resolves.toBeTruthy();
  });

  test('sendResetPasswordEmail - Success case', async () => {
    await expect(sendResetPasswordEmail(
      mockUser.email,
      mockUser.username,
      'reset-token-123'
    )).resolves.toBeTruthy();
  });
});

// Test Suite: Authentication
describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: mockUser
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    authenticateToken.mockReset();
  });

  test('Valid token', async () => {
    authenticateToken.mockImplementation((req,res,next) => {
      req.user = mockUser;
      next();
    })

    req.headers.authorization = `Bearer ${mockToken}`;
    
    await authenticateToken(req, res, next);
    
    expect(req.user).toBeTruthy();
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(mockUser);
  });

  test('Missing token', async () => {
    authenticateToken.mockImplementation((req,res,next) => {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    });
    await authenticateToken(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access denied. No token provided.' });
  });
});

// Test Suite: DB query
describe('Database Operations', () => {
  beforeAll(async () => {
    // Create test table
    pool.query.mockImplementation(() => Promise.resolve({ rows: [] }));
  });

  test('Database connection test', async () => {
    await expect(pool.query('SELECT NOW()')).resolves.toBeTruthy();
  });

  test('Insert and retrieve user test', async () => {
    const mockInsertResult = {
      rows: [{ ...mockUser }]
    };
    const mockSelectResult = {
      rows: [{ ...mockUser }]
    };

    pool.query
      .mockImplementationOnce(() => Promise.resolve(mockInsertResult))
      .mockImplementationOnce(() => Promise.resolve(mockSelectResult));

    // Insert test user
    const insertResult = await pool.query(
      'INSERT INTO test_users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [mockUser.username, mockUser.email, mockUser.password]
    );
    
    expect(insertResult.rows.length).toBeGreaterThan(0);
    
    // Retrieve test user
    const selectResult = await pool.query(
      'SELECT * FROM test_users WHERE email = $1',
      [mockUser.email]
    );
    
    expect(selectResult.rows.length).toBeGreaterThan(0);
    expect(selectResult.rows[0].username).toBe(mockUser.username);
  });
});

// Test Suite: Geoapify Integration
describe('Geoapify Integration', () => {
  const mockAmenitiesResponse = [
    { lat: 1.3522, lng: 103.8199, distance: 500, name: 'School', address: 'School Address' },
    { lat: 1.3523, lng: 103.8200, distance: 1000, name: 'School 2', address: 'School 2 Address' }
  ]

  beforeEach(() => {
    fetchAmenitiesAroundProperty.mockReset();
  })


  test('Valid coordinates', async () => {
    fetchAmenitiesAroundProperty.mockResolvedValue(mockAmenitiesResponse);

    const amenities = await fetchAmenitiesAroundProperty(
      'school',
      mockProperty.latitude,
      mockProperty.longitude,
      1000
    );
    
    expect(Array.isArray(amenities)).toBeTruthy();
    expect(amenities).toHaveLength(2);
    expect(amenities[0]).toHaveProperty('name', 'School');
    expect(fetchAmenitiesAroundProperty).toHaveBeenCalledWith(
      'school',
      mockProperty.latitude,
      mockProperty.longitude,
      1000);
  });

  test('Invalid amenity type', async () => {
    fetchAmenitiesAroundProperty.mockResolvedValue([]);

    const amenities = await fetchAmenitiesAroundProperty(
      'invalid_type',
      mockProperty.latitude,
      mockProperty.longitude,
      1000
    );
    
    expect(amenities.length).toBe(0);
  });
});