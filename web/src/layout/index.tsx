import { Box, Spacer, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

import Header from "./Header";
import { useSse } from "../hooks/use-sse";
import Footer from "./Footer";

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
      <VStack padding="8" minHeight="100vh">
        <Header />
        <Box width="full" as="main" marginY={22} height="100%">
          {children}
        </Box>
        {/*<Spacer />*/}
        {/*<Footer />*/}
      </VStack>
    </Box>
  );
};

export default Layout;
