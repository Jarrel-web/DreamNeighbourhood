import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { routerConfig } from "./routes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { FavouritesProvider } from "./context/FavouriteContext"; // ✅ import this
import "./index.css";

const root = createRoot(document.getElementById("root")!);

root.render(
  <AuthProvider>
    <FavouritesProvider> {/* ✅ Wrap inside AuthProvider */}
      <RouterProvider router={routerConfig} />
      <Toaster position="top-center" reverseOrder={false} />
    </FavouritesProvider>
  </AuthProvider>
);
