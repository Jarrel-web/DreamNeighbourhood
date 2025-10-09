import React from "react";
import { Link } from "react-router-dom";
import { routes } from "../../routes/config";
import logoUrl from "../../assets/logo.svg";

const Footer: React.FC = () => {
  return (
    <footer className="bg-muted text-muted-foreground mt-auto border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-x-10 ">
          {/* Company Info */}
          <div>
            <Link to={routes.home} className="flex items-center space-x-3 mb-4">
              <img
                src={logoUrl}
                alt="DreamNeighbourhood Logo"
                className="h-30"
              />
            </Link>
            <p className="text-m font-semibold text-muted-foreground mb-4 max-w-md pl-10">
              Your gateway to perfect properties. We help you find your dream
              home with our extensive collection of properties, advanced search
              tools, and interactive map features. Start your property journey
              with us today.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to={routes.home}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to={routes.propertiesSearch}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Search Properties
                </Link>
              </li>
              <li>
                <Link
                  to={routes.favourites}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Favourites
                </Link>
              </li>
              <li>
                <Link
                  to={routes.account}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="text-sm text-muted-foreground">
                <span className="block">Email:</span>
                <a
                  href="mailto:info@dreamneighbourhood.com"
                  className="hover:text-foreground transition-colors"
                >
                  info@dreamneighbourhood.com
                </a>
              </li>
              <li className="text-sm text-muted-foreground">
                <span className="block">Phone:</span>
                <a
                  href="tel:+1234567890"
                  className="hover:text-foreground transition-colors"
                >
                  +1 (234) 567-890
                </a>
              </li>
              <li className="text-sm text-muted-foreground">
                <span className="block">Address:</span>
                <span>
                  123 Property Street
                  <br />
                  Real Estate City, RE 12345
                </span>
              </li>
            </ul>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
