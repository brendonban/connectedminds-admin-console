import { AdminShell } from "../../components/admin-shell";
import { ReadingListEditor } from "./editor";

export default function ReadingListPage() {
  return (
    <AdminShell
      title="Reading List"
      description="Entries shown on the homepage, grouped by year. Newest entries usually go first."
    >
      <ReadingListEditor />
    </AdminShell>
  );
}
