import { routes } from "./config";
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "../layouts/Layout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import PropertiesPage from "../pages/PropertiesPage";
import PropertiesSearchPage from "../pages/PropertiesSearchPage";
import FavouritesPage from "../pages/FavouritesPage";
import ErrorPage from "@/pages/ErrorPage";
import ProfilePage from "@/pages/ProfilePage";
import SignUpPage from "@/pages/SignUpPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";

export const routerConfig = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        path: routes.home,
        Component: HomePage,
      },
      {
        path: routes.loginIn,
        Component: LoginPage,
      },
      {
        path: routes.properties,
        Component: PropertiesPage,
      },
      {
        path: routes.propertiesSearch,
        Component: PropertiesSearchPage,
      },
      {
        path: routes.favourites,
        Component: FavouritesPage,
      },
      {
        path: routes.account,
        Component: ProfilePage,
      },
      {
        path: routes.signUp,
        Component: SignUpPage
      },
      {
        path: routes.forgotPassword,
        Component: ForgotPasswordPage,
      },
      {
        path: routes.error,
        Component: ErrorPage,
      },
    ],
  },
]);
