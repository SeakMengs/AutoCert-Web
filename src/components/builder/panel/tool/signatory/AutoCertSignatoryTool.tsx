import { Button } from "antd";

export interface AutoCertSignatoryToolProps {
  onAddSignatureField: () => void;
  selectedAnnotateId: string | undefined;
}

export default function AutoCertSignatoryTool({
  onAddSignatureField,
  selectedAnnotateId,
}: AutoCertSignatoryToolProps) {
  return (
    <div>
      <Button type="dashed" onClick={onAddSignatureField}>
        Add Text Field
      </Button>
    </div>
  );
}
