import bannerImg from "../assets/images/Banner.png";
import { MapPin, Search, Home } from "lucide-react";
import PropertiesSearchSection from "../components/PropertiesSearchSection/PropertiesSearchSection";
function HomePage() {
  return (
    <div>
      {/* Hero Section with Background */}
      <section className="relative w-full flex items-center justify-center overflow-hidden">
  {/* Hero Image */}
  <img
    src={bannerImg}
    alt="Dream Neighbourhood Banner"
    className="w-full h-auto object-cover"
  />

  {/* Overlay for readability */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>

  {/* Text Content */}
  <div className="absolute inset-0 flex flex-col items-start justify-center px-4 sm:px-8 lg:px-12">
    <h1 className="text-blue-600 font-bold drop-shadow-md mb-2
                   text-xl sm:text-3xl md:text-4xl lg:text-5xl
                   max-w-full sm:max-w-[90%] md:max-w-[80%] leading-snug">
      Find Your Dream Home,<br />
      Where It Matters Most
    </h1>

    <p className="text-white drop-shadow-sm
                  text-sm sm:text-base md:text-lg lg:text-xl
                  max-w-full sm:max-w-[90%] md:max-w-[80%] leading-snug">
      Search properties by price, location,<br />
      and nearby amenities — tailored to your lifestyle.
    </p>
  </div>
</section>


      {/* Features Section */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
  <h2 className="text-2xl font-bold mb-6 text-center">Our Features</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

    <div className="bg-card p-6 rounded-lg shadow-l border flex flex-col items-start gap-3">
      <Home className="w-8 h-8 text-blue-600" />
      <h3 className="text-lg font-semibold mb-1">Browse Properties</h3>
      <p className="text-muted-foreground text-sm">
        Explore our extensive collection of properties and find your perfect match.
      </p>
    </div>

    <div className="bg-card p-6 rounded-lg shadow-l border flex flex-col items-start gap-3">
      <Search className="w-8 h-8 text-blue-600" />
      <h3 className="text-lg font-semibold mb-1">Advanced Search</h3>
      <p className="text-muted-foreground text-sm">
        Use our powerful search tools to filter properties by your specific criteria.
      </p>
    </div>

    <div className="bg-card p-6 rounded-lg shadow-l border flex flex-col items-start gap-3">
      <MapPin className="w-8 h-8 text-blue-600" />
      <h3 className="text-lg font-semibold mb-1">Map View</h3>
      <p className="text-muted-foreground text-sm">
        View properties on an interactive map to see their exact location and surroundings.
      </p>
    </div>

  </div>
</div>

      {/* Property Search Section */}
      <PropertiesSearchSection />
    </div>
  );
}

export default HomePage;
