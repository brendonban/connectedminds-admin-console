import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, isValidSessionValue } from "./auth";

/** For use in API route handlers: returns true/false, never redirects. */
export async function isAuthed() {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return isValidSessionValue(value);
}

/** For use in server components: redirects to /login when not authed. */
export async function requireAuth() {
  const authed = await isAuthed();
  if (!authed) {
    redirect("/login");
  }
}
