import { Permission } from "../models/common";

const dict: Record<string, string> = {
  [Permission.UPDATE_RECORDS]: "Изменять свои записи",
  [Permission.UPDATE_MARKUPS]: "Изменять свои разметки",
  [Permission.UPDATE_USERS]: "Изменять пользователей",
  [Permission.UPDATE_SPEAKERS]: "Изменять своих дикторов",
  
  // Ударения
  'None': 'Нет',
  'Primary': 'Основное',
  'Secondary': 'Вторичное',

  // Типы сущностей
  'Allophone': 'Фонема',
  'Word': 'Слово',
  'Sentence': 'Предложение',
  'All': 'Любой',

  // Роли
  'readonly': 'READ-ONLY',
  'student': 'Студент',
  'admin': 'Администратор',
};

export const translate = (value: string) => {
  return dict[value] || value;
};
