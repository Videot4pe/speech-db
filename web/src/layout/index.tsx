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
    <VStack transition="0.5s ease-out" padding="8" height="100vh">
      <Header />
      <Box width="full" as="main" height="100%" overflowY="scroll">
        {children}
      </Box>
      {/*<Spacer />*/}
      {/*<Footer />*/}
    </VStack>
  );
};

export default Layout;
