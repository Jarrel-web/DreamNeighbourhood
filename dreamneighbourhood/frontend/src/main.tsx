// main.tsx
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { routerConfig } from "./routes";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { FavouritesProvider } from "./context/FavouriteContext";
import { SearchProvider } from "./context/SearchContext"; // ✅ Add this import
import "./index.css";
import useSessionTimeout from "./hooks/useSessionTimeout";

function Root() {
  useSessionTimeout();

  return (
    <>
      <RouterProvider router={routerConfig} />
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

const root = createRoot(document.getElementById("root")!);

root.render(
  <AuthProvider>
    <FavouritesProvider>
      <SearchProvider> {/* ✅ Add SearchProvider here */}
        <Root />
      </SearchProvider>
    </FavouritesProvider>
  </AuthProvider>
);