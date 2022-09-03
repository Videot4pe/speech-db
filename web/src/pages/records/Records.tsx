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

import RecordsApi from "../../api/records-api";
import SmersApi from "../../api/smers-api";
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

const Smers = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeId, setActiveId] = useState<undefined | number>(undefined);
  const errorHandler = useErrorHandler();
  const { queryParams, setPage, setLimit } = useTablePagination();
  const { sortParams, setSortParams } = useTableSort();
  const { filterParams, arrayFilterParams, setFilterParams } = useTableFilter();
  const { data, meta, isLoading, fetch } = useTableData<RecordDto>(
    RecordsApi.list,
    queryParams,
    arrayFilterParams,
    sortParams
  );

  const onRemove = (id: number) => {
    RecordsApi.remove(id)
      .then(() => fetch)
      .catch(errorHandler);
  };

  const onEdit = (id: number) => {
    setActiveId(id);
    onOpen();
  };

  const columns = recordsTableColumns(onRemove, onEdit);

  const onRecordSave = () => {
    onClose();
    fetch();
    setActiveId(undefined);
  };

  return (
    <Box as="section" py="12">
      <Box maxW={{ base: "xl", md: "7xl" }} mx="auto">
        <Box overflowX="auto">
          <Heading size="lg" mb="2">
            <div>Records</div>
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
      {isOpen && (
        <Record
          isOpen={isOpen}
          activeId={activeId}
          onClose={onClose}
          onRecordSave={onRecordSave}
        />
      )}
    </Box>
  );
};

export default Smers;
