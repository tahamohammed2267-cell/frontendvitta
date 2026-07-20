import type { PortfolioProject } from "../../../lib/portfolioData";
import CustomDashboardsSection from "../builder/CustomDashboardsSection";

export default function DashboardsTab({ project }: { project: PortfolioProject }) {
  return <CustomDashboardsSection scope="project" scopeId={project.id} />;
}
