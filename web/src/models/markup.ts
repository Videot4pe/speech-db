export interface MarkupDto {
  id: number;
  image?: string;
  record?: string;
  createdAt: string;
}

export interface NewMarkupDto {
  id?: number;
  record?: number;
}

export type EntityType = 'Allophone' | 'Word' | 'Sentence' | undefined;

export interface AllophoneProperties {
  stressId: number;
}

export interface WordProperties {
  languageId: number;
  dialect?: string;
}

export interface SentenceProperties {
}

export interface EntityDto {
  id?: number;
  markupId: number;
  value: string;
  beginTime: number;
  endTime: number;
  type?: EntityType;
  properties?: AllophoneProperties | WordProperties | SentenceProperties;
}
export type CreateEntityDto = Omit<EntityDto, 'id'>

export interface AllophoneDto extends EntityDto {
  type: 'Allophone';
  properties: AllophoneProperties;
}

export interface WordDto extends EntityDto {
  type: 'Word';
  properties: WordProperties;
}

export interface SentenceDto extends EntityDto {
  type: 'Sentence';
  properties: SentenceProperties;
}
