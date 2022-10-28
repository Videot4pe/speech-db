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
      Header: "ID",
      accessor: "id",
      name: "id",
      width: 50,
    },
    {
      Header: "Имя",
      accessor: "name",
      name: "name",
      filter: true,
    },
    {
      Header: "Свойства",
      accessor: (row: SpeakerDto) =>
        Object.entries(row.properties).map(
          (entry) => `${entry[0]}: ${entry[1]}`
        ),
      name: "properties",
    },
    {
      Header: "Дата создания",
      name: "createdAt",
      accessor: (row: SpeakerDto) =>
        moment(row.createdAt).local().format("DD.MM.YYYY hh:mm:ss"),
      filter: true,
    },
    {
      Header: " ",
      width: "42px",
      // TODO fix data type
      Cell: (data: any) => {
        return (
          <IconButton
            aria-label="edit"
            icon={<EditIcon />}
            onClick={() => onEdit(data.row.original.id)}
          />
        );
      },
    },
  ];
  return columns;
};

export default speakersTableColumns;
