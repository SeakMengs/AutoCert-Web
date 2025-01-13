import { getApiBaseUrl } from "@/utils";
import AuthenticationStatus from "./status";

type AuthenticatingProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Authenticating({
  searchParams,
}: AuthenticatingProps) {
  const sp = await searchParams;
  const urlSp = new URLSearchParams(sp as any);
  const url = `${getApiBaseUrl()}/api/v1/oauth/google/callback?${urlSp.toString()}`;
  const response = await fetch(url);
  const data = await response.json();

  return <AuthenticationStatus isOk={response.ok} token={data.data} />;
}
