import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Avatar, Center, IconButton } from "@chakra-ui/react";
import moment from "moment";
import { AiOutlineUser } from "react-icons/ai";
import type { Column } from "react-table";

import type { SmerDto } from "../../models/smer";
import type { User } from "../../models/user";

const usersTableColumns = (
  onRemove: (id: number) => void,
  onEdit: (id: number) => void
) => {
  const columns: Column[] = [
    {
      Header: "Ava",
      width: "48px",
      Cell: (data: any) => {
        return (
          <Avatar
            src={data.row.original.avatar}
            icon={<AiOutlineUser fontSize="1.5rem" />}
          />
        );
      },
    },
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
