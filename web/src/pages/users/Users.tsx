import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Center,
  Heading,
  IconButton,
  Td,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";

import UsersApi from "../../api/users-api";
import StyledTable from "../../components/table/StyledTable";
import StyledTablePagination from "../../components/table/StyledTablePagination";
import { useTableData } from "../../hooks/use-table-data";
import { useTableFilter } from "../../hooks/use-table-filter";
import { useTablePagination } from "../../hooks/use-table-pagination";
import { useTableSort } from "../../hooks/use-table-sort";
import type { SpeakerDto } from "../../models/speaker";
import { useErrorHandler } from "../../utils/handle-get-error";

import usersTableColumns from "./users-table-columns";
import { User } from "../../models/user";

const Users = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeUserId, setActiveUserId] = useState<undefined | number>(
    undefined
  );
  const errorHandler = useErrorHandler();
  const { queryParams, setPage, setLimit } = useTablePagination();
  const { sortParams, setSortParams } = useTableSort();
  const { filterParams, arrayFilterParams, setFilterParams } = useTableFilter();
  const { data, meta, isLoading, fetch } = useTableData<User>(
    UsersApi.list,
    queryParams,
    arrayFilterParams,
    sortParams
  );

  const onRemove = (id: number) => {
    UsersApi.remove(id)
      .then(() => fetch)
      .catch(errorHandler);
  };

  const onEdit = (id: number) => {
    setActiveUserId(id);
    onOpen();
  };

  const columns = usersTableColumns(onRemove, onEdit);

  const onUserSave = () => {
    onClose();
    fetch();
    setActiveUserId(undefined);
  };

  return (
    <Box as="section" py="12">
      <Box maxW={{ base: "xl", md: "7xl" }} mx="auto">
        <Box overflowX="auto">
          <Heading size="lg" mb="2">
            <div>Users</div>
          </Heading>
          <StyledTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            filterParams={filterParams}
            setSortParams={setSortParams}
            setFilterParams={setFilterParams}
          >
            <Tr>
              <Td colSpan={columns.length} p={2}>
                <Center minW="100%">
                  <IconButton
                    icon={<AddIcon />}
                    aria-label="add user"
                    isLoading={isLoading}
                    onClick={onOpen}
                  />
                </Center>
              </Td>
            </Tr>
          </StyledTable>
          <StyledTablePagination
            my={4}
            meta={meta}
            queryParams={queryParams}
            setPage={setPage}
            setLimit={setLimit}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Users;
