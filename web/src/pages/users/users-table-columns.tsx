import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Avatar, Center, IconButton } from "@chakra-ui/react";
import { AiOutlineUser } from "react-icons/ai";

const usersTableColumns = (
  onRemove: (id: number) => void,
  onEdit: (id: number) => void
) => {
  const columns: any[] = [
    {
      Header: "Ava",
      width: "48px",
      Cell: (data: any) => {
        const { avatar } = data.row.original;
        return (
          <Avatar src={avatar} icon={<AiOutlineUser fontSize="1.5rem" />} />
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
        const { id } = data.row.original;
        return (
          <Center display="flex">
            <IconButton
              aria-label="edit"
              icon={<EditIcon />}
              onClick={() => onEdit(id)}
            />
            <IconButton
              ml={2}
              aria-label="remove"
              icon={<DeleteIcon />}
              onClick={() => onRemove(id)}
            />
          </Center>
        );
      },
    },
  ];
  return columns;
};

export default usersTableColumns;
