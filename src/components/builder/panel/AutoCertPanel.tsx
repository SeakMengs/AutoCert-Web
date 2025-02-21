import { Button, Collapse, CollapseProps, Flex, Space, Typography } from "antd";
import {
    EditOutlined,
    PlusOutlined,
    SignatureOutlined,
} from "@ant-design/icons";
import AutoCertTextTool from "./tool/text/AutoCertTextTool";
import AutoCertSignatoryTool from "./tool/signatory/AutoCertSignatoryTool";
import { AutoCertTableColumn, AutoCertTableRow } from "./AutoCertTable";
import { TextAnnotateState } from "../hooks/useAutoCert";

export interface AutoCertPanelProps {
    textAnnotates: TextAnnotateState[];
    tableColumns: AutoCertTableColumn[];
    addSignatureField: () => void;
    addTextField: () => void;
}

const { Title } = Typography;

export default function AutoCertPanel({
    tableColumns,
    textAnnotates,
    addSignatureField,
    addTextField,
}: AutoCertPanelProps) {
    const collapseItems: CollapseProps["items"] = [
        {
            key: "1",
            label: "Text fields",
            children: (
                <AutoCertTextTool
                    textAnnotates={textAnnotates}
                    addTextField={addTextField}
                    tableColumns={tableColumns}
                />
            ),
            // extra: <PlusOutlined onClick={addTextField} />,
        },
        {
            key: "2",
            label: "Signatories",
            children: <AutoCertSignatoryTool />,
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
