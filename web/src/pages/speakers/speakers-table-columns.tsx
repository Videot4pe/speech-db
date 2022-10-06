import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Center, IconButton } from "@chakra-ui/react";
import moment from "moment";
import type { Column } from "react-table";

import type { SmerDto } from "../../models/smer";
import type { SpeakerDto } from "../../models/speaker";

const speakersTableColumns = (
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
      Header: "Name",
      accessor: "name",
      name: "name",
      filter: true,
    },
    {
      Header: "Properties",
      accessor: (row: SpeakerDto) =>
        Object.entries(row.properties).map(
          (entry) => `${entry[0]}: ${entry[1]}`
        ),
      name: "properties",
    },
    {
      Header: "Created at",
      name: "createdAt",
      accessor: (row: SpeakerDto) =>
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
            {/*<IconButton*/}
            {/*  ml={2}*/}
            {/*  aria-label="remove"*/}
            {/*  icon={<DeleteIcon />}*/}
            {/*  onClick={() => onRemove(data.row.original.id)}*/}
            {/*/>*/}
          </Center>
        );
      },
    },
  ];
  return columns;
};

export default speakersTableColumns;
