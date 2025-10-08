# 2006-SCSB-32

# Populate Resale Flats Table

This README explains how to populate the `properties` table in your database with HDB resale flat data, including latitude, longitude, and postal codes. The CSV file is already prepared with all necessary data.

## Prerequisites

- Node.js installed
- PostgreSQL or Supabase database
- `.env` file with your database URL:


- CSV file located at `./data/resale_flats_with_geocode.csv`

## Table Structure

Ensure your `properties` table has the following columns:

| Column              | Type    |
|--------------------|---------|
| month               | TEXT    |
| town                | TEXT    |
| flat_type           | TEXT    |
| block               | TEXT    |
| street_name         | TEXT    |
| storey_range        | TEXT    |
| floor_area_sqm      | REAL    |
| flat_model          | TEXT    |
| lease_commence_date | INT     |
| remaining_lease     | TEXT    |
| resale_price        | NUMERIC |
| postal_code         | TEXT    |
| latitude            | REAL    |
| longitude           | REAL    |

## Populate Table

1. Open terminal at project root
2. Run the populate script:
npm run populate

3. Wait for the script to finish inserting all data. Logs will show progress.




