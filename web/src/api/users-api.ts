import type { User } from "../models/user";

import { ApiClient } from "./client/api-client";
import BaseCrud from "./client/base-crud";

const client = new ApiClient("users");
export default {
  ...BaseCrud<User, User>("users"),
  selfUpdate: (data: User) => client.patch<number>("", data),
};
