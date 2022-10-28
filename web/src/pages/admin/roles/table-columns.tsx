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
      Header: "ID",
      accessor: "id",
      name: "id",
      sortable: true,
    },
    {
      Header: "Название",
      accessor: "name",
      name: "roles.name",
      sortable: true,
      filter: true,
    },
    {
      Header: "Права",
      accessor: (row: RoleDto) => (
        <pre>
          {row.permissions
            .map((permission: string) => translate(permission))
            .join("\n")}
        </pre>
      ),
      name: "permissions",
    },
  ];
  return columns;
};

export default tableColumns;
