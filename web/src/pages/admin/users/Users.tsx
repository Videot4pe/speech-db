import { Box, Heading, useDisclosure } from "@chakra-ui/react";
import { useState } from "react";

import UsersApi from "../../../api/users-api";
import StyledTable from "../../../components/table/StyledTable";
import StyledTablePagination from "../../../components/table/StyledTablePagination";
import { useTableData } from "../../../hooks/use-table-data";
import { useTableFilter } from "../../../hooks/use-table-filter";
import { useTablePagination } from "../../../hooks/use-table-pagination";
import { useTableSort } from "../../../hooks/use-table-sort";
import type { UserDto } from "../../../models/user";
import { useErrorHandler } from "../../../utils/handle-get-error";

import usersTableColumns from "./users-table-columns";
import Record from "../../records/components/Record";
import User from "./components/User";

const Users = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeId, setActiveId] = useState<undefined | number>(undefined);
  const errorHandler = useErrorHandler();
  const { queryParams, setPage, setLimit } = useTablePagination();
  const { sortParams, setSortParams } = useTableSort();
  const { filterParams, arrayFilterParams, setFilterParams } = useTableFilter();
  const { data, meta, isLoading, fetch } = useTableData<UserDto>(
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
    setActiveId(id);
    onOpen();
  };

  const columns = usersTableColumns(onRemove, onEdit);

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
            <div>Users</div>
          </Heading>
          <StyledTable
            columns={columns}
            data={data}
            isLoading={isLoading}
            filterParams={filterParams}
            setSortParams={setSortParams}
            setFilterParams={setFilterParams}
          />
          <StyledTablePagination
            my={4}
            meta={meta}
            queryParams={queryParams}
            setPage={setPage}
            setLimit={setLimit}
          />
        </Box>
      </Box>
      {isOpen && (
        <User
          isOpen={isOpen}
          activeId={activeId}
          onClose={onClose}
          onUserSave={onUserSave}
        />
      )}
    </Box>
  );
};

export default Users;
