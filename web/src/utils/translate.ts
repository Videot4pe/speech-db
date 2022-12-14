import { Permission } from "../models/common";

const dict: Record<string, string> = {
  [Permission.EDIT_RECORDS]: "Edit records",
  [Permission.EDIT_MARKUPS]: "Edit markups",
  [Permission.EDIT_USERS]: "Edit users",
  [Permission.EDIT_SPEAKERS]: "Edit speakers",
  
  // Ударения
  'None': 'Нет',
  'Primary': 'Основное',
  'Secondary': 'Вторичное',

  // Типы сущностей
  'Allophone': 'Фонема',
  'Word': 'Слово',
  'Sentence': 'Предложение',
  'All': 'Любой',
};

export const translate = (value: string) => {
  return dict[value] || value;
};
