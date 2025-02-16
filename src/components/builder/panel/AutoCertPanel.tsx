import { Button, Flex, Space } from "antd";
import { EditOutlined, SignatureOutlined } from "@ant-design/icons";

export interface PanelProps {
    addSignatureField: () => void;
    addTextField: () => void;
}

export default function Panel({ addSignatureField, addTextField }: PanelProps) {
    return (
        <div>
            <ToolPanel
                addSignatureField={addSignatureField}
                addTextField={addTextField}
            />
        </div>
    );
}

interface ToolPanelProps
    extends Pick<PanelProps, "addSignatureField" | "addTextField"> {}

function ToolPanel({ addSignatureField, addTextField }: ToolPanelProps) {
    return (
        <Flex>
            <Space direction="horizontal" style={{ width: "100%" }}>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    size="large"
                    style={{ width: "100%" }}
                    onClick={() => addTextField()}
                >
                    Add Text Field
                </Button>
                <Button
                    type="default"
                    icon={<SignatureOutlined />}
                    size="large"
                    style={{ width: "100%" }}
                    onClick={() => addSignatureField()}
                >
                    Add Signature Field
                </Button>
            </Space>
        </Flex>
    );
}
