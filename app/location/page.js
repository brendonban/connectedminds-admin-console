import { AdminShell } from "../../components/admin-shell";
import { LocationEditor } from "./editor";

export default function LocationPage() {
  return (
    <AdminShell
      title="Location"
      description="Address, parking options, and public transport shown on the /location page."
    >
      <LocationEditor />
    </AdminShell>
  );
}
