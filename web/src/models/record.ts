import type { SpeakerDto } from "./speaker";

export interface NewRecordDto {
  id?: number;
  name: string;
  file?: string;
  speaker?: number;
}

export interface RecordDto {
  id?: number;
  name: string;
  file?: string;
  speaker?: SpeakerDto;
}
