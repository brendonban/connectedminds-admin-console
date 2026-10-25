import { AdminShell } from "../../components/admin-shell";
import { TeamEditor } from "./editor";

export default function TeamPage() {
  return (
    <AdminShell
      title="Research Team"
      description="Team members, faculty supervisors, alumni, and the collaborators note shown on the /team page."
    >
      <TeamEditor />
    </AdminShell>
  );
}
