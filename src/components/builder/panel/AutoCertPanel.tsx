import { Collapse, CollapseProps, Typography } from "antd";
import AutoCertTextTool, {
    AutoCertTextToolProps,
} from "./tool/text/AutoCertTextTool";
import AutoCertSignatoryTool, {
    AutoCertSignatoryToolProps,
} from "./tool/signatory/AutoCertSignatoryTool";

export interface AutoCertPanelProps
    extends AutoCertTextToolProps,
        AutoCertSignatoryToolProps {}

const { Title } = Typography;

export default function AutoCertPanel({
    tableColumns,
    textAnnotates,
    selectedAnnotateId,
    currentPdfPage,
    onAnnotateSelect,
    onAddTextField,
    onUpdateTextField,
    onDeleteTextField,
    onAddSignatureField,
}: AutoCertPanelProps) {
    const collapseItems: CollapseProps["items"] = [
        {
            key: "1",
            label: "Text fields",
            children: (
                <AutoCertTextTool
                    selectedAnnotateId={selectedAnnotateId}
                    textAnnotates={textAnnotates}
                    currentPdfPage={currentPdfPage}
                    tableColumns={tableColumns}
                    onAddTextField={onAddTextField}
                    onUpdateTextField={onUpdateTextField}
                    onDeleteTextField={onDeleteTextField}
                    onAnnotateSelect={onAnnotateSelect}
                />
            ),
            // extra: <PlusOutlined onClick={addTextField} />,
        },
        {
            key: "2",
            label: "Signatories",
            children: (
                <AutoCertSignatoryTool
                    onAddSignatureField={onAddSignatureField}
                    selectedAnnotateId={selectedAnnotateId}
                />
            ),
            // extra: <PlusOutlined onClick={addSignatureField} />,
        },
    ];

    return (
        <div className="w-96">
            <Title level={3}>Tools</Title>
            <Collapse items={collapseItems} />
        </div>
    );
}
