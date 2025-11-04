
import { PropertyRepository } from "../repositories/propertyRepository.js";
import { GeoapifyService } from "../services/geoapifyService.js";
import { ScoringService } from "../services/scoringService.js";

export class SearchService {
  constructor() {
    this.propertyRepository = new PropertyRepository();
    this.geoapifyService = new GeoapifyService();
    this.scoringService = new ScoringService();
  }

  // Rank properties by amenities - EXACT SAME BEHAVIOR
  async rankPropertiesByAmenities(town, rankings) {
    if (!town) {
      throw new Error("town is required");
    }

    if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
      throw new Error("rankings array is required in body");
    }

    // Build query — only filter by town - EXACT SAME
    const properties = await this.propertyRepository.findByTown(town.toUpperCase());

    if (!properties || properties.length === 0) {
      throw new Error("No properties found");
    }

    // Score properties based on amenities only - EXACT SAME
    const scoredProperties = await Promise.all(
      properties.map((p) => 
        this.scoringService.scoreProperty(p, rankings, this.geoapifyService.fetchAmenitiesAroundProperty.bind(this.geoapifyService))
      )
    );

    scoredProperties.sort((a, b) => b.totalScore - a.totalScore);

    return { 
      message: "Ranked properties", 
      results: scoredProperties 
    };
  }
}