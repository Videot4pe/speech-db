import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  IconButton,
  Td,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState } from "react";

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
import TablePageLayout from "../../layout/TablePageLayout";
import StyledTableHeader from "../../components/table/StyledTableHeader";

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
    <TablePageLayout>
      <StyledTableHeader
        title="Дикторы"
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
        <Speaker
          isOpen={isOpen}
          activeSpeakerId={activeSpeakerId}
          onClose={onClose}
          onSpeakerSave={onSpeakerSave}
        />
      )}
    </TablePageLayout>
  );
};

export default Speakers;
