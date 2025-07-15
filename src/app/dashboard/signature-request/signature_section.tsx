"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  Button,
  Modal,
  Tabs,
  Space,
  App,
  Typography,
  theme,
  TabsProps,
  Alert,
  Skeleton,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  SignatureOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Marquee from "react-fast-marquee";
import { createScopedLogger } from "@/utils/logger";
import {
  addSignatureAction,
  getSignatureByIdAction,
  removeSignatureAction,
} from "./action";
import { base64ToFile, urlToFile } from "@/utils/file";
import { SIGNATURE_AES_COOKIE_NAME, SIGNATURE_COOKIE_NAME } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCookie, setCookie } from "@/utils/server/cookie";
import moment from "moment";
import SignatureUpload from "./signature_upload";
import SignatureDrawer from "./signature_drawer";
import { responseFailed } from "@/utils/response";
import { QueryKey } from "@/utils/react_query";
import { decryptFileAES, encryptFileAES, generateAESKey } from "@/utils/crypto";

const { Title } = Typography;
const logger = createScopedLogger(
  "app:dashboard:signature-request:signature_section",
);

export interface SharedSignatureModalProps {
  onSignatureSave: (base64Signature: string | File) => Promise<boolean>;
  addSignatureState: {
    loading: boolean;
    error: Record<string, string> | null;
  };
}

interface SignatureSectionProps {}

