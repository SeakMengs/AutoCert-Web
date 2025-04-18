import { headerStyle, BarSize } from "@/app/dashboard/layout_client";
import { Flex, theme, Typography } from "antd";

const { Title } = Typography;

export interface BuilderHeaderProps {
  title: string;
}

export default function Header({title}: BuilderHeaderProps) {
    const {
      token: { colorSplit, colorBgContainer },
    } = theme.useToken();
  
    return (
      <header
        style={{
          ...headerStyle,
          padding: 0,
          background: colorBgContainer,
          height: BarSize,
          borderBottom: `1px solid ${colorSplit}`,
        }}
      >
        <Flex className="w-full h-full p-2" align="center">
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
        </Flex>
      </header>
    );
  }