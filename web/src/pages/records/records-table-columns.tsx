import { RepeatIcon } from "@chakra-ui/icons";
import { Center, Flex, IconButton } from "@chakra-ui/react";
import moment from "moment";

import type { RecordDto } from "../../models/record";
import { MarkupDto } from "../../models/markup";

const recordsTableColumns = (
  onRemove: (id: number) => void,
  onRegenerate: (id: number) => void
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
      width: "90px",
      filter: false,
      Cell: (data: any) => {
        const { original } = data.row;
        if (original.image) {
          return <div>Готово</div>;
        } else {
          return (
            <Flex justify="space-between">
              <Center>В процессе</Center>
              <IconButton
                aria-label="regenerate"
                icon={<RepeatIcon />}
                ml={4}
                size="xs"
                onClick={() => onRegenerate(original.id)}
              />
            </Flex>
          );
        }
      },
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
