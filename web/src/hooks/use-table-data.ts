import { useCallback, useEffect, useMemo, useState } from "react";

import type { MetaData } from "../api/client/json-api-document";
import { useErrorHandler } from "../utils/handle-get-error";

import type { TableFilter } from "./use-table-filter";
import type { TablePagination } from "./use-table-pagination";
import type { TableSort } from "./use-table-sort";
import { useQuery } from "react-query";

export interface QueryParams extends TablePagination {
  sort?: TableSort[];
  filter?: TableFilter[];
}

export const useTableData = <T>(
  repository: (queryParams: QueryParams) => Promise<MetaData<T[]>>,
  queryParams: TablePagination = {},
  filterParams: TableFilter[] = [],
  sortParams: TableSort[] = [],
  key: string = "table"
) => {
  const errorHandler = useErrorHandler();

  const tableQuery = useQuery(
    [key, queryParams, filterParams, sortParams],
    () =>
      repository({
        ...queryParams,
        filter: filterParams,
        sort: sortParams,
      }).catch(errorHandler)
  );

  const data = useMemo(() => tableQuery?.data?.data || [], [tableQuery]);
  const meta = useMemo(
    () =>
      tableQuery?.data?.meta || {
        totalItems: 0,
        totalPages: 1,
      },
    [tableQuery]
  );
  const refetch = useCallback(() => tableQuery.refetch() || [], [tableQuery]);

  return {
    data,
    meta,
    refetch,
    tableQuery,
  };
};
