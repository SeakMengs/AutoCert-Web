"use client";
import { useShallow } from "zustand/react/shallow";
import AutoCert, { AutoCertPanel } from "@/components/builder/AutoCert";
import { Flex, Splitter, theme } from "antd";
import { BarSize } from "@/app/dashboard/layout_client";
import ZoomPanel from "@/components/builder/panel/zoom/ZoomPanel";
import Header from "./header";
import { z } from "zod";
import { getProjectByIdSuccessResponseSchema } from "./schema";
import { useAutoCertStore } from "@/components/builder/providers/AutoCertStoreProvider";
import { useEffect } from "react";
import { createScopedLogger } from "@/utils/logger";

const logger = createScopedLogger("src:app:components:builder:builder.tsx");
export interface ProjectBuilderProps
  extends z.infer<typeof getProjectByIdSuccessResponseSchema> {}

export default function Builder({ project, roles }: ProjectBuilderProps) {
  const {
    token: { colorSplit },
  } = theme.useToken();
  const {
    initialCSVParsed,
    removeUnnecessaryAnnotates,
    columns,
    zoom,
    transformWrapperRef,
  } = useAutoCertStore(
    useShallow((state) => {
      return {
        initialCSVParsed: state.initialCSVParsed,
        removeUnnecessaryAnnotates: state.removeUnnecessaryAnnotates,
        columns: state.columns,
        zoom: state.zoom,
        transformWrapperRef: state.transformWrapperRef,
      };
    }),
  );

  useEffect(() => {
    if (!initialCSVParsed) {
      logger.debug("Initial CSV parsed, skip remove unnecessary annotates");
      return;
    }

    removeUnnecessaryAnnotates(columns);
  }, [columns, initialCSVParsed]);

  return (
    <Splitter
      // to reserve space for the header
      className={`w-full overflow-hidden`}
      style={
        {
          // height: `calc(100vh - ${BarSize}px)`,
        }
      }
    >
      <Splitter.Panel className="p-0 overflow-hidden">
        <Header title={project.title} />
        <Flex
          // className="w-full h-full p-2 overflow-auto scrollbar-hide"
          className="relative w-full overflow-auto"
          justify="center"
          align="center"
          style={{
            height: `calc(100vh - ${BarSize}px)`,
          }}
        >
          <AutoCert />
          <div className="absolute bottom-4 right-4">
            <ZoomPanel
              transformWrapperRef={transformWrapperRef}
              zoomScale={zoom}
            />
          </div>
        </Flex>
      </Splitter.Panel>
      <Splitter.Panel
        defaultSize={"30%"}
        max={"70%"}
        style={{
          borderLeft: `1px solid ${colorSplit}`,
        }}
        className="w-1/5"
        collapsible
      >
        <AutoCertPanel />
      </Splitter.Panel>
    </Splitter>
  );
}
