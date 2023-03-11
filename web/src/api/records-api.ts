import type { NewRecordDto, RecordDto } from "../models/record";

import BaseCrud from "./client/base-crud";
import { ApiClient } from "./client/api-client";

const client = new ApiClient("records");

export default {
  ...BaseCrud<RecordDto, NewRecordDto>("records"),
  generate: (id: number) => client.post<number>(`/generate/${id}`),
};
