import type { MarkupDto, NewMarkupDto } from "../models/markup";

import BaseCrud from "./client/base-crud";

export default BaseCrud<MarkupDto, NewMarkupDto>("markups");
