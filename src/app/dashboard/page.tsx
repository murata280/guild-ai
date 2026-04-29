import { redirect } from "next/navigation";

// /dashboard → /wallet redirect (Final Vision: renamed to お財布)
export default function DashboardRedirect() {
  redirect("/wallet");
}
