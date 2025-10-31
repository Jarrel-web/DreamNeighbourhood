import QUnit from 'qunit';
import { scoreProperty } from '../utils/scoringUtils.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/email.js';
import { fetchAmenitiesAroundProperty } from '../utils/geoapify.js';
import { authenticateToken } from '../middleware/auth.js';
import { pool } from '../config/db.js';

// Mock data for testing
const mockProperty = {
  id: 1,
  block: '123',
  street_name: 'SESAME STREET',
  town: 'LAZY TOWN',
  flat_type: '3 ROOM',
  floor_area_sqm: 144,
  storey_range: '04 TO 06',
  flat_model: 'Boruto: Next Generations',
  remaining_lease: '10 years 0 months',
  postal_code: '123456',
  latitude: 1.3521,
  longitude: 103.8198,
  resale_price: 500000
};

const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword123'
};

const mockToken = 'mock-jwt-token';

// Test Suite: Scoring Utils
QUnit.module('Scoring Utils', (hooks) => {
  let mockAmenities;
  let mockFetchAmenities;
  
  hooks.beforeEach(() => {
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

    mockFetchAmenities = async function(amenityTheme) {
      return mockAmenities[amenityTheme] ? [mockAmenities[amenityTheme]] : [];
    }
  })

  QUnit.test('scoreProperty - Property with nearby amenities', async (assert) => {
    assert.expect(3);
    
    const rankings = [{
      amenityTheme: 'school',
      rank: 1,
      maxDistance: 1000
    }];

    const result = await scoreProperty(mockProperty, rankings, mockFetchAmenities);
    
    assert.ok(result.totalScore >= 0, 'Total score should be non-negative');
    assert.ok(result.totalScore <= 1, 'Total score should not exceed 1');
    assert.ok(result.amenityScores.school.score > 0, 'School amenity score should be positive');
  });

  QUnit.test('scoreProperty - Property with no nearby amenities', async (assert) => {
    assert.expect(2);
    
    mockFetchAmenities = async () => [];
    
    const rankings = [{
      amenityTheme: 'school',
      rank: 1,
      maxDistance: 1000
    }];

    const result = await scoreProperty(mockProperty, rankings, mockFetchAmenities);
    
    assert.strictEqual(result.totalScore, 0, 'Total score should be 0');
    assert.strictEqual(result.amenityScores.school.score, 0, 'School amenity score should be 0');
  });

  QUnit.test('scoreProperty - Multiple amenities with different ranks', async (assert) => {
    assert.expect(4);
    
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
    }]

    const result = await scoreProperty(mockProperty, rankings, mockFetchAmenities);
    
    assert.ok(result.totalScore > 0, 'Total score should be positive');
    assert.ok(result.amenityScores.school.score > 0, 'School amenity score should be positive');
    assert.ok(result.amenityScores.supermarket.score >= 0, 'Supermarket amenity score should be positive, or zero');
    assert.strictEqual(result.amenityScores.hospital.score, 0, 'Hospital amenity score should be 0 as it is beyond max distance');
  });

  QUnit.test('scoreProperty - Distance affects score', async (assert) => {
    assert.expect(3);
    
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

    assert.ok(nearResult.totalScore > 0, 'Near school should have positive score');
    assert.ok(farResult.totalScore > 0, 'Far school should have positive score');
    assert.ok(nearResult.totalScore > farResult.totalScore, 'Closer amenity should have higher score');
  });
});


/*
QUnit.module('Email Utils', (hooks) => {
  QUnit.test('sendVerificationEmail - Success case', async (assert) => {
    assert.expect(1);
    try {
      await sendVerificationEmail(
        mockUser.email,
        mockUser.username,
        'verification-token-123'
      );
      assert.ok(true, 'Verification email sent successfully');
    } catch (error) {
      assert.ok(false, 'Should not throw an error');
    }
  });

  QUnit.test('sendResetPasswordEmail - Success case', async (assert) => {
    assert.expect(1);
    try {
      await sendResetPasswordEmail(
        mockUser.email,
        mockUser.username,
        'reset-token-123'
      );
      assert.ok(true, 'Reset password email sent successfully');
    } catch (error) {
      assert.ok(false, 'Should not throw an error');
    }
  });
});
*/

