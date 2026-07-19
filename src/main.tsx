import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import "./index.css";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import NewProject from "./pages/NewProject";
import ProjectWorkspace from "./pages/workspace/ProjectWorkspace";
import Intelligence from "./pages/Intelligence";
import SearchPage from "./pages/SearchPage";
import KnowledgeGraph from "./pages/KnowledgeGraph";
import PortfolioHome from "./pages/portfolio/PortfolioHome";
import IndustryDashboard from "./pages/portfolio/IndustryDashboard";
import RegionDashboard from "./pages/portfolio/RegionDashboard";
import ProjectDashboard from "./pages/portfolio/ProjectDashboard";
import HealthCenter from "./pages/portfolio/HealthCenter";
import DashboardBuilder from "./pages/portfolio/builder/DashboardBuilder";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/projects", element: <Projects /> },
      { path: "/projects/new", element: <NewProject /> },
      { path: "/projects/:id", element: <ProjectWorkspace /> },
      { path: "/intelligence", element: <Intelligence /> },
      { path: "/portfolio", element: <PortfolioHome /> },
      { path: "/portfolio/health", element: <HealthCenter /> },
      { path: "/portfolio/dashboards/:dashboardId/edit", element: <DashboardBuilder /> },
      { path: "/portfolio/:industry", element: <IndustryDashboard /> },
      { path: "/portfolio/:industry/:region", element: <RegionDashboard /> },
      { path: "/portfolio/:industry/:region/:company/:project", element: <ProjectDashboard /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/graph", element: <KnowledgeGraph /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
