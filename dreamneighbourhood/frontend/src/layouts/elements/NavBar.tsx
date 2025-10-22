import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { routes } from "../../routes/config";
import logoUrl from "../../assets/logo.svg";
import profileIconUrl from "../../assets/profile.png";
import { useAuth } from "../../context/AuthContext";
import { ChevronDown } from "lucide-react";

const NavBar: React.FC = () => {
  const { isLoggedIn, logoutUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // mobile menu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // profile dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-[1000] bg-white border-b shadow-sm pt-4">
      <div className="flex justify-between items-center h-20 px-6 sm:px-10 lg:px-16 w-full">
        {/* Logo */}
        <Link to={routes.home} className="flex items-center">
          <img
            src={logoUrl}
            alt="DreamNeighbourhood Logo"
            className="h-20 sm:h-24 md:h-28 w-auto"
          />
        </Link>

        {/* Desktop Menu */}
        {isLoggedIn ? (
          <div className="hidden md:flex items-center ml-auto space-x-4">
            {/* Profile Dropdown */}
            <div
              ref={dropdownRef}
              className="relative flex items-center cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img
                src={profileIconUrl}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover"
              />
              <ChevronDown
                className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : "rotate-0"
                }`}
              />

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-md z-50">
                  <Link
                    to={routes.profile}
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Account Settings
                  </Link>
                  <Link
                    to={routes.favourites}
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Favourites
                  </Link>
                </div>
              )}
            </div>

            {/* Logout Button Always Visible */}
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-800 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="hidden md:flex space-x-4 ml-auto">
            <Link
              to={routes.signUp}
              className="px-5 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
            >
              Sign Up
            </Link>

            <Link
              to={routes.loginIn}
              className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </Link>
          </div>
        )}

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center ml-auto">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-blue-600 focus:outline-none"
          >
            {isMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 sm:px-10 lg:px-16 py-2 space-y-2">
          {isLoggedIn ? (
            <>
              <Link
                to={routes.profile}
                className="block w-full text-center px-5 py-2 font-semibold rounded-lg hover:bg-gray-100 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <Link
                to={routes.favourites}
                className="block w-full text-center px-5 py-2 font-semibold rounded-lg hover:bg-gray-100 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Favourites
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-center px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to={routes.signUp}
                className="block w-full text-center px-5 py-2 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>

              <Link
                to={routes.loginIn}
                className="block w-full text-center px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;