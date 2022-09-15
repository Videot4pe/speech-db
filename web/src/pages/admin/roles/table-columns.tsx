import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Avatar, Center, IconButton } from "@chakra-ui/react";
import { AiOutlineUser } from "react-icons/ai";
import { translate } from "../../../utils/translate";
import { RoleDto } from "../../../models/role";

const tableColumns = (
  onRemove: (id: number) => void,
  onEdit: (id: number) => void
) => {
  const columns: any[] = [
    {
      Header: "Id",
      accessor: "id",
      name: "id",
      sortable: true,
    },
    {
      Header: "Name",
      accessor: "name",
      name: "roles.name",
      sortable: true,
      filter: true,
    },
    {
      Header: "Permissions",
      accessor: (row: RoleDto) =>
        row.permissions
          .map((permission: string) => translate(permission))
          .join(", "),
      name: "permissions",
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

export default tableColumns;
