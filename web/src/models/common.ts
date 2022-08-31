export interface ItemValue {
  label: string;
  value: number;
}

export enum Permission {
  EDIT_SPEAKERS = "EDIT_SPEAKERS",
  EDIT_MARKUPS = "EDIT_MARKUPS",
  EDIT_RECORDS = "EDIT_RECORDS",
  EDIT_USERS = "EDIT_USERS",
}
