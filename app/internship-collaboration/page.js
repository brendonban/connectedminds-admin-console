import { AdminShell } from "../../components/admin-shell";
import { InternshipCollaborationEditor } from "./editor";

export default function InternshipCollaborationPage() {
  return (
    <AdminShell
      title="Get Involved"
      description="Internship openings, collaboration opportunities, FAQ, and the contact callout shown on the Get Involved page."
    >
      <InternshipCollaborationEditor />
    </AdminShell>
  );
}
