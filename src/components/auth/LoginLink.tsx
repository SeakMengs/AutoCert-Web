"use client"
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type LoginLinkProps = React.ComponentProps<typeof Link> & {};

export default function LoginLink({ ...props }: Omit<LoginLinkProps, "href">) {
  const searchParams = useSearchParams();

  return (
    <Link
      href={`/api/oauth/google?${searchParams.toString()}`}
      prefetch={false}
      {...props}
    />
  );
}
