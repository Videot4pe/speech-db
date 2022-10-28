import {
  Button,
  ButtonGroup,
  Flex,
  Heading,
  HStack,
  Select,
  Text,
  useColorModeValue as mode,
} from "@chakra-ui/react";
import React from "react";

import type { Meta } from "../../api/client/json-api-document";
import type { TablePagination } from "../../hooks/use-table-pagination";
import { AddIcon } from "@chakra-ui/icons";

interface StyledTableHeaderProps {
  title: string;
  isLoading?: boolean;
  onOpen?: () => void;
}

const StyledTableHeader = ({
  title,
  onOpen,
  isLoading = false,
}: StyledTableHeaderProps) => {
  return (
    <Flex justify="space-between" mb={2}>
      <Heading size="lg" mb="2">
        <div>{title}</div>
      </Heading>
      {onOpen && (
        <Button isLoading={isLoading} onClick={onOpen}>
          Добавить
          <AddIcon ml={4} />
        </Button>
      )}
    </Flex>
  );
};

export default StyledTableHeader;
