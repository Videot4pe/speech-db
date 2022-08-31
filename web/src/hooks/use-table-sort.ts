import { debounce } from "lodash";
import { useState } from "react";

export interface ReactTableSort {
  desc: boolean;
  id: string;
}

export interface TableSort {
  order: string;
  column: string;
}

export const useTableSort = (initialSort: TableSort[] = []) => {
  const [sortParams, setSort] = useState<TableSort[]>(initialSort);

  const setSortParams = debounce((params: ReactTableSort[]) => {
    if (params.length === sortParams.length && params.length === 0) {
      return;
    }
    setSort(
      params.map((param) => ({
        column: param.id,
        order: param.desc ? "DESC" : "ASC",
      }))
    );
  }, 300);

  return {
    sortParams,
    setSortParams,
  };
};
