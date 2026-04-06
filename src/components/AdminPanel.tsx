import AdminWorkspace from "../web/admin/AdminWorkspace";

interface AdminPanelProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

export default function AdminPanel(props: AdminPanelProps) {
  return <AdminWorkspace {...props} />;
}
