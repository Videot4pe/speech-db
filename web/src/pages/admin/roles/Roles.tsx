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

import UsersApi from "../../../api/users-api";
import StyledTable from "../../../components/table/StyledTable";
import StyledTablePagination from "../../../components/table/StyledTablePagination";
import { useTableData } from "../../../hooks/use-table-data";
import { useTableFilter } from "../../../hooks/use-table-filter";
import { useTablePagination } from "../../../hooks/use-table-pagination";
import { useTableSort } from "../../../hooks/use-table-sort";
import { useErrorHandler } from "../../../utils/handle-get-error";

import tableColumns from "./table-columns";
import { RoleDto } from "../../../models/role";
import RolesApi from "../../../api/roles-api";
import { AddIcon } from "@chakra-ui/icons";

const Roles = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeId, setActiveId] = useState<undefined | number>(undefined);
  const errorHandler = useErrorHandler();
  const { queryParams, setPage, setLimit } = useTablePagination();
  const { sortParams, setSortParams } = useTableSort();
  const { filterParams, arrayFilterParams, setFilterParams } = useTableFilter();
  const { data, meta, isLoading, fetch } = useTableData<RoleDto>(
    RolesApi.roles.list,
    queryParams,
    arrayFilterParams,
    sortParams
  );

  const onRemove = (id: number) => {
    RolesApi.roles
      .remove(id)
      .then(() => fetch)
      .catch(errorHandler);
  };

  const onEdit = (id: number) => {
    setActiveId(id);
    onOpen();
  };

  const columns = tableColumns(onRemove, onEdit);

  const onUserSave = () => {
    onClose();
    fetch();
    setActiveId(undefined);
  };

  return (
    <Box as="section" py="12">
      <Box maxW={{ base: "xl", md: "7xl" }} mx="auto">
        <Box overflowX="auto">
          <Heading size="lg" mb="2">
            <div>Roles</div>
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
                    aria-label="add record"
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
      {/*{isOpen && (*/}
      {/*  <User*/}
      {/*    isOpen={isOpen}*/}
      {/*    activeId={activeId}*/}
      {/*    onClose={onClose}*/}
      {/*    onUserSave={onUserSave}*/}
      {/*  />*/}
      {/*)}*/}
    </Box>
  );
};

export default Roles;
