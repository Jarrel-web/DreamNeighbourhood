import {pool} from "../config/db.js";

// Function to retrieve the most recent search page and query from the db
// For a given user_id. 

/* 
export const getCurrentSearchPage = async (req, res) => {
    try {
        const userId = req.user_id;
        if (!userId) {
            // If user_id is not present, skip to the next step on the route
            next();
            return;
        }
        const lastSearch = await pool.query(`
            SELECT search_query, search_params, min_price, max_price 
            FROM search_cache 
            WHERE user_id = $1
        `, [userId]);
        const lastSearchPage = await pool.query(`
            SELECT 
            `)
        
        
    } catch (error) {
        console.error("Error retrieving current search page:", error.message);
        next(); // Proceed without current search page on error
    }
}

export const cacheSearchPage = async (req, res) => {

}
*/