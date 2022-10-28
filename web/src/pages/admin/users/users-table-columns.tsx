import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Avatar, Center, IconButton } from "@chakra-ui/react";
import { AiOutlineUser } from "react-icons/ai";

const usersTableColumns = (
  onRemove: (id: number) => void,
  onEdit: (id: number) => void
) => {
  const columns: any[] = [
    {
      Header: "Аватар",
      width: "48px",
      Cell: (data: any) => {
        const { avatar } = data.row.original;
        return (
          <Avatar src={avatar} icon={<AiOutlineUser fontSize="1.5rem" />} />
        );
      },
    },
    {
      Header: "ID",
      accessor: "id",
      name: "id",
      sortable: true,
      filter: true,
    },
    {
      Header: "Имя",
      accessor: "name",
      name: "name",
      sortable: true,
      filter: true,
    },
    {
      Header: "Фамилия",
      accessor: "surname",
      name: "surname",
      sortable: true,
      filter: true,
    },
    {
      Header: "Email",
      accessor: "email",
      name: "email",
      sortable: true,
      filter: true,
    },
    {
      Header: " ",
      width: "60px",
      Cell: (data: any) => {
        const { id } = data.row.original;
        return (
          <IconButton
            aria-label="edit"
            icon={<EditIcon />}
            onClick={() => onEdit(id)}
          />
        );
      },
    },
  ];
  return columns;
};

export default usersTableColumns;
