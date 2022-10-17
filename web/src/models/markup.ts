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
