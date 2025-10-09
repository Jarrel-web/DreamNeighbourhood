import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { routerConfig } from "./routes";
import { Toaster } from "react-hot-toast"; // ✅ Import Toaster
import "./index.css";

const root = createRoot(document.getElementById("root")!);

root.render(
  <>
    <RouterProvider router={routerConfig} />
    <Toaster position="top-center" reverseOrder={false} />{" "}
  </>
);