export default function SignatureSection({}: SignatureSectionProps) {
  const {
    token: { colorSplit },
  } = theme.useToken();
  const { message } = App.useApp();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const queryClient = useQueryClient();

  const signature = useQuery({
    queryKey: [QueryKey.SignatureById],
    queryFn: async () => {
      const signatureId = await getCookie(SIGNATURE_COOKIE_NAME);

      if (!signatureId) {
        logger.error("Get signature by id but id not found in cookie");
        return responseFailed(
          "Get signature by id but id not found in cookie",
          {},
        );
      }

      const res = await getSignatureByIdAction({
        signatureId: signatureId,
      });

      if (!res.success) {
        logger.error("Failed to get signature by id", res.errors);
        return res;
      }

      const file = await urlToFile(
        res.data.signature.url,
        res.data.signature.filename,
      );
      const sigAESKey = await getCookie(SIGNATURE_AES_COOKIE_NAME);
      if (!sigAESKey) {
        logger.error("Signature AES key not found in cookie");
        message.error("Signature AES key not found");
        return responseFailed(
          "Signature AES key not found in cookie",
          {},
        );
      }

      let decryptFile: File;
      try {
        decryptFile = await decryptFileAES(file, sigAESKey);
      } catch (error) {
        logger.error("Failed to decrypt signature file", error);
        message.error("Failed to decrypt signature file");
        return responseFailed("Failed to decrypt signature file", {});
      }
      const url = URL.createObjectURL(decryptFile);
      return {
        ...res,
        data: {
          ...res.data,
          signature: {
            ...res.data.signature,
            decryptedUrl: url,
          },
        },
      };
    },
  });

  const sig = signature.data;

  const addSignature = useMutation({
    mutationFn: async (
      data: Parameters<typeof addSignatureAction>[0] & {
        aesKey: string;
      },
    ) => {
      return await addSignatureAction({
        signatureFile: data.signatureFile,
      });
    },
    onSuccess: async (data, variables) => {
      if (!data.success) {
        message.error("Failed to save signature");
        return;
      }

      await onRemoveSignature(true);

      onModalClose();
      message.success("Signature saved successfully");

      await setCookie(
        SIGNATURE_COOKIE_NAME,
        data.data.signature.id,
        moment().add(5, "year").toDate(),
      );
      await setCookie(
        SIGNATURE_AES_COOKIE_NAME,
        variables.aesKey,
        moment().add(5, "year").toDate(),
      );
    },
    onError: (error) => {
      logger.error("Failed to save signature", error);
      message.error("Failed to save signature.");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QueryKey.SignatureById],
      });
    },
  });

  const removeSignature = useMutation({
    mutationFn: async (data: { signatureId: string; silent: boolean }) => {
      return await removeSignatureAction({
        signatureId: data.signatureId,
      });
    },
    onSuccess: async (data, varaible) => {
      await setCookie(SIGNATURE_COOKIE_NAME, "", moment().toDate());
      await setCookie(SIGNATURE_AES_COOKIE_NAME, "", moment().toDate());

      if (!varaible.silent) {
        message.success("Signature removed successfully");
      }
    },
    onError: (error) => {
      logger.error("Failed to remove signature", error);
      message.error("Failed to remove signature.");
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: [QueryKey.SignatureById],
      });
    },
  });

  const onSignatureSave = async (sig: string | File): Promise<boolean> => {
    try {
      logger.debug("addSignatureState signature");

      let file: File = sig as File;

      if (typeof sig === "string") {
        file = base64ToFile(sig, "signature.svg");
      }

      const aesKey = await generateAESKey();
      const encryptedFile = await encryptFileAES(file, aesKey);

      await addSignature.mutateAsync({
        signatureFile: encryptedFile,
        aesKey: aesKey,
      });

      return true;
    } catch (error) {
      logger.error("Failed to save signature", error);
      message.error("Failed to save signature.");
      return false;
    }
  };

  // If silent, don't show error, success message, use for changing signature which we delete the old signature file
  const onRemoveSignature = async (silent: boolean = false): Promise<void> => {
    const signatureId = await getCookie(SIGNATURE_COOKIE_NAME);

    if (!signatureId) {
      logger.error("Signature not found");

      if (!silent) {
        message.error("Signature not found");
      }
      return;
    }

    await removeSignature.mutateAsync({
      signatureId,
      silent,
    });
  };

  const onModalClose = (): void => {
    setIsModalVisible(false);
    reset();
  };

  const reset = (): void => {
    addSignature.reset();
  };

  const onTabChange = (activeKey: string): void => {
    logger.debug("Tab changed", activeKey);

    addSignature.reset();
  };

  const addSignatureState = {
    loading: addSignature.isPending,
    error:
      addSignature.data && !addSignature.data.success
        ? addSignature.data.errors
        : null,
  };

  const tabs = [
    {
      key: "1",
      label: (
        <span>
          <UploadOutlined /> Upload
        </span>
      ),
      children: (
        <SignatureUpload
          onSignatureSave={onSignatureSave}
          addSignatureState={addSignatureState}
        />
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <SignatureOutlined /> Draw
        </span>
      ),
      children: (
        <SignatureDrawer
          onSignatureSave={onSignatureSave}
          addSignatureState={addSignatureState}
        />
      ),
    },
  ] satisfies TabsProps["items"];

  return (
    <div>
      <Space direction="vertical" className="w-full">
        <Title level={4} className="m-0">
          Your Signature
        </Title>
        <Alert
          banner
          message={
            <Marquee pauseOnHover gradient={false} className="text-amber-800">
              Upload or draw your signature to encrypt and store it securely on
              the server. Only you can access it, and it will be used to sign
              certificates upon your approval.
            </Marquee>
          }
        />
        {signature.isLoading ? (
          <Space direction="vertical" className="w-full">
            <Skeleton.Image active className="w-64 h-64" />
            <Space className="w-full" wrap>
              {/* Use input because it's longer which is what our button look like */}
              <Skeleton.Input active />
              <Skeleton.Input active />
            </Space>
          </Space>
        ) : sig && sig.success ? (
          <Space direction="vertical">
            <img
              src={sig.data.signature.decryptedUrl}
              alt="Your signature"
              className="max-w-80"
              style={{
                border: `1px solid #f0f0f0`,
              }}
            />
            <Space wrap>
              <Button
                icon={<EditOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                Change Signature
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={async () => await onRemoveSignature()}
                disabled={removeSignature.isPending}
                loading={removeSignature.isPending}
              >
                Remove Signature
              </Button>
            </Space>
          </Space>
        ) : (
          <Button
            icon={<EditOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Add Signature
          </Button>
        )}
      </Space>
      <Modal
        title={signature ? "Change Your Signature" : "Add Your Signature"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Tabs
          items={tabs}
          defaultActiveKey={tabs[0].key}
          onChange={onTabChange}
        />
      </Modal>
    </div>
  );
}
