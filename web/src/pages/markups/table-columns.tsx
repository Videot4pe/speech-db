import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Center, IconButton } from "@chakra-ui/react";
import moment from "moment";
import type { Column } from "react-table";

import type { MarkupDto } from "../../models/markup";
import type { SmerDto } from "../../models/smer";
import type { SpeakerDto } from "../../models/speaker";

const tableColumns = (
  onRemove: (id: number) => void,
  onEdit: (id: number) => void
) => {
  const columns: Column[] = [
    {
      Header: "Id",
      accessor: "id",
      name: "id",
      width: 50,
    },
    {
      Header: "Record",
      accessor: "record",
      name: "record",
      width: 50,
    },
    {
      Header: "Created at",
      // TODO FIX
      name: "m.created_at",
      accessor: (row: MarkupDto) =>
        moment(row.createdAt).local().format("DD.MM.YYYY hh:mm:ss"),
      filter: false,
    },
    {
      Header: "Created by",
      name: "createdBy",
      accessor: "createdBy",
      // TODO fix
      filter: false,
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

export default tableColumns;
