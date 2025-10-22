/*
import { oneMapSearch } from "../utils/oneMapRequest.js";
import { uraPropertySearch } from "../utils/uraPropertyRequest.js";
import { calculateDistance } from "../utils/Filters.js";
import { getBoundaries } from "../scripts/drawMapBoundaries.js";
import { pool } from "../config/db.js";

export const searchHandler = async (req, res) => {
  try {
    const { query, amenity} = req.query; // Extract the search query, include optional amenity parameter

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    
    const searchVal = amenity ? `${query} ${amenity}` : query; // Modify searchVal according to the presence of amenity filter.

    // Define the parameters for the OneMap API request
    const params = { searchVal: searchVal, returnGeom: "Y", getAddrDetails: "Y" };

    // Make the API request
    const data = await oneMapSearch("common/elastic/search", params);

    console.log(data);

    // Return the API response
    res.status(200).json({
      message: "Search results",
      results: data.results,
    });
  } catch (error) {
    console.error("Error handling search:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// request structure: body {[{amenityTheme : string, weight : number, maxDistance : number}]}, query {district}
export const amenityDistanceFilter = async (req, res) => {
  try {
    // Initialise parameters for search, including default values if not provided
    const params = req.body;
    const district = req.query;
    if (!district) {
      return res.status(400).json({message: "Search district is required"});
    }
    district = district.toUpperCase();
  // Getting all related themes and housing locations and coordinates
  // Getting locations of themes (onemap sucks balls)
    let extents = await getBoundaries(district);
    extents = extents[district].join(",");

    let themeLocations = {};
    for (let i = 0; i < params.length; i++) {
      const theme = params[i].amenityTheme;
      const data = await oneMapSearch('public/themesvc/retrieveTheme', {queryName: theme, extents: extents});
      data.SrchResults.forEach(item => {
        const coords = item.LatLng || 'None';
        if (coords === 'None') return; // Skip the header row

        // Append this item to the theme's list
        themeLocations[theme].push(item);
      });
    }

    // Getting Housing Locations
    const hdbRentalFlats = await pool.query(
      "SELECT * FROM properties WHERE latitude BETWEEN $1 AND $3 AND longitude BETWEEN $2 AND $4",
      [extents[0], extents[1], extents[2], extents[3]]
    )

    // Comparing distances and rating properties
    const propertyRatings = hdbRentalFlats.rows.map(property => {
      let totalScore = 0;
      let amenityScores = {};

      params.forEach(({amenityTheme, weight, maxDistance}) => {
        let dist = Infinity;

        themeLocations[amenityTheme].forEach(amenity => {
          const [Lng, Lat] = amenity.LatLng.split(',').map(Number);
          const d = calculateDistance(
            property.latitude,
            property.longitude,
            Lat,
            Lng
          );

          if (d < dist) dist = d;
        })

        // Calculate score for one amenity type
        // Score is inversely prop to dist up to maxDistance
        let score = 0;
        if (dist <= maxDistance) {
          score = (1 - dist/maxDistance) * weight;
        }

        amenityScores[amenityTheme] = {distance: dist, score: score};
        totalScore += score;
      })



      return {
        id: property.id,
        town: property.town,
        flat_type: property.flat_type,
        flat_model: property.flat_model,
        floor_area: property.floor_area,
        lease_commence_date: property.lease_commence_date,
        remaining_lease: property.remaining_lease,
        street_name: property.street_name,
        block: property.block,
        storey_range: property.storey_range,
        resale_price: property.resale_price,
        latitude: property.latitude,
        longitude: property.longitude,
        postal_code: property.postal_code,
        address: property.address,
        total_score: totalScore
      }

    })

    propertyRatings.sort((a, b) => b.total_score - a.total_score);
    res.status(200).json({message: "Amenity distance filter results", results: propertyRatings});

  } catch (error) {
    console.error("Error handling amenity distance filter:", error.message);
    res.status(500).json({message: "Server error", error: error.message});
  }
}

// Sort current page results by price range
// current page == results in request body. This is to avoid re-querying databases
// request structure: body {results: [{property}]}, query {minPrice, maxPrice}
export const priceFilter = async (req, res) => {
  try {
    const {minPrice, maxPrice} = req.query;
    let {results} = req.body;
    
    


  } catch (error) {
    console.error("Error handling price filter:", error.message);
  }
}
