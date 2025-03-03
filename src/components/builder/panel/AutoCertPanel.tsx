import { Collapse, CollapseProps, Space, Typography } from "antd";
import AutoCertTextTool, {
    AutoCertTextToolProps,
} from "./tool/text/AutoCertTextTool";
import AutoCertSignatoryTool, {
    AutoCertSignatoryToolProps,
} from "./tool/signatory/AutoCertSignatoryTool";
import AutoCertTable, { AutoCertTableProps } from "./table/AutoCertTable";

export interface AutoCertPanelProps
    extends AutoCertTextToolProps,
        AutoCertSignatoryToolProps,
        AutoCertTableProps {}

const { Title } = Typography;

export default function AutoCertPanel({
    // Annotate
    selectedAnnotateId,
    currentPdfPage,
    textAnnotates,
    onAnnotateSelect,
    onAddTextField,
    onUpdateTextField,
    onDeleteTextField,
    onAddSignatureField,

    // Table,
    columns,
    ...autoCertTableProps
}: // rows,
// onColumnUpdate,
// onColumnAdd,
// onColumnDelete,
// onImportFromCSV,
// onRowAdd,
// onRowUpdate,
// onRowsDelete,
AutoCertPanelProps) {
    const collapseItems: CollapseProps["items"] = [
        {
            key: "1",
            label: "Text fields",
            children: (
                <AutoCertTextTool
                    selectedAnnotateId={selectedAnnotateId}
                    textAnnotates={textAnnotates}
                    currentPdfPage={currentPdfPage}
                    columns={columns}
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
        <Space direction="vertical" className="w-full">
            <Title level={5}>Tools</Title>
            <Collapse items={collapseItems} />
            <Title level={5}>Table management</Title>
            <AutoCertTable columns={columns} {...autoCertTableProps} />
        </Space>
    );
}