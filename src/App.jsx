import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout.jsx";
import { ToolPage } from "./features/tool-framework/ToolPage.jsx";
import { studios } from "./features/studios.js";
import { Landing } from "./pages/Landing.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { StudioHub } from "./pages/StudioHub.jsx";
import { Projects } from "./pages/Projects.jsx";
import { Settings } from "./pages/Settings.jsx";
import { NotFound } from "./pages/NotFound.jsx";

/**
 * Routes are generated from the studio registries, so every tool is reachable
 * by construction — a tool cannot exist in the nav without a route, or vice versa.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Dashboard />} />

        {studios.map((studio) => (
          <Route key={studio.key} path={studio.key}>
            <Route index element={<StudioHub studio={studio} />} />
            {studio.items.map((item) => (
              <Route
                key={item.slug}
                path={item.slug}
                element={
                  item.kind === "tool" ? <ToolPage tool={item.tool} studio={studio} /> : <item.component />
                }
              />
            ))}
          </Route>
        ))}

        <Route path="projects" element={<Projects />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
