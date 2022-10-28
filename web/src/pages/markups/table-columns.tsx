import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Center, IconButton, Link } from "@chakra-ui/react";
import moment from "moment";

import type { MarkupDto } from "../../models/markup";

const tableColumns = (
  onRemove: (id: number) => void,
  onEdit: (id: number) => void
) => {
  // TODO fix any type (!)
  const columns: any[] = [
    {
      Header: "ID",
      accessor: "id",
      name: "id",
      width: 50,
    },
    {
      Header: "Запись",
      Cell: (data: any) => {
        return (
          <Link color="teal" href={data.row.original.record} target="_blank">
            Link
          </Link>
        );
      },
    },
    {
      Header: "Дата создания",
      // TODO FIX
      name: "m.created_at",
      accessor: (row: MarkupDto) =>
        moment(row.createdAt).local().format("DD.MM.YYYY hh:mm:ss"),
      filter: false,
    },
    {
      Header: "Автор",
      name: "createdBy",
      accessor: "createdBy",
      // TODO fix
      filter: false,
    },
    {
      Header: " ",
      width: "42px",
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

export default tableColumns;
