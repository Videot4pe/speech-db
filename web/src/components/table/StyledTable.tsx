import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
  TableContainer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  chakra,
  Input,
  InputGroup,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import React, { useEffect } from "react";
import type { Column } from "react-table";
import { useSortBy, useTable } from "react-table";

import type { InternalTableFilter } from "../../hooks/use-table-filter";
import type { ReactTableSort, TableSort } from "../../hooks/use-table-sort";

class DebouncedFunc<T> {}

interface StyledTableProps {
  columns: Column[];
  data: any[];
  isLoading: boolean;
  children?: ReactNode;
  filterParams: InternalTableFilter;
  setSortParams: DebouncedFunc<(params: ReactTableSort[]) => void>;
  setFilterParams: DebouncedFunc<(column: string, value: string) => void>;
}

const StyledTable = ({
  children,
  columns,
  data,
  isLoading,
  setSortParams,
  setFilterParams,
}: StyledTableProps) => {
  const {
    headerGroups,
    getTableProps,
    getTableBodyProps,
    prepareRow,
    rows,
    state: { sortBy },
  } = useTable(
    {
      columns,
      data,
      manualSortBy: true,
    },
    useSortBy
  );

  useEffect(() => {
    setSortParams(sortBy);
  }, [sortBy]);

  return (
    <TableContainer>
      <Table variant="striped" borderWidth={1} {...getTableProps()}>
        <Thead>
          {headerGroups.map((headerGroup) => (
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Th
                  whiteSpace="nowrap"
                  scope="col"
                  {...column.getHeaderProps(
                    column.sortable && column.getSortByToggleProps()
                  )}
                  maxWidth={column.width}
                  isNumeric={column.isNumeric}
                >
                  {column.render("Header")}
                  <chakra.span pl="4">
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <TriangleDownIcon aria-label="sorted descending" />
                      ) : (
                        <TriangleUpIcon aria-label="sorted ascending" />
                      )
                    ) : null}
                  </chakra.span>
                </Th>
              ))}
            </Tr>
          ))}
          {headerGroups.map((headerGroup) => (
            <Tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <Th px={2} py={0} key={column.Header} maxWidth={column.width}>
                  {column.filter && (
                    // TODO different types of filters (external component)
                    <InputGroup size="md" my={2}>
                      <Input
                        size="sm"
                        disabled={isLoading}
                        onChange={(e) =>
                          setFilterParams(column.name, e.target.value)
                        }
                      />
                      {/* <InputRightElement h="100%"> */}
                      {/*   <IconButton */}
                      {/*     icon={<DeleteIcon />} */}
                      {/*     aria-label="clear" */}
                      {/*     size="xs" */}
                      {/*     isLoading={isLoading} */}
                      {/*     onClick={() => */}
                      {/*       setFilterParams(column.name, undefined) */}
                      {/*     } */}
                      {/*   /> */}
                      {/* </InputRightElement> */}
                    </InputGroup>
                  )}
                </Th>
              ))}
            </Tr>
          ))}
        </Thead>
        <Tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <Tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <Td
                    {...cell.getCellProps()}
                    maxWidth={cell.column.width}
                    isNumeric={cell.column.isNumeric}
                  >
                    {cell.render("Cell")}
                  </Td>
                ))}
              </Tr>
            );
          })}
          {children}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default StyledTable;
