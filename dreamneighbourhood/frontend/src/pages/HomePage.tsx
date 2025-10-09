import { Link } from "react-router-dom";
import bannerImg from "../assets/images/Banner.png";
import { routes } from "../routes/config";
import { Button } from "@/components/ui/button";

function HomePage() {
  return (
    <div>
      {/* Hero Section with Background */}
      <section
        className="relative h-[60vh] w-full flex flex-col items-start justify-center text-start text-white"
        style={{
          backgroundImage: `url(${bannerImg})`,
          backgroundSize: "auto",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Content */}
        <div className="relative z-0 px-4 sm:px-6 lg:px-12 w-[500px] ml-90">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-blue">
            Find Your Dream Home, Where It Matters Most
          </h1>
          <p className="text-lg sm:text-xl text-black mb-8 max-w-2xl">
            Search properties by price, location, and nearby amenities —
            tailored to your lifestyle.
          </p>

          {/* Search Button */}
          <Button
            asChild
            variant="outline"
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <Link to={routes.propertiesSearch}>Search Now</Link>
          </Button>
        </div>
      </section>

      {/* Info Cards Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <Link to={routes.properties} className="block">
            <div className="bg-card p-6 rounded-lg shadow-l border hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Browse Properties</h3>
              <p className="text-muted-foreground text-sm">
                Explore our extensive collection of properties and find your
                perfect match.
              </p>
            </div>
          </Link>

          <Link to={routes.propertiesSearch} className="block">
            <div className="bg-card p-6 rounded-lg shadow-l border hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Advanced Search</h3>
              <p className="text-muted-foreground text-sm">
                Use our powerful search tools to filter properties by your
                specific criteria.
              </p>
            </div>
          </Link>

          <Link to={routes.propertiesMap} className="block">
            <div className="bg-card p-6 rounded-lg shadow-l border hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2">Map View</h3>
              <p className="text-muted-foreground text-sm">
                View properties on an interactive map to see their exact
                location and surroundings.
              </p>
            </div>
          </Link>
        </div>
      </div>
      {/*Favorites Section*/}
      <div className="bg-card p-6 sm:p-8 rounded-lg shadow-sm border max-w-7xl mx-auto flex items-center justify-center">
        <p className="text-muted-foreground text-sm sm:text-base text-center">
          Your favourite properties displayed here.
        </p>
      </div>
    </div>
  );
}

export default HomePage;
