import { calculateBoundingBox } from '../utils/Filters.js';
import { oneMapSearch } from '../utils/oneMapRequest.js';

const data = await oneMapSearch('public/popapi/getAllPlanningarea');
const coords = data.SearchResults;
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

export const boundaries = await drawMapBoundaries(coords);

