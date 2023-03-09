import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

interface TablePageLayoutProps {
  children?: ReactNode;
}

const TablePageLayout = ({ children }: TablePageLayoutProps) => {
  // @ts-ignore
  return (
    <Box as="section" mr={2}>
      <Box maxW={{ base: "xl", md: "7xl" }} mx="auto">
        <Box overflowX="auto">{children}</Box>
      </Box>
    </Box>
  );
};

export default TablePageLayout;
