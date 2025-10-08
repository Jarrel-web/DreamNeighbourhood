import fs from "fs";
import csvParser from "csv-parser";
import { pool } from "../config/db.js"; // your existing Supabase connection

const INPUT_CSV = "./data/resale_flats_with_geocode.csv";

const insertRow = async (row) => {
  const query = `
    INSERT INTO properties (
      town, flat_type, flat_model, floor_area, lease_commence_date,
      remaining_lease, street_name, block, storey_range, resale_price,
      latitude, longitude, postal_code,address
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
  `;

  const values = [
    row.town,
    row.flat_type,
    row.flat_model,
    row.floor_area_sqm,
    row.lease_commence_date,
    row.remaining_lease,
    row.street_name,
    row.block,
    row.storey_range,
    row.resale_price,
    row.latitude || null,
    row.longitude || null,
    row.postal_code || null,
    `${row.block} ${row.street_name}, Singapore`
    
  ];

  try {
    await pool.query(query, values);
  } catch (error) {
    console.error("❌ Insert error for row:", row, error.message);
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
        if (i % 100 === 0) console.log(`✅ Inserted ${i}/${rows.length}`);
      }

      console.log("🎉 All data inserted successfully!");
      pool.end();
    });
};

main();