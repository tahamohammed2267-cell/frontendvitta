import ShareModal from "../../../components/ShareModal";

export default function ShareDashboardModal({
  open, onClose, sharedWith, onChange, dashboardName,
}: { open: boolean; onClose: () => void; sharedWith: string[]; onChange: (users: string[]) => void; dashboardName: string }) {
  return <ShareModal open={open} onClose={onClose} title="Share dashboard" sub={dashboardName} sharedWith={sharedWith} onChange={onChange} />;
}
