import { Box, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

import Header from "./Header";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
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
