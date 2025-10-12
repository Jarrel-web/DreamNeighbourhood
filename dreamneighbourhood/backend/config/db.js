import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined in .env");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL
});


// Check to see if user_favourites table exists, if not create it
pool.query(
  `CREATE TABLE IF NOT EXISTS user_favorites (
    item_id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_addr) REFERENCES properties(id) ON DELETE CASCADE
  )`
).then(() => {
  console.log("✅ user_favorites table is ready");
}).catch((err) => {
  console.error("❌ Error creating user_favorites table:", err.message);
  }
);
