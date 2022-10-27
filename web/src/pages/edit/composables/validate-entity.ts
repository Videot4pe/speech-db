import { EntityDto } from "models/markup";

export function validate(entity: EntityDto): string {
  if (!entity.value) {
    return 'Необходимо заполнить поле "Значение"';
  }

  return '';
}