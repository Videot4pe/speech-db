import type { SpeakerDto } from "../models/speaker";

import BaseCrud from "./client/base-crud";

export default BaseCrud<SpeakerDto, SpeakerDto>("speakers");
