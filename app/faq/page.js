import { AdminShell } from "../../components/admin-shell";
import { FaqEditor } from "./editor";

export default function FaqPage() {
  return (
    <AdminShell
      title="FAQ"
      description="Questions and answers shown as a toggle list on the /faq page."
    >
      <FaqEditor />
    </AdminShell>
  );
}
