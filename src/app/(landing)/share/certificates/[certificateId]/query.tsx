"use client";

import { useQuery } from "@tanstack/react-query";
import { getCertificateByProjectIdAction } from "./action";
import { Flex } from "antd";
import DisplayZodErrors from "@/components/error/DisplayZodErrors";
import { notFound } from "next/navigation";
import FullScreenSpin from "@/components/loading/FullScreenSpin";
import CertificateContent from "./certificate_content";
import { QueryKey } from "@/utils/react_query";

interface PublicCertificateByIdProps {
  certificateId: string;
}

export default function PublicCertificateById({
  certificateId,
}: PublicCertificateByIdProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QueryKey.PublicCertificateById, certificateId],
    queryFn: async () => {
      return await getCertificateByProjectIdAction({ certificateId });
    },
    refetchOnWindowFocus: false,
  });

  const onErrorRetry = async (): Promise<void> => {
    refetch();
  };

  const Loading = (
    <FullScreenSpin parentClassName="bg-gradient-to-br from-blue-50 to-white" />
  );
  if (isLoading) {
    return Loading;
  }

  if (error) {
    return (
      <Flex vertical align="center" justify="center">
        <DisplayZodErrors
          errors={{
            app: "An error occurred while getting certificate",
          }}
          onRetry={onErrorRetry}
        />
      </Flex>
    );
  }

  if (data && !data.success) {
    if (Object.hasOwn(data.errors, "notFound")) {
      return notFound();
    }

    if (Object.hasOwn(data.errors, "forbidden")) {
      return notFound();
    }

    return (
      <Flex vertical align="center" justify="center">
        <DisplayZodErrors errors={data.errors} onRetry={onErrorRetry} />
      </Flex>
    );
  }

  const cert = data?.data;

  if (!cert) {
    return Loading;
  }

  return <CertificateContent certificate={cert} />;
}
