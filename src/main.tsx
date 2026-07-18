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
import Portfolio from "./pages/Portfolio";
import SearchPage from "./pages/SearchPage";
import KnowledgeGraph from "./pages/KnowledgeGraph";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/projects", element: <Projects /> },
      { path: "/projects/new", element: <NewProject /> },
      { path: "/projects/:id", element: <ProjectWorkspace /> },
      { path: "/intelligence", element: <Intelligence /> },
      { path: "/portfolio", element: <Portfolio /> },
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
