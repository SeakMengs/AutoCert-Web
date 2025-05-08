"use client";
import { useState } from "react";
import { App, message } from "antd";
import { createScopedLogger } from "@/utils/logger";
import { Configuration } from "print-js-updated";

const logger = createScopedLogger("app:hooks:usePrint");

export const usePrint = () => {
  const { message } = App.useApp();
  const [printLoading, setPrintLoading] = useState<boolean>(false);

  // Usage:
  //   onPrint({
  //     printable: "/certificate_merged.pdf",
  //     type: "pdf",
  //   });
  const onPrint = async (configuration: Configuration) => {
    setPrintLoading(true);
    try {
      const printJS = (await import("print-js-updated")).default;

      await new Promise<void>((resolve, reject) => {
        printJS({
          ...configuration,
          onLoadingStart() {
            setPrintLoading(true);

            if (configuration.onLoadingStart) {
              configuration.onLoadingStart();
            }
          },
          onLoadingEnd() {
            setPrintLoading(false);

            if (configuration.onLoadingEnd) {
              configuration.onLoadingEnd();
            }
            resolve();
          },
          onError(err) {
            setPrintLoading(false);

            if (configuration.onError) {
              configuration.onError(err);
            }
            reject(err);
          },
        });
      });
    } catch (error) {
      message.error("Error printing certificates");
      logger.error("Error printing certificates", error);
      setPrintLoading(false);
    } finally {
      setPrintLoading(false);
    }
  };

  return { printLoading, onPrint, setPrintLoading };
};

export default usePrint;
