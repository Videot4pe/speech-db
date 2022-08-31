import { ApiClient } from "./client/api-client";

const client = new ApiClient("roles");

export default {
  permissions: () => client.get<string[]>("/permissions"),
};
