import { ApiClient } from "./client/api-client";
import { RoleDto } from "../models/role";
import BaseCrud from "./client/base-crud";

const client = new ApiClient("roles");

export default {
  roles: BaseCrud<RoleDto, RoleDto>("roles"),
  permissions: () => client.get<{ id: number; name: string }[]>("/permissions"),
};
