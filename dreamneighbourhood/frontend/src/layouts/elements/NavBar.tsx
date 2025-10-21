import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import { routes } from "../../routes/config";
import logoUrl from "../../assets/logo.svg";

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigationItems = [
    { name: "Home", href: routes.home },
    { name: "Properties", href: routes.properties }, // now just one page
    { name: "Favourites", href: routes.favourites },
    {
      name: isLoggedIn ? "My Profile" : "Login",
      href: isLoggedIn ? routes.profile : routes.loginIn,
      isPrimary: true,
    },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] bg-white border-b pt-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={routes.home} className="flex items-center space-x-2">
            <img src={logoUrl} alt="DreamNeighbourhood Logo" className="h-64 w-64" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <div key={item.name}>
                  {item.name === "Properties" ? (
                    // changed from dropdown → single button
                    <button
                      onClick={() => navigate(routes.properties)}
                      className={cn(
                        "px-5 py-2 text-lg font-semibold transition-colors",
                        isActive
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-foreground hover:text-blue-500"
                      )}
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "px-5 py-2 text-lg font-semibold transition-colors",
                        item.isPrimary
                          ? "bg-white text-light-blue border rounded-xl border-blue-300 hover:bg-blue-50 active:bg-blue-100"
                          : isActive
                          ? "text-blue-600 border-b-2 border-light-blue"
                          : "text-foreground hover:text-light-blue"
                      )}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
