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
  id?: number;
  markupId: number;
  value: string;
  beginTime: number;
  endTime: number;
}
