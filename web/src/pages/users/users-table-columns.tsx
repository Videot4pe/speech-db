import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Center, IconButton } from "@chakra-ui/react";
import moment from "moment";
import type { Column } from "react-table";

import type { SmerDto } from "../../models/smer";
import type { User } from "../../models/user";

const usersTableColumns = (
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
      Header: "Surname",
      accessor: "surname",
      name: "surname",
      filter: true,
    },
    {
      Header: "Email",
      accessor: "email",
      name: "email",
      filter: true,
    },
    {
      Header: "Created at",
      name: "createdAt",
      accessor: (row: User) =>
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

export default usersTableColumns;
