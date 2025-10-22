import request from "supertest";
import app from "../app.js";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";

let token;

const testUser = {
  username: "testuser",
  email: "ngjarrel@gmail.com",
  password: "password123",
};

// mock secret to sign JWTs consistently
process.env.JWT_SECRET = "test_secret_key";

beforeAll(() => {
  // intercept all pool.query calls
  jest.spyOn(pool, "query").mockImplementation((text, params) => {
    // console.log("Mocked query:", text, params);

     // 1️⃣ REGISTER — check for existing user
    if (text.includes("SELECT * FROM users WHERE email")) {
    return Promise.resolve({ rows: [] }); // ✅ user not found
   }

  // 2️⃣ REGISTER — insert user
  if (text.includes("INSERT INTO users")) {
    return Promise.resolve({ rowCount: 1 }); // ✅ success
  }

    // 3️⃣ VERIFY EMAIL — get verification token
    if (text.includes("SELECT verification_token FROM users")) {
      return Promise.resolve({
        rows: [{ verification_token: "mock_verification_token_123" }],
      });
    }

    // 4️⃣ UPDATE verified = true
    if (text.includes("UPDATE users SET verified")) {
      return Promise.resolve({ rowCount: 1 });
    }

    // 5️⃣ LOGIN — fetch user for authentication
    const fakeHash = "$2b$10$6kUmMG0v.IV3OUGKp5NR8ujJX/wqloRyN5sGvlHQVSkacG.KbCM3u";

    if (text.includes("SELECT * FROM users")) {
      return Promise.resolve({
        rows: [
          {
            id: 1,
            username: testUser.username,
            email: testUser.email,
            password: fakeHash,
            verified: true,
          },
        ],
      });
    }

    // 6️⃣ PROFILE — fetch by user id
    if (text.includes("SELECT id, username, email FROM users WHERE id")) {
      return Promise.resolve({
        rows: [
          {
            id: 1,
            username: testUser.username,
            email: testUser.email,
          },
        ],
      });
    }

    // ✅ Make sure everything else has a default return value:
  return Promise.resolve({ rows: [], rowCount: 0 });
});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("🧩 User API (Mocked DB)", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/v1/users/register")
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/User registered/i);
  });

  it("should verify email with token", async () => {
    const res = await request(app).get(
      "/api/v1/users/verify-email?token=mock_verification_token_123"
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Email verified/i);
  });

  it("should login after verification", async () => {
    // simulate a JWT returned by your backend
    token = jwt.sign({ id: 1, email: testUser.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const res = await request(app)
      .post("/api/v1/users/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("should access protected route with valid token", async () => {
    const res = await request(app)
      .get("/api/v1/users/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
  });
});
