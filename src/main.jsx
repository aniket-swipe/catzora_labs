import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AppStoreProvider } from "./store/AppStore.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import "./index.css";

// Apply the stored theme before React paints, so there is no flash.
try {
  const stored = localStorage.getItem("catzora:theme");
  const theme =
    stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
} catch {
  document.documentElement.setAttribute("data-theme", "light");
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppStoreProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppStoreProvider>
    </BrowserRouter>
  </React.StrictMode>
);
