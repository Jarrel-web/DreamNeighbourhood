import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./elements/NavBar";
import Header from "./elements/Header.tsx";
import Footer from "./elements/Footer";
import ScrollToTop from "../lib/ScrollToTop";

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <NavBar />
      <Header />
      <main className="flex-1 pt-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
