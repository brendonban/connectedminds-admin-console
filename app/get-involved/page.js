import { AdminShell } from "../../components/admin-shell";
import { GetInvolvedEditor } from "./editor";

export default function GetInvolvedPage() {
  return (
    <AdminShell
      title="Participate"
      description="Everything on the homepage's participant recruitment section: study details, eligibility, compensation, timeline, confidentiality, researcher contact, and sign-up links."
    >
      <GetInvolvedEditor />
    </AdminShell>
  );
}
