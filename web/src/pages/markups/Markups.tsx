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
import React, { useState } from "react";

import MarkupsApi from "../../api/markups-api";
import RecordsApi from "../../api/records-api";
import StyledTable from "../../components/table/StyledTable";
import StyledTablePagination from "../../components/table/StyledTablePagination";
import { useTableData } from "../../hooks/use-table-data";
import { useTableFilter } from "../../hooks/use-table-filter";
import { useTablePagination } from "../../hooks/use-table-pagination";
import { useTableSort } from "../../hooks/use-table-sort";
import type { MarkupDto } from "../../models/markup";
import { useErrorHandler } from "../../utils/handle-get-error";

import Markup from "./components/Markup";
import tableColumns from "./table-columns";
import TablePageLayout from "../../layout/TablePageLayout";
import StyledTableHeader from "../../components/table/StyledTableHeader";

const Markups = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeId, setActiveId] = useState<undefined | number>(undefined);
  const errorHandler = useErrorHandler();
  const { queryParams, setPage, setLimit } = useTablePagination();
  const { sortParams, setSortParams } = useTableSort();
  const { filterParams, arrayFilterParams, setFilterParams } = useTableFilter();
  const { data, meta, refetch, tableQuery } = useTableData<MarkupDto>(
    MarkupsApi.list,
    queryParams,
    arrayFilterParams,
    sortParams,
    "markups"
  );

  const onRemove = (id: number) => {
    RecordsApi.remove(id)
      .then(() => refetch())
      .catch(errorHandler);
  };

  const onEdit = (id: number) => {
    window.location.href = `/markup/${id}`;
  };

  const columns = tableColumns(onRemove, onEdit);

  const onSave = () => {
    onClose();
    refetch();
    setActiveId(undefined);
  };

  return (
    <TablePageLayout>
      <StyledTableHeader
        title="Markups"
        onOpen={onOpen}
        isLoading={tableQuery.isLoading}
      />
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
      {isOpen && (
        <Markup
          isOpen={isOpen}
          activeId={activeId}
          onClose={onClose}
          onMarkupSave={onSave}
        />
      )}
    </TablePageLayout>
  );
};

export default Markups;
