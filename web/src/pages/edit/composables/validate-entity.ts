import { AllophoneProperties, EntityDto, SentenceProperties, WordProperties } from "models/markup";

function validateAllophone(properties: AllophoneProperties) {
  if (!properties.stressId) {
    return 'Необходимо выбрать "Ударение"';
  }
  return '';
}

function validateWord(properties: WordProperties) {
  if (!properties.languageId) {
    return 'Необходимо выбрать "Язык"';
  }
  return '';
}

function validateSentence(properties: SentenceProperties) {
  return '';
}

export function validate(entity: EntityDto): string {
  if (!entity.type) {
    return 'Не указан тип сущности'
  }
  if (!entity.value) {
    return 'Необходимо заполнить поле "Значение"';
  }

  switch (entity.type) {
    case 'Allophone': {
      return validateAllophone(entity.properties as AllophoneProperties);
    }
    case 'Word': {
      return validateWord(entity.properties as WordProperties);
    }
    case 'Sentence': {
      return validateSentence(entity.properties as SentenceProperties);
    }
  }
}