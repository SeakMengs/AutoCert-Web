import { Result } from "antd";

export default function PdfDocumentError() {
    return (
      <Result
        status="error"
        title="Failed to load PDF"
        subTitle="If you have download manager extension, please disable it and try again."
      />
    );
  }