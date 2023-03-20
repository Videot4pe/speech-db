import { EditIcon } from "@chakra-ui/icons";
import { Avatar, Center, IconButton } from "@chakra-ui/react";
import { AiOutlineUser } from "react-icons/ai";
import { UserDto } from "../../../models/user";
import { useAtom } from "jotai";
import { rolesAtom } from "../../../store";

const usersTableColumns = (
  onRemove: (id: number) => void,
  onEdit: (id: number) => void
) => {
  const [roles] = useAtom(rolesAtom);
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
      Header: "Email",
      accessor: "email",
      name: "email",
      sortable: true,
      filter: true,
    },
    {
      Header: "Роль",
      accessor: (row: UserDto) =>
        roles.find((role) => role.id === row.role)?.name,
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
