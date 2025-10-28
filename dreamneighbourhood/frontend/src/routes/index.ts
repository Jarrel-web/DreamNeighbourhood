import { routes } from "./config";
import { createBrowserRouter } from "react-router-dom";
import React from "react";
import { Layout } from "../layouts/Layout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import PropertiesPage from "../pages/PropertiesPage";

import FavouritesPage from "../pages/FavouritesPage";
import ErrorPage from "@/pages/ErrorPage";
import ProfilePage from "@/pages/ProfilePage";
import SignUpPage from "@/pages/SignUpPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage"; // Import the new component
import ProtectedRoute from "../components/ProtectedRoute";

export const routerConfig = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { path: routes.home, Component: HomePage },
      { path: routes.loginIn, Component: LoginPage },
      { path: routes.propertyDetails, Component: PropertiesPage },
      
      {
        path: routes.favourites,
        Component: () =>
          React.createElement(
            ProtectedRoute,
            null,
            React.createElement(FavouritesPage)
          ),
      },
      {
        path: routes.profile,
        Component: () =>
          React.createElement(
            ProtectedRoute,
            null,
            React.createElement(ProfilePage)
          ),
      },
      { path: routes.signUp, Component: SignUpPage },
      { path: routes.forgotPassword, Component: ForgotPasswordPage },
      { path: routes.resetPassword, Component: ResetPasswordPage }, // Add this line
      { path: routes.error, Component: ErrorPage },
    ],
  },
]);