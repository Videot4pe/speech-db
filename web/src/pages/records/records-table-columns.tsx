import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Center, IconButton } from "@chakra-ui/react";
import moment from "moment";

import type { RecordDto } from "../../models/record";

const recordsTableColumns = (
  onRemove: (id: number) => void,
  onEdit: (id: number) => void
) => {
  const columns: any[] = [
    {
      Header: "Id",
      accessor: "id",
      name: "records.id",
      sortable: true,
      filter: true,
    },
    {
      Header: "Name",
      accessor: "name",
      name: "records.name",
      sortable: true,
      filter: true,
    },
    {
      Header: "Speaker",
      accessor: "speaker",
      name: "speakers.name",
      sortable: true,
      filter: true,
    },
    {
      Header: "Created at",
      name: "records.created_at",
      sortable: true,
      filter: true,
      accessor: (row: RecordDto) =>
        moment(row.createdAt).local().format("DD.MM.YYYY hh:mm:ss"),
    },
    {
      Header: "Actions",
      // TODO fix data type
      Cell: (data: any) => {
        const { id } = data.row.original;
        return (
          <Center display="flex">
            <IconButton
              aria-label="edit"
              icon={<EditIcon />}
              onClick={() => onEdit(id)}
            />
            {/*<IconButton*/}
            {/*  ml={2}*/}
            {/*  aria-label="remove"*/}
            {/*  icon={<DeleteIcon />}*/}
            {/*  onClick={() => onRemove(id)}*/}
            {/*/>*/}
          </Center>
        );
      },
    },
  ];
  return columns;
};

export default recordsTableColumns;
