export interface SpeakerDto {
  id?: number;
  name: string;
  properties: Record<string, string | number>;
  createdAt?: string;
}
