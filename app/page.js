import Link from "next/link";
import { AdminShell } from "../components/admin-shell";

const SECTIONS = [
  {
    href: "/get-involved",
    label: "Participate",
    description: "Edit the participant recruitment content shown on the homepage — study details, eligibility, compensation, timeline, and sign-up links.",
  },
  {
    href: "/reading-list",
    label: "Reading List",
    description: "Add, edit, or remove posts on the Reading List page.",
  },
  {
    href: "/team",
    label: "Research Team",
    description: "Edit team members, faculty supervisors, alumni, and the collaborators note.",
  },
  {
    href: "/location",
    label: "Location",
    description: "Address, parking options (with photos), and public transport.",
  },
  {
    href: "/faq",
    label: "FAQ",
    description: "The toggle-style question list on the public FAQ page.",
  },
  {
    href: "/internship-collaboration",
    label: "Get Involved",
    description: "Manage internship and collaboration opportunities, its FAQ, and the contact callout — shown on the Get Involved page.",
  },
];

export default async function DashboardPage() {
  return (
    <AdminShell
      title="Dashboard"
      description="Pick a section to edit. Saving a page commits your changes immediately — use Publish when you're ready to merge them into the live site."
    >
      <div className="grid sm:grid-cols-2 gap-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-xl border border-divider p-5 grid gap-1.5 hover:border-accent-primary transition-colors"
          >
            <h3 className="font-bold">{s.label}</h3>
            <p className="text-muted text-sm">{s.description}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
