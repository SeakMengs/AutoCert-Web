"use server";
import { validateAccessToken } from "@/auth/server/action";
import FullScreenSpin from "@/components/loading/FullScreenSpin";
import { hasFullAccess } from "@/utils/restrict";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const user = await validateAccessToken();

  if (user.isAuthenticated) {
    // Restrict access based on org acc to avoid public user being requestor which allows them to generate certificates and fill up our storage space.
    if (hasFullAccess(user.user.email)) {
      redirect("/dashboard/projects");
    } else {
      redirect("/dashboard/signature-request");
    }
  }

  return <FullScreenSpin />;
}
