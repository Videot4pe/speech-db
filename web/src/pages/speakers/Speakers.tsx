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

import SpeakersApi from "../../api/speakers-api";
import StyledTable from "../../components/table/StyledTable";
import StyledTablePagination from "../../components/table/StyledTablePagination";
import { useTableData } from "../../hooks/use-table-data";
import { useTableFilter } from "../../hooks/use-table-filter";
import { useTablePagination } from "../../hooks/use-table-pagination";
import { useTableSort } from "../../hooks/use-table-sort";
import type { SpeakerDto } from "../../models/speaker";
import { useErrorHandler } from "../../utils/handle-get-error";

import Speaker from "./components/Speaker";
import speakersTableColumns from "./speakers-table-columns";

const Speakers = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeSpeakerId, setActiveSpeakerId] = useState<undefined | number>(
    undefined
  );
  const errorHandler = useErrorHandler();
  const { queryParams, setPage, setLimit } = useTablePagination();
  const { sortParams, setSortParams } = useTableSort();
  const { filterParams, arrayFilterParams, setFilterParams } = useTableFilter();
  const { data, meta, refetch, tableQuery } = useTableData<SpeakerDto>(
    SpeakersApi.list,
    queryParams,
    arrayFilterParams,
    sortParams,
    "speakers"
  );

  const onRemove = (id: number) => {
    SpeakersApi.remove(id)
      .then(() => refetch())
      .catch(errorHandler);
  };

  const onEdit = (id: number) => {
    setActiveSpeakerId(id);
    onOpen();
  };

  const columns = speakersTableColumns(onRemove, onEdit);

  const onSpeakerSave = async () => {
    onClose();
    await refetch();
    setActiveSpeakerId(undefined);
  };

  return (
    <Box as="section" py="12">
      <Box maxW={{ base: "xl", md: "7xl" }} mx="auto">
        <Box overflowX="auto">
          <Heading size="lg" mb="2">
            <div>Speakers</div>
          </Heading>
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
                    aria-label="add speaker"
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
        </Box>
      </Box>
      {isOpen && (
        <Speaker
          isOpen={isOpen}
          activeSpeakerId={activeSpeakerId}
          onClose={onClose}
          onSpeakerSave={onSpeakerSave}
        />
      )}
    </Box>
  );
};

export default Speakers;
