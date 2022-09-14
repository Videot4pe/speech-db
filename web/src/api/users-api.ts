import { ApiClient } from "./client/api-client";
import BaseCrud from "./client/base-crud";
import { UserDto } from "../models/user";

const client = new ApiClient("users");
export default {
  ...BaseCrud<UserDto, UserDto>("users"),
  selfUpdate: (data: UserDto) => client.patch<number>("", data),
};
