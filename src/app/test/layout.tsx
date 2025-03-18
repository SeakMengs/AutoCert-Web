import { IS_PRODUCTION } from "@/utils/env";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default function TestLayout({
  children,
}: {
  children: Readonly<ReactNode>;
}) {
  if (IS_PRODUCTION) {
    redirect("/");
  }

  return children;
}
