import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Center, IconButton } from "@chakra-ui/react";
import moment from "moment";
import type { Column } from "react-table";

import type { RecordDto } from "../../models/record";

const recordsTableColumns = (
  onRemove: (id: number) => void,
  onEdit: (id: number) => void
) => {
  const columns: Column[] = [
    {
      Header: "Id",
      accessor: "id",
      name: "id",
    },
    {
      Header: "Name",
      accessor: "name",
      name: "name",
      filter: true,
    },
    {
      Header: "Speaker",
      accessor: "speaker",
      name: "speaker",
    },
    {
      Header: "Created at",
      name: "createdAt",
      accessor: (row: RecordDto) =>
        moment(row.createdAt).local().format("DD.MM.YYYY hh:mm:ss"),
      filter: true,
    },
    {
      Header: "Actions",
      // TODO fix data type
      Cell: (data: any) => {
        return (
          <Center display="flex">
            <IconButton
              aria-label="edit"
              icon={<EditIcon />}
              onClick={() => onEdit(data.row.original.id)}
            />
            <IconButton
              ml={2}
              aria-label="remove"
              icon={<DeleteIcon />}
              onClick={() => onRemove(data.row.original.id)}
            />
          </Center>
        );
      },
    },
  ];
  return columns;
};

export default recordsTableColumns;
