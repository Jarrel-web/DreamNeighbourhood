import React from "react";
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from "./elements/NavBar";
import Header from "./elements/Header.tsx";
import Footer from "./elements/Footer";


export const Layout: React.FC = () => {
   const location = useLocation();

  React.useEffect(() => {
    // Scroll to top whenever the route changes
    window.scrollTo(0, 0);
  }, [location.pathname]); // This triggers on every route change
  
  return (
    <div className="min-h-screen flex flex-col">
    
      <NavBar />
      <Header />
      <main className="flex-1 pt-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
