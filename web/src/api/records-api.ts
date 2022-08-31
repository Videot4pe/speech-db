import type { NewRecordDto, RecordDto } from "../models/record";

import BaseCrud from "./client/base-crud";

export default BaseCrud<RecordDto, NewRecordDto>("records");
