import { useDisclosure } from "@chakra-ui/react";
import TablePageLayout from "../../layout/TablePageLayout";
import React, { useState } from "react";

import RecordsApi from "../../api/records-api";
import StyledTable from "../../components/table/StyledTable";
import StyledTablePagination from "../../components/table/StyledTablePagination";
import { useTableData } from "../../hooks/use-table-data";
import { useTableFilter } from "../../hooks/use-table-filter";
import { useTablePagination } from "../../hooks/use-table-pagination";
import { useTableSort } from "../../hooks/use-table-sort";
import type { RecordDto } from "../../models/record";
import { useErrorHandler } from "../../utils/handle-get-error";
import Record from "./components/Record";
import recordsTableColumns from "./records-table-columns";
import StyledTableHeader from "../../components/table/StyledTableHeader";

const Records = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeId, setActiveId] = useState<undefined | number>(undefined);
  const errorHandler = useErrorHandler();
  const { queryParams, setPage, setLimit } = useTablePagination();
  const { sortParams, setSortParams } = useTableSort();
  const { filterParams, arrayFilterParams, setFilterParams } = useTableFilter();
  const { data, meta, refetch, tableQuery } = useTableData<RecordDto>(
    RecordsApi.list,
    queryParams,
    arrayFilterParams,
    sortParams,
    "records"
  );

  const onRemove = (id: number) => {
    RecordsApi.remove(id)
      .then(() => refetch())
      .catch(errorHandler);
  };

  const onEdit = (id: number) => {
    setActiveId(id);
    onOpen();
  };

  const columns = recordsTableColumns(onRemove, onEdit);

  const onRecordSave = async () => {
    onClose();
    await refetch();
    setActiveId(undefined);
  };

  return (
    <TablePageLayout>
      <StyledTableHeader
        title="Записи"
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
      />
      <StyledTablePagination
        my={4}
        meta={meta}
        queryParams={queryParams}
        setPage={setPage}
        setLimit={setLimit}
      />
      {isOpen && (
        <Record
          isOpen={isOpen}
          activeId={activeId}
          onClose={onClose}
          onRecordSave={onRecordSave}
        />
      )}
    </TablePageLayout>
  );
};

export default Records;
