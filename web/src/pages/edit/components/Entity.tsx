import Card from "../../auth/components/Card";
import { Button, Flex, FormControl, Input, useToast } from "@chakra-ui/react";
import {
  AllophoneProperties,
  EntityDto,
  WordProperties,
} from "../../../models/markup";
import { validate } from "../composables/validate-entity";
import { Props, Select as ChakraReactSelect } from "chakra-react-select";
import { useEffect } from "react";
import { useToastHandler } from "../../../utils/toast-handler";

export interface SelectOption {
  label: string;
  value: number | string;
}

export interface EntityProps {
  entity: EntityDto;
  onEntitySet: (key: string, value: any) => void;
  onSave: () => void;

  languageOptions: SelectOption[];
  phonemeOptions: SelectOption[];
  stressOptions: SelectOption[];
}

const Select = ({
  displayIf,
  ...props
}: Props<SelectOption> & { displayIf?: boolean }) => {
  return (
    <div style={{ display: displayIf !== false ? "block" : "none" }}>
      <ChakraReactSelect {...props} />
    </div>
  );
};

const Entity = ({
  entity,
  onEntitySet,
  onSave,
  stressOptions,
  languageOptions,
  phonemeOptions,
}: EntityProps) => {
  const toastHandler = useToastHandler();

  const validateAndSave = async () => {
    const error = validate(entity);
    if (error) {
      toastHandler.error("Ошибка", error);
    } else {
      try {
        await onSave();
        toastHandler.success("", "Успешно сохранено");
      } catch (error) {
        toastHandler.error("Ошибка", error);
      }
    }
  };

  const onEntityPropertySet = (key: string, value: any) => {
    const properties: any = entity.properties;
    properties[key] = value;
    onEntitySet("properties", properties);
  };
  const displayIf = (condition: boolean) => (condition ? "block" : "none");

  const hasType = !!entity.type;
  const isAllophone = entity.type === "Allophone";
  const isWord = entity.type === "Word";
  const isSentence = entity.type === "Sentence";
  let isVowel = false;

  useEffect(() => {
    const matchingPhoneme = phonemeOptions.find(
      (p) => p.label === entity.value
    ) as any;
    isVowel = !!matchingPhoneme?.isVowel;
  }, [entity]);

  return (
    <Card className="entity" w="600px" p={4} m={2}>
      <FormControl>
        <Flex gap="4px" direction="column">
          <Select
            displayIf={isAllophone}
            placeholder="Фонема"
            options={phonemeOptions}
            value={phonemeOptions.find((o) => o.value === entity.value)}
            onChange={(option: any) => onEntitySet("value", option?.label)}
          />
          <Input
            display={displayIf(hasType && !isAllophone)}
            placeholder="Значение"
            value={entity.value}
            onChange={(event) => onEntitySet("value", event.target.value)}
          />
          <Select
            displayIf={isAllophone}
            placeholder="Ударение"
            options={stressOptions}
            value={stressOptions.find(
              (o) =>
                o.value === (entity.properties as AllophoneProperties).stressId
            )}
            onChange={(option: any) =>
              onEntityPropertySet("stressId", option?.value)
            }
          />
          <Select
            displayIf={isWord}
            placeholder="Язык"
            options={languageOptions}
            value={languageOptions.find(
              (o) =>
                o.value === (entity.properties as WordProperties).languageId
            )}
            onChange={(option: any) =>
              onEntityPropertySet("languageId", option?.value)
            }
          />
          <Input
            display={displayIf(isWord)}
            placeholder="Диалект"
            value={(entity.properties as WordProperties).dialect}
            onChange={(event) =>
              onEntityPropertySet("dialect", event.target.value)
            }
          />
          <Select
            displayIf={!hasType}
            placeholder="Выберите тип сущности"
            options={[
              { label: "Аллофон", value: "Allophone" },
              { label: "Слово", value: "Word" },
              { label: "Предложение", value: "Sentence" },
            ]}
            onChange={(option: any) => onEntitySet("type", option?.value)}
          />
        </Flex>
      </FormControl>
      <Flex justifyContent="center">
        <Button mt={4} onClick={validateAndSave}>
          {entity.type ? "Сохранить" : "Выбрать"}
        </Button>
      </Flex>
    </Card>
  );
};

export default Entity;
