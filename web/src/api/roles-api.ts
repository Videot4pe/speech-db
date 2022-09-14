import { ApiClient } from "./client/api-client";

const client = new ApiClient("roles");

export default {
  list: () =>
    client.get<{ id: number; name: string; permissions: number[] }[]>(""),
  permissions: () => client.get<{ id: number; name: string }[]>("/permissions"),
};
