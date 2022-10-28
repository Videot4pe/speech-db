import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Center, IconButton } from "@chakra-ui/react";
import moment from "moment";

import type { RecordDto } from "../../models/record";
import { MarkupDto } from "../../models/markup";

const recordsTableColumns = (
  onRemove: (id: number) => void,
  onEdit: (id: number) => void
) => {
  const columns: any[] = [
    {
      Header: "ID",
      accessor: "id",
      name: "records.id",
      sortable: true,
      filter: true,
      width: "80px",
    },
    {
      Header: "Статус",
      name: "status",
      accessor: (row: MarkupDto) => (row.image ? "Готово" : "В процессе"),
      filter: false,
      width: "90px",
    },
    {
      Header: "Название",
      accessor: "name",
      name: "records.name",
      sortable: true,
      filter: true,
    },
    {
      Header: "Диктор",
      accessor: "speaker",
      name: "speakers.name",
      sortable: true,
      filter: true,
    },
    {
      Header: "Дата создания",
      name: "records.created_at",
      sortable: true,
      filter: true,
      accessor: (row: RecordDto) =>
        moment(row.createdAt).local().format("DD.MM.YYYY hh:mm:ss"),
    },
  ];
  return columns;
};

export default recordsTableColumns;
