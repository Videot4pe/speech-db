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

export interface EntityDto {
  id?: string;
  markupId: string;
  value: string;
  beginTime: number;
  endTime: number;
}

export type CreateEntityDto = Omit<EntityDto, 'id'>