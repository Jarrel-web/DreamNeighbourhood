import React, { useState } from "react";
import ErrorImg from "../assets/images/Error.png";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ErrorPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 md:px-8">
      <div className="flex w-full max-w-[960px] items-center justify-center gap-8 md:gap-12 flex-wrap md:flex-nowrap">
        <div>
          <h1 className="text-4xl font-bold text-blue-600 mb-4">Oops!</h1>
          <h2 className="text-2xl font-semibold mb-6">Page Not Found!</h2>
          <h3 className="text-lg font-semibold text-gray-600 mb-8">
            The page you are looking for does not exist or has been moved. We
            suggest you back to the homepage.
          </h3>
          <Button
            variant="outline"
            size="lg"
            className="bg-blue-600 text-white"
          >
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
        {/* Illustration */}
        <div className="hidden md:flex justify-center items-center flex-shrink-0 flex-grow max-w-[calc(50%-2rem)] lg:max-w-[45%]">
          <img
            src={ErrorImg}
            alt="DreamNeighbourhood illustration"
            className="w-full h-auto max-w-[380px]"
          />
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
