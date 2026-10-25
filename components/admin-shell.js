import Link from "next/link";
import { requireAuth } from "../lib/session";
import { LogoutButton } from "./logout-button";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/get-involved", label: "Participate" },
  { href: "/reading-list", label: "Reading List" },
  { href: "/team", label: "Research Team" },
  { href: "/location", label: "Location" },
  { href: "/faq", label: "FAQ" },
  { href: "/internship-collaboration", label: "Get Involved" },
  { href: "/publish", label: "Publish" },
];

export async function AdminShell({ title, description, children }) {
  await requireAuth();

  return (
    <div className="min-h-screen">
      <div className="border-b border-divider">
        <div className="max-w-[1100px] mx-auto px-4 py-3 flex items-center justify-between">
          <span className="font-semibold">Connected Minds Admin</span>
          <LogoutButton />
        </div>
      </div>
      <div className="max-w-[1100px] mx-auto px-4 py-8 grid md:grid-cols-[210px_1fr] gap-8">
        <nav className="grid gap-1 content-start">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent-primary/10 hover:text-accent-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="grid gap-6 min-w-0 pb-24">
          {title && (
            <div className="grid gap-1">
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && (
                <p className="text-muted text-sm max-w-[65ch]">{description}</p>
              )}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
