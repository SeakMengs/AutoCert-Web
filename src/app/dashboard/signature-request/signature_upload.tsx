import FormErrorMessages from "@/components/error/FormErrorMessages";
import FetchLoading from "@/components/loading/FetchLoading";
import { App, Space, Upload, UploadFile, UploadProps } from "antd";
import { UploadChangeParam } from "antd/es/upload";
import { ALLOWED_SIG_FILE_TYPES } from "./schema";
import { SharedSignatureModalProps } from "./signature_section";
import { UploadOutlined } from "@ant-design/icons";

interface SignatureUploadProps extends SharedSignatureModalProps {}

export default function SignatureUpload({
  onSignatureSave,
  addSignatureState,
}: SignatureUploadProps) {
  const { message } = App.useApp();

  const handleSignatureUpload = async (
    info: UploadChangeParam<UploadFile>,
  ): Promise<void> => {
    switch (info.file.status) {
      case "done":
        // since this will never call cuz the beforeUpload is set to false
        break;
      case "removed":
        message.success(`${info.file.name} file (client) removed successfully`);
        break;
      case "error":
        message.error(`${info.file.name} file (client) upload failed.`);
        break;
    }
  };

  // antd will call handleBeforeFileUpload when the file is selected
  const handleBeforeFileUpload: UploadProps["beforeUpload"] = async (file) => {
    if (!file) {
      message.error("Failed to upload signature");
      return;
    }

    await onSignatureSave(file);

    // if return true, antd will upload to the server which is not what we want
    return false;
  };

  return (
    <Space direction="vertical" className="w-full h-full">
      <Upload.Dragger
        name="file"
        accept={ALLOWED_SIG_FILE_TYPES.map(
          (type) => `.${type.split("/")[1].replace("+xml", "")}`,
        ).join(",")}
        onChange={handleSignatureUpload}
        beforeUpload={handleBeforeFileUpload}
        showUploadList={false}
        multiple={false}
        maxCount={1}
        disabled={addSignatureState.loading}
      >
        <FetchLoading spinning={addSignatureState.loading}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
        </FetchLoading>
      </Upload.Dragger>
      {addSignatureState.error && (
        <FormErrorMessages errors={addSignatureState.error} />
      )}
    </Space>
  );
}