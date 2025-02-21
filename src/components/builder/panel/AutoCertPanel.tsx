import { Button, Collapse, CollapseProps, Flex, Space, Typography } from "antd";
import {
    EditOutlined,
    PlusOutlined,
    SignatureOutlined,
} from "@ant-design/icons";
import AutoCertTextTool, {
    AutoCertTextToolProps,
} from "./tool/text/AutoCertTextTool";
import AutoCertSignatoryTool, {
    AutoCertSignatoryToolProps,
} from "./tool/signatory/AutoCertSignatoryTool";
import { AutoCertTableColumn, AutoCertTableRow } from "./AutoCertTable";
import { TextAnnotateState } from "../hooks/useAutoCert";

export interface AutoCertPanelProps
    extends AutoCertTextToolProps,
        AutoCertSignatoryToolProps {}

const { Title } = Typography;

export default function AutoCertPanel({
    tableColumns,
    textAnnotates,
    addSignatureField,
    selectedAnnotateId,
    currentPdfPage,
    onAnnotateSelect,
    onAddTextField,
    onUpdateTextFieldById,
    onDeleteTextFieldById,
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
                    onUpdateTextFieldById={onUpdateTextFieldById}
                    onDeleteTextFieldById={onDeleteTextFieldById}
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
                    addSignatureField={addSignatureField}
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
