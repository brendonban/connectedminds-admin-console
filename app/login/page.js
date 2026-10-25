import { isAuthed } from "../../lib/session";
import { redirect } from "next/navigation";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  if (await isAuthed()) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm grid gap-6">
        <div className="grid gap-1 text-center">
          <h1 className="text-xl font-bold">Connected Minds Admin</h1>
          <p className="text-muted text-sm">
            Enter the shared admin password to continue.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
