import { calculateBoundingBox } from '../utils/Filters.js';
import { oneMapSearch } from '../utils/oneMapRequest.js';
import {pool} from "../config/db.js";

const data = await oneMapSearch('public/popapi/getAllPlanningarea');
const coords = data.SearchResults;

// Func to determine the coordinates for the bounding box of each planning area.
// Stores the result in a dict with area name as key and bounding coords as an array of 2 value pairs
const drawMapBoundaries = async (coords) => {
    let mapBoundaries = {};
    for (let i = 0; i < coords.length; i++) {
        const name = coords[i].pln_area_n;
        const points = JSON.parse(coords[i].geojson).coordinates.flat(2);
        const boundingBox = calculateBoundingBox(points);
        mapBoundaries[name] = boundingBox;
    }
    return mapBoundaries;
}

const createTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS map_boundaries (
            id SERIAL PRIMARY KEY,
            district_name VARCHAR(100) UNIQUE NOT NULL,
            min_lat DECIMAL(10,8) NOT NULL,
            min_lng DECIMAL(11,8) NOT NULL,
            max_lat DECIMAL(10,8) NOT NULL,
            max_lng DECIMAL(11,8) NOT NULL,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

const insertBoundaries = async (boundaries) => {
    const insertQuery = `
        INSERT INTO map_boundaries (district_name, min_lat, min_lng, max_lat, max_lng)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (district_name)
        DO UPDATE SET
            min_lat = EXCLUDED.min_lat,
            min_lng = EXCLUDED.min_lng,
            max_lat = EXCLUDED.max_lat,
            max_lng = EXCLUDED.max_lng,
            last_updated = CURRENT_TIMESTAMP;
    `;

    console.log("🚀 Inserting/updating map boundaries into database...");

    for (const [district, bounds] of Object.entries(boundaries)) {
        try {
            const [[minLat, minLng], [maxLat, maxLng]] = bounds;
            await pool.query(insertQuery,[district, minLat, minLng, maxLat, maxLng]);
            console.log(`✅ Processed boundaries for ${district}`);
        } catch (error) {
            console.error(`❌ Error processing ${district}:`, error.message);
        }
    }
}

export const getBoundaries = async(district='') => {
    if (district === '') {
        const res = await pool.query(`SELECT * FROM map_boundaries`)
    } else {
        const res = await pool.query(`SELECT * FROM map_boundaries WHERE district_name = $1`, [district]);
    }
    
    return res.rows.reduce((acc, row) => {
        acc[row.district_name] = [
            [row.min_lat, row.min_lng],
            [row.max_lat, row.max_lng]
        ];
        return acc;
    }, {});
   
}


const main = async () => {
    try {
        await createTable();
        const boundaries = await drawMapBoundaries(coords);
        await insertBoundaries(boundaries);
        console.log("🎉 Map boundaries setup complete!");

    } catch (error) {
        console.error("❌ Error in setting up map boundaries:", error.message);
    } 
}

main();