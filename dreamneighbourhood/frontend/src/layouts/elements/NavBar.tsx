import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { routes } from "../../routes/config";
import logoUrl from "../../assets/logo.svg";

const NavBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const location = useLocation();
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navigationItems = [
    { name: "Home", href: routes.home },
    { name: "Properties", href: routes.properties, hasDropdown: true },
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
            <img
              src={logoUrl}
              alt="DreamNeighbourhood Logo"
              className="h-64 w-64"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <div key={item.name} className="relative group">
                  {item.hasDropdown ? (
                    <>
                      <button
                        className={cn(
                          "flex items-center space-x-1 px-3 py-2 text-lg font-semibold transition-colors",
                          isActive
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-foreground hover:text-blue-500"
                        )}
                      >
                        <span>{item.name}</span>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      <div
                        className="
          absolute left-0 mt-2 w-48 
          bg-white border border-gray-200 rounded-lg shadow-lg 
          opacity-0 invisible group-hover:opacity-100 group-hover:visible 
          transition-all duration-200
        "
                      >
                        <a
                          href="/properties"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Properties
                        </a>
                        <a
                          href="/properties/search"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Search
                        </a>
                        <a
                          href="/properties/map"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Map View
                        </a>
                      </div>
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "px-5 py-2 text-lg font-semibold transition-colors",
                        item.isPrimary
                          ? // Primary button (Login / My Profile)
                            "bg-white text-light-blue border rounded-xl border-blue-300 hover:bg-blue-50 active:bg-blue-100"
                          : isActive
                          ? // Active link styling
                            "text-blue-600 border-b-2 border-light-blue"
                          : // Inactive link styling
                            "text-foreground hover:text-light-blue"
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
