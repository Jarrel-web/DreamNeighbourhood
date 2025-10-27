// scripts/importResaleCSV.js
import fs from "fs";
import csvParser from "csv-parser";
import { pool } from "../config/db.js"; // Supabase client
import dotenv from "dotenv";

dotenv.config();

const INPUT_CSV = "./data/resale_flats_with_geocode.csv";

// Insert or upsert a single row
const insertRow = async (row) => {
  try {
    await pool.from("properties").upsert(
      [
        {
          town: row.town,
          flat_type: row.flat_type,
          flat_model: row.flat_model,
          floor_area: row.floor_area_sqm,
          lease_commence_date: row.lease_commence_date,
          remaining_lease: row.remaining_lease,
          street_name: row.street_name,
          block: row.block,
          storey_range: row.storey_range,
          resale_price: row.resale_price,
          latitude: row.latitude || null,
          longitude: row.longitude || null,
          postal_code: row.postal_code || null,
          address: `${row.block} ${row.street_name}, Singapore`,
        },
      ],
      { onConflict: ["id"] } // use primary key 'id' to avoid duplicates
    );
  } catch (error) {
    console.error("❌ Insert/Upsert error for row:", row, error.message);
  }
};

const main = async () => {
  console.log("🚀 Starting to insert properties into database...");

  const rows = [];
  fs.createReadStream(INPUT_CSV)
    .pipe(csvParser())
    .on("data", (row) => rows.push(row))
    .on("end", async () => {
      console.log(`Total rows to insert: ${rows.length}`);

      for (let i = 0; i < rows.length; i++) {
        await insertRow(rows[i]);
        if (i % 100 === 0) console.log(`✅ Processed ${i}/${rows.length}`);
      }

      console.log("🎉 All data inserted successfully!");
      // Supabase client does not need pool.end()
    });
};

main();
