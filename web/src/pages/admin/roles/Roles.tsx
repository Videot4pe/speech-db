import {
  Box,
  Center,
  Heading,
  IconButton,
  Td,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState } from "react";

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
import TablePageLayout from "../../../layout/TablePageLayout";
import StyledTableHeader from "../../../components/table/StyledTableHeader";

const Roles = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeId, setActiveId] = useState<undefined | number>(undefined);
  const errorHandler = useErrorHandler();
  const { queryParams, setPage, setLimit } = useTablePagination();
  const { sortParams, setSortParams } = useTableSort();
  const { filterParams, arrayFilterParams, setFilterParams } = useTableFilter();
  const { data, meta, refetch, tableQuery } = useTableData<RoleDto>(
    RolesApi.roles.list,
    queryParams,
    arrayFilterParams,
    sortParams,
    "roles"
  );

  const onRemove = (id: number) => {
    RolesApi.roles
      .remove(id)
      .then(() => refetch())
      .catch(errorHandler);
  };

  const onEdit = (id: number) => {
    setActiveId(id);
    onOpen();
  };

  const columns = tableColumns(onRemove, onEdit);

  const onUserSave = () => {
    onClose();
    refetch();
    setActiveId(undefined);
  };

  return (
    <TablePageLayout>
      {/*<StyledTableHeader title="Роли" />*/}
      <StyledTable
        columns={columns}
        data={data}
        isLoading={tableQuery.isLoading}
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
                isLoading={tableQuery.isLoading}
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
    </TablePageLayout>
  );
};

export default Roles;
