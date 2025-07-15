import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

type FetchLoadingProps = React.ComponentProps<typeof Spin> & {};

export default function FetchLoading({ ...props }: FetchLoadingProps) {
  return <Spin indicator={<LoadingOutlined spin />} size="large" {...props} />;
}
