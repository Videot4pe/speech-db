import { Box, Heading, useDisclosure } from "@chakra-ui/react";
import React, { useState } from "react";

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
import TablePageLayout from "../../../layout/TablePageLayout";
import StyledTableHeader from "../../../components/table/StyledTableHeader";

const Users = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeId, setActiveId] = useState<undefined | number>(undefined);
  const errorHandler = useErrorHandler();
  const { queryParams, setPage, setLimit } = useTablePagination();
  const { sortParams, setSortParams } = useTableSort();
  const { filterParams, arrayFilterParams, setFilterParams } = useTableFilter();
  const { data, meta, refetch, tableQuery } = useTableData<UserDto>(
    UsersApi.list,
    queryParams,
    arrayFilterParams,
    sortParams,
    "users"
  );

  const onRemove = (id: number) => {
    UsersApi.remove(id)
      .then(() => refetch())
      .catch(errorHandler);
  };

  const onEdit = (id: number) => {
    setActiveId(id);
    onOpen();
  };

  const columns = usersTableColumns(onRemove, onEdit);

  const onUserSave = () => {
    onClose();
    refetch();
    setActiveId(undefined);
  };

  return (
    <TablePageLayout>
      {/*<StyledTableHeader title="Пользователи" />*/}
      <StyledTable
        columns={columns}
        data={data}
        isLoading={tableQuery.isLoading}
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
      {isOpen && (
        <User
          isOpen={isOpen}
          activeId={activeId}
          onClose={onClose}
          onUserSave={onUserSave}
        />
      )}
    </TablePageLayout>
  );
};

export default Users;
