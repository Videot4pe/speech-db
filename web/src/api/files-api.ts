import axios from "axios";

export default {
  file: (path: string) => axios.get<File>(path),
};
