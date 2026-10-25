import { AdminShell } from "../../components/admin-shell";
import { PublishPanel } from "./publish-panel";

export default function PublishPage() {
  return (
    <AdminShell
      title="Publish"
      description="Merges your saved content and photo changes into the live branch of the site's GitHub repo. Vercel watches that branch and rebuilds the public site automatically once this lands."
    >
      <PublishPanel />
    </AdminShell>
  );
}
