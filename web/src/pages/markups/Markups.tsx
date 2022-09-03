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
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

const Markups = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeId, setActiveId] = useState<undefined | number>(undefined);
  const errorHandler = useErrorHandler();
  const { queryParams, setPage, setLimit } = useTablePagination();
  const { sortParams, setSortParams } = useTableSort();
  const { filterParams, arrayFilterParams, setFilterParams } = useTableFilter();
  const { data, meta, isLoading, fetch } = useTableData<MarkupDto>(
    MarkupsApi.list,
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
    window.location.href = `/markup/${id}`;
  };

  const columns = tableColumns(onRemove, onEdit);

  const onSave = () => {
    onClose();
    fetch();
    setActiveId(undefined);
  };

  return (
    <Box as="section" py="12">
      <Box maxW={{ base: "xl", md: "7xl" }} mx="auto">
        <Box overflowX="auto">
          <Heading size="lg" mb="2">
            <div>Markups</div>
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
        <Markup
          isOpen={isOpen}
          activeId={activeId}
          onClose={onClose}
          onMarkupSave={onSave}
        />
      )}
    </Box>
  );
};

export default Markups;
