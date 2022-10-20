import { ApiClient } from "./client/api-client";
import { Collections } from "../models/collection";

const client = new ApiClient("collections");

export default {
  collections: () => client.get<Collections>(""),
};
