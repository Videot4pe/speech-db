import { Box, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

import Header from "./Header";
import { useSse } from "../hooks/use-sse";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const notificationsUrl = `${
    import.meta.env.VITE_SERVER_URL
  }/api/notifications`;
  useSse(notificationsUrl);

  return (
    <Box transition="0.5s ease-out">
      <VStack margin="8" minHeight="90vh">
        <Header />
        <Box width="full" as="main" marginY={22}>
          {children}
        </Box>
      </VStack>
    </Box>
  );
};

export default Layout;
