import request from "supertest";
import app from "../app.js";
import { pool } from "../config/db.js"; 

let token;

const testUser = {
  username: "testuser",
  email: "ngjarrel@gmail.com",
  password: "password123",
};

describe("User API Endpoints", () => {
  afterAll(async () => {
    // Cleanup the test user
    await pool.query("DELETE FROM users WHERE email = $1", [testUser.email]);
    await pool.end();
  });

  it("should register a new user", async () => {
    const res = await request(app).post("/api/users/register").send(testUser);
    console.log("REGISTER RESPONSE:", res.body);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toMatch(/User registered/i);
  });

  it("should verify email with token", async () => {
    // fetch the real verification token from DB
    const { rows } = await pool.query(
      "SELECT verification_token FROM users WHERE email = $1",
      [testUser.email]
    );
    const verificationToken = rows[0].verification_token;
    console.log(verificationToken)
    const res = await request(app).get(`/api/users/verify-email?token=${verificationToken}`);
    console.log("VERIFY RESPONSE:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/Email verified/i);
  });

  it("should login after verification", async () => {
    const res = await request(app)
      .post("/api/users/login")
      .send({ email: testUser.email, password: testUser.password });
    console.log("LOGIN RESPONSE:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");

    token = res.body.token; // store for protected route
  });

  it("should access protected route with valid token", async () => {
    const res = await request(app)
      .get("/api/users/profile") // protected route
      .set("Authorization", `Bearer ${token}`);
    console.log("PROTECTED RESPONSE:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
  });
});