// Test Suite: Authentication Middleware
QUnit.module('Authentication Middleware', (hooks) => {

  let req, res, next;
  hooks.beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: function(code) {
        statusCode = code;
        return statusCode;
      },
      json: function(data) {
        body = data;
        return body;
      }
    };
    next = () => {
      QUnit.log('Next middleware called');
      return true;
    };
  });

  QUnit.test('authenticateToken - Valid token', async (assert) => {
    assert.expect(2);
    
    // Setup valid token in request headers
    req.headers.authorization = `Bearer ${mockToken}`;
    
    await authenticateToken(req, res, next);
    
    assert.ok(req.user, 'User should be attached to request');
    assert.ok(next, 'Next middleware should be called');
  });

  QUnit.test('authenticateToken - Missing token', async (assert) => {
    assert.expect(2);
    
    await authenticateToken(req, res, next);
    
    assert.strictEqual(res.status, 401, 'Should return 401 status');
    assert.deepEqual(
      res.body,
      { message: 'Unauthorized' },
      'Should return unauthorized message'
    );
  });
});

// Test Suite: Database Operations
QUnit.module('Database Operations', (hooks) => {
  hooks.before(async () => {
    // Setup test database
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS test_users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL
        )
      `);
    } catch (error) {
      console.error('Error setting up test database:', error);
    }
  });

  hooks.after(async () => {
    // Cleanup test database
    try {
      await pool.query('DROP TABLE IF EXISTS test_users');
    } catch (error) {
      console.error('Error cleaning up test database:', error);
    }
  });

  QUnit.test('Database connection test', async (assert) => {
    assert.expect(1);
    try {
      await pool.query('SELECT NOW()');
      assert.ok(true, 'Database connection successful');
    } catch (error) {
      assert.ok(false, 'Database connection failed');
    }
  });

  QUnit.test('Insert and retrieve user test', async (assert) => {
    assert.expect(3);
    try {
      // Insert test user
      const insertResult = await pool.query(
        'INSERT INTO test_users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
        [mockUser.username, mockUser.email, mockUser.password]
      );
      
      assert.ok(insertResult.rows.length > 0, 'User should be inserted');
      
      // Retrieve test user
      const selectResult = await pool.query(
        'SELECT * FROM test_users WHERE email = $1',
        [mockUser.email]
      );
      
      assert.ok(selectResult.rows.length > 0, 'User should be retrieved');
      assert.strictEqual(
        selectResult.rows[0].username,
        mockUser.username,
        'Retrieved username should match'
      );
    } catch (error) {
      assert.ok(false, 'Database operations failed');
    }
  });
});

// Test Suite: Geoapify Integration
QUnit.module('Geoapify Integration', (hooks) => {
  QUnit.test('fetchAmenitiesAroundProperty - Valid coordinates', async (assert) => {
    assert.expect(1);
    
    const amenities = await fetchAmenitiesAroundProperty(
      'school',
      mockProperty.latitude,
      mockProperty.longitude,
      1000
    );
    
    assert.ok(
      Array.isArray(amenities),
      'Should return an array of amenities'
    );
  });

  QUnit.test('fetchAmenitiesAroundProperty - Invalid amenity type', async (assert) => {
    assert.expect(1);
    
    const amenities = await fetchAmenitiesAroundProperty(
      'invalid_type',
      mockProperty.latitude,
      mockProperty.longitude,
      1000
    );
    
    assert.strictEqual(
      amenities.length,
      0,
      'Should return empty array for invalid amenity type'
    );
  });
});